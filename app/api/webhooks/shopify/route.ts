import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

const RESEND_MAX_SCHEDULE_MS = 72 * 60 * 60 * 1000; // 72 hours

export async function POST(request: NextRequest) {
  const shopDomain = request.headers.get("x-shopify-shop-domain") || "";

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

  if (brand.flowEmails.length === 0) {
    return Response.json({ skipped: true, reason: "no flow emails configured" });
  }

  const order = await request.json();

  const email = order.email || order.customer?.email;
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

  const customerName = order.customer
    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
    : "";

  const orderId = String(order.id);
  const orderNumber = order.order_number ? String(order.order_number) : order.name || "";
  const now = Date.now();
  const scheduled: { position: number; scheduledAt: string }[] = [];

  for (const flowEmail of brand.flowEmails) {
    // Check if already sent for this order + position
    const existing = await prisma.sentEmail.findUnique({
      where: {
        brandId_orderId_flowPosition: {
          brandId: brand.id,
          orderId,
          flowPosition: flowEmail.position,
        },
      },
    });
    if (existing) continue;

    const scheduledAt = new Date(now + flowEmail.delayMinutes * 60 * 1000);
    const delayMs = flowEmail.delayMinutes * 60 * 1000;

    if (delayMs <= RESEND_MAX_SCHEDULE_MS) {
      // Within 72h: schedule via Resend directly
      try {
        await sendReviewEmail({
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
          scheduledAt,
        });

        await prisma.sentEmail.create({
          data: {
            brandId: brand.id,
            orderId,
            flowPosition: flowEmail.position,
            customerEmail: email,
            customerName,
            scheduledAt,
            status: "scheduled",
          },
        });

        scheduled.push({ position: flowEmail.position, scheduledAt: scheduledAt.toISOString() });
      } catch (error) {
        console.error(`Flow email ${flowEmail.position} error:`, error);
      }
    } else {
      // Beyond 72h: store as pending, cron will pick it up later
      await prisma.sentEmail.create({
        data: {
          brandId: brand.id,
          orderId,
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

  return Response.json({ success: true, email, scheduled });
}
