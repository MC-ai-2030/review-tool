import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

const WEBHOOK_URL = "https://reviews-verified.com/api/webhooks/shopify";

async function getAccessToken(domain: string, clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token ophalen mislukt: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Connect Shopify: get token via client_credentials + register webhook
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { shopifyDomain, clientId, clientSecret } = await request.json();

  if (!shopifyDomain || !clientId || !clientSecret) {
    return Response.json({ error: "Shopify domein, Client ID en Client Secret zijn verplicht" }, { status: 400 });
  }

  const domain = shopifyDomain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  // Get access token via client_credentials
  let accessToken: string;
  try {
    accessToken = await getAccessToken(domain, clientId, clientSecret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Ongeldige credentials" },
      { status: 400 }
    );
  }

  // Verify by fetching shop info
  const shopRes = await fetch(`https://${domain}/admin/api/2024-01/shop.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });

  if (!shopRes.ok) {
    return Response.json({ error: "Kon geen verbinding maken met de Shopify store." }, { status: 400 });
  }

  // Register webhook for orders/create
  const webhookRes = await fetch(`https://${domain}/admin/api/2024-01/webhooks.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
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
      shopifyClientId: clientId,
      shopifyClientSecret: clientSecret,
      shopifyAccessToken: accessToken,
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

  if (brand.webhookId && brand.shopifyDomain && brand.shopifyAccessToken) {
    await fetch(
      `https://${brand.shopifyDomain}/admin/api/2024-01/webhooks/${brand.webhookId}.json`,
      {
        method: "DELETE",
        headers: { "X-Shopify-Access-Token": brand.shopifyAccessToken },
      }
    ).catch(() => {});
  }

  await prisma.brand.update({
    where: { id },
    data: {
      shopifyDomain: "",
      shopifyClientId: "",
      shopifyClientSecret: "",
      shopifyAccessToken: "",
      webhookId: "",
      emailEnabled: false,
    },
  });

  return Response.json({ success: true });
}
