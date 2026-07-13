import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail, cancelScheduledEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

const RESEND_MAX_SCHEDULE_MS = 72 * 60 * 60 * 1000;

async function scheduleFlowEmails(
  brand: { id: string; name: string; slug: string; logoUrl: string; primaryColor: string; language: string; senderEmail: string; senderName: string; flowEmails: { flowType: string; position: number; enabled: boolean; delayMinutes: number; subject: string; body: string }[] },
  flowType: string,
  triggerId: string,
  email: string,
  customerName: string,
  orderNumber: string,
  checkoutUrl: string,
) {
  const flowEmails = brand.flowEmails.filter((fe) => fe.flowType === flowType && fe.enabled);
  if (flowEmails.length === 0) return [];

  const now = Date.now();
  const scheduled: { position: number; scheduledAt: string }[] = [];

  for (const flowEmail of flowEmails) {
    const existing = await prisma.sentEmail.findUnique({
      where: {
        brandId_orderId_flowType_flowPosition: {
          brandId: brand.id,
          orderId: triggerId,
          flowType,
          flowPosition: flowEmail.position,
        },
      },
    });
    if (existing) continue;

    const scheduledAt = new Date(now + flowEmail.delayMinutes * 60 * 1000);
    const delayMs = flowEmail.delayMinutes * 60 * 1000;

    if (delayMs <= RESEND_MAX_SCHEDULE_MS) {
      try {
        const result = await sendReviewEmail({
          to: email,
          customerName,
          brandName: brand.name,
          brandSlug: brand.slug,
          logoUrl: brand.logoUrl,
          primaryColor: brand.primaryColor,
          language: brand.language,
          emailSubject: flowEmail.subject,
          emailBody: flowEmail.body,
          senderEmail: brand.senderEmail || undefined,
          senderName: brand.senderName || undefined,
          orderNumber,
          checkoutUrl: flowType === "abandoned_checkout" ? checkoutUrl : undefined,
          scheduledAt,
        });

        const resendEmailId = (result as { data?: { id?: string } })?.data?.id || "";

        await prisma.sentEmail.create({
          data: {
            brandId: brand.id,
            orderId: triggerId,
            flowType,
            flowPosition: flowEmail.position,
            customerEmail: email,
            customerName,
            resendEmailId,
            scheduledAt,
            status: "scheduled",
          },
        });

        scheduled.push({ position: flowEmail.position, scheduledAt: scheduledAt.toISOString() });
      } catch (error) {
        console.error(`Flow ${flowType} email ${flowEmail.position} error:`, error);
      }
    } else {
      await prisma.sentEmail.create({
        data: {
          brandId: brand.id,
          orderId: triggerId,
          flowType,
          flowPosition: flowEmail.position,
          customerEmail: email,
          customerName,
          scheduledAt,
          status: "pending",
        },
      });
      scheduled.push({ position: flowEmail.position, scheduledAt: scheduledAt.toISOString() });
    }
  }

  return scheduled;
}

export async function POST(request: NextRequest) {
  const shopDomain = request.headers.get("x-shopify-shop-domain") || "";
  const topic = request.headers.get("x-shopify-topic") || "";

  const brand = await prisma.brand.findFirst({
    where: { shopifyDomain: shopDomain, emailEnabled: true },
    include: {
      flowEmails: {
        where: { enabled: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!brand) {
    return Response.json({ skipped: true, reason: "brand not found or email disabled" });
  }

  const payload = await request.json();

  const email = payload.email || payload.customer?.email;
  if (!email) {
    return Response.json({ skipped: true, reason: "no customer email" });
  }

  // Check if unsubscribed
  const unsubscribed = await prisma.unsubscribed.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (unsubscribed) {
    return Response.json({ skipped: true, reason: "unsubscribed" });
  }

  const customerName = payload.customer
    ? `${payload.customer.first_name || ""} ${payload.customer.last_name || ""}`.trim()
    : "";

  // Handle checkouts/create → abandoned checkout flow
  if (topic === "checkouts/create" || topic === "checkouts/update") {
    const checkoutId = String(payload.id);
    const checkoutUrl = payload.abandoned_checkout_url || payload.recovery_url || "";

    const scheduled = await scheduleFlowEmails(
      brand, "abandoned_checkout", checkoutId, email, customerName, "", checkoutUrl
    );

    return Response.json({ success: true, flow: "abandoned_checkout", email, scheduled });
  }

  // Handle orders/create → cancel abandoned checkout emails + start review flow
  if (topic === "orders/create") {
    // Cancel any pending abandoned checkout emails for this customer
    const pendingCheckoutEmails = await prisma.sentEmail.findMany({
      where: {
        brandId: brand.id,
        customerEmail: email,
        flowType: "abandoned_checkout",
        status: { in: ["scheduled", "pending"] },
      },
    });

    for (const pending of pendingCheckoutEmails) {
      if (pending.resendEmailId) {
        await cancelScheduledEmail(pending.resendEmailId);
      }
      await prisma.sentEmail.update({
        where: { id: pending.id },
        data: { status: "cancelled" },
      });
    }

    // Schedule review flow
    const orderId = String(payload.id);
    const orderNumber = payload.order_number ? String(payload.order_number) : payload.name || "";

    const scheduled = await scheduleFlowEmails(
      brand, "review", orderId, email, customerName, orderNumber, ""
    );

    return Response.json({ success: true, flow: "review", email, cancelled_checkout_emails: pendingCheckoutEmails.length, scheduled });
  }

  return Response.json({ skipped: true, reason: `unhandled topic: ${topic}` });
}
