import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { refreshAccessToken } from "@/app/lib/shopify";

const RESEND_MAX_SCHEDULE_MS = 72 * 60 * 60 * 1000;

interface ShopifyCheckout {
  id: number;
  email: string;
  abandoned_checkout_url: string;
  currency: string;
  created_at: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  line_items: {
    title: string;
    price: string;
    quantity: number;
    variant_title: string;
  }[];
}

export async function pollAbandonedCheckouts() {
  const brands = await prisma.brand.findMany({
    where: {
      emailEnabled: true,
      shopifyDomain: { not: "" },
      shopifyAccessToken: { not: "" },
      shopifyClientId: { not: "" },
      shopifyClientSecret: { not: "" },
    },
    include: {
      flowEmails: {
        where: { flowType: "abandoned_checkout", enabled: true },
        orderBy: { position: "asc" },
      },
    },
  });

  let processed = 0;
  let scheduled = 0;
  let skipped = 0;

  for (const brand of brands) {
    if (brand.flowEmails.length === 0) continue;

    try {
      let accessToken: string;
      try {
        accessToken = await refreshAccessToken(brand);
      } catch (error) {
        console.error(`Token refresh failed for ${brand.name}:`, error);
        continue;
      }

      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `https://${brand.shopifyDomain}/admin/api/2024-01/checkouts.json?status=open&created_at_min=${since}&limit=50`,
        { headers: { "X-Shopify-Access-Token": accessToken } }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const checkouts: ShopifyCheckout[] = data.checkouts || [];

      for (const checkout of checkouts) {
        const email = checkout.email || checkout.customer?.email;
        if (!email) continue;

        const checkoutId = String(checkout.id);

        // Skip if already processed
        const existing = await prisma.sentEmail.findFirst({
          where: {
            brandId: brand.id,
            orderId: checkoutId,
            flowType: "abandoned_checkout",
          },
        });
        if (existing) {
          skipped++;
          continue;
        }

        // Skip if customer already completed order after this checkout
        const recentOrder = await prisma.sentEmail.findFirst({
          where: {
            brandId: brand.id,
            customerEmail: email,
            flowType: "review",
            createdAt: { gte: new Date(checkout.created_at) },
          },
        });
        if (recentOrder) {
          skipped++;
          continue;
        }

        // Check unsubscribe
        const unsubscribed = await prisma.unsubscribed.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (unsubscribed) {
          skipped++;
          continue;
        }

        const customerName = checkout.customer
          ? `${checkout.customer.first_name || ""} ${checkout.customer.last_name || ""}`.trim()
          : "";
        const checkoutUrl = checkout.abandoned_checkout_url || "";
        const lineItems = checkout.line_items.map((item) => ({
          title: item.title || "",
          price: item.price || "0",
          quantity: item.quantity || 1,
          variantTitle: item.variant_title || "",
          imageUrl: "",
        }));
        const checkoutCurrency = checkout.currency || "";

        const now = Date.now();
        for (const flowEmail of brand.flowEmails) {
          const scheduledAt = new Date(now + flowEmail.delayMinutes * 60 * 1000);
          const delayMs = flowEmail.delayMinutes * 60 * 1000;

          if (delayMs <= RESEND_MAX_SCHEDULE_MS) {
            try {
              const sentEmail = await prisma.sentEmail.create({
                data: {
                  brandId: brand.id,
                  orderId: checkoutId,
                  flowType: "abandoned_checkout",
                  flowPosition: flowEmail.position,
                  customerEmail: email,
                  customerName,
                  scheduledAt,
                  status: "scheduled",
                  checkoutUrl,
                  checkoutLineItems: JSON.stringify(lineItems),
                  checkoutCurrency,
                },
              });

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
                checkoutUrl,
                lineItems,
                currency: checkoutCurrency,
                trackingId: sentEmail.id,
                scheduledAt,
                flowType: "abandoned_checkout",
                emailBlocks: flowEmail.blocks || undefined,
              });

              scheduled++;
            } catch (error) {
              console.error(`Abandoned checkout email error for ${brand.name}:`, error);
            }
          } else {
            await prisma.sentEmail.create({
              data: {
                brandId: brand.id,
                orderId: checkoutId,
                flowType: "abandoned_checkout",
                flowPosition: flowEmail.position,
                customerEmail: email,
                customerName,
                scheduledAt,
                status: "pending",
                checkoutUrl,
                checkoutLineItems: JSON.stringify(lineItems),
                checkoutCurrency,
              },
            });
            scheduled++;
          }
        }
        processed++;
      }
    } catch (error) {
      console.error(`Failed to fetch checkouts for ${brand.name}:`, error);
    }
  }

  return { processed, scheduled, skipped };
}
