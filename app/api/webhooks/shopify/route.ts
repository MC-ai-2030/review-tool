import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const shopDomain = request.headers.get("x-shopify-shop-domain") || "";

  // Find brand by Shopify domain
  const brand = await prisma.brand.findFirst({
    where: { shopifyDomain: shopDomain, emailEnabled: true },
  });

  if (!brand) {
    return Response.json({ skipped: true, reason: "brand not found or email disabled" });
  }

  const order = await request.json();

  // Extract customer info
  const email = order.email || order.customer?.email;
  if (!email) {
    return Response.json({ skipped: true, reason: "no customer email" });
  }

  const customerName = order.customer
    ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
    : "";

  const orderId = String(order.id);

  // Check if unsubscribed
  const unsubscribed = await prisma.unsubscribed.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (unsubscribed) {
    return Response.json({ skipped: true, reason: "unsubscribed" });
  }

  // Check if already sent
  const existing = await prisma.sentEmail.findUnique({
    where: { brandId_orderId: { brandId: brand.id, orderId } },
  });
  if (existing) {
    return Response.json({ skipped: true, reason: "already scheduled" });
  }

  // Schedule email
  const scheduledAt = new Date(Date.now() + brand.emailDelayMin * 60 * 1000);

  try {
    await sendReviewEmail({
      to: email,
      customerName,
      brandName: brand.name,
      brandSlug: brand.slug,
      logoUrl: brand.logoUrl,
      primaryColor: brand.primaryColor,
      language: brand.language,
      emailSubject: brand.emailSubject,
      emailBody: brand.emailBody,
      scheduledAt,
    });

    await prisma.sentEmail.create({
      data: {
        brandId: brand.id,
        orderId,
        customerEmail: email,
        customerName,
        scheduledAt,
        status: "scheduled",
      },
    });

    return Response.json({ success: true, email, scheduledAt: scheduledAt.toISOString() });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
