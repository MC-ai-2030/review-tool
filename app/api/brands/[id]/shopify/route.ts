import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

const WEBHOOK_URL = "https://reviews-verified.com/api/webhooks/shopify";

// Connect Shopify: register webhook
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shopifyDomain, shopifyToken } = await request.json();

  if (!shopifyDomain || !shopifyToken) {
    return Response.json({ error: "Shopify domein en token zijn verplicht" }, { status: 400 });
  }

  const domain = shopifyDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  // Verify credentials by fetching shop info
  const shopRes = await fetch(`https://${domain}/admin/api/2024-01/shop.json`, {
    headers: { "X-Shopify-Access-Token": shopifyToken },
  });

  if (!shopRes.ok) {
    return Response.json({ error: "Ongeldige Shopify credentials. Controleer domein en token." }, { status: 400 });
  }

  // Register webhook for orders/create
  const webhookRes = await fetch(`https://${domain}/admin/api/2024-01/webhooks.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": shopifyToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      webhook: {
        topic: "orders/create",
        address: WEBHOOK_URL,
        format: "json",
      },
    }),
  });

  if (!webhookRes.ok) {
    const err = await webhookRes.text();
    return Response.json({ error: `Webhook registratie mislukt: ${err}` }, { status: 400 });
  }

  const webhookData = await webhookRes.json();
  const webhookId = String(webhookData.webhook.id);

  // Save to database
  await prisma.brand.update({
    where: { id },
    data: {
      shopifyDomain: domain,
      shopifyToken,
      webhookId,
      emailEnabled: true,
    },
  });

  return Response.json({ success: true, webhookId });
}

// Disconnect Shopify: remove webhook
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUniqueOrThrow({ where: { id } });

  if (brand.webhookId && brand.shopifyDomain && brand.shopifyToken) {
    await fetch(
      `https://${brand.shopifyDomain}/admin/api/2024-01/webhooks/${brand.webhookId}.json`,
      {
        method: "DELETE",
        headers: { "X-Shopify-Access-Token": brand.shopifyToken },
      }
    ).catch(() => {});
  }

  await prisma.brand.update({
    where: { id },
    data: {
      shopifyDomain: "",
      shopifyToken: "",
      webhookId: "",
      emailEnabled: false,
    },
  });

  return Response.json({ success: true });
}
