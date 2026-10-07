import { prisma } from "./prisma";

export async function refreshAccessToken(brand: {
  id: string;
  shopifyDomain: string;
  shopifyClientId: string;
  shopifyClientSecret: string;
  shopifyAccessToken: string;
}): Promise<string> {
  // First try existing token
  const testRes = await fetch(`https://${brand.shopifyDomain}/admin/api/2024-01/shop.json`, {
    headers: { "X-Shopify-Access-Token": brand.shopifyAccessToken },
  });

  if (testRes.ok) {
    return brand.shopifyAccessToken;
  }

  // Token expired — refresh via client_credentials
  if (!brand.shopifyClientId || !brand.shopifyClientSecret) {
    throw new Error("Missing Shopify credentials for token refresh");
  }

  const tokenRes = await fetch(`https://${brand.shopifyDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: brand.shopifyClientId,
      client_secret: brand.shopifyClientSecret,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token refresh failed: ${await tokenRes.text()}`);
  }

  const data = await tokenRes.json();
  const newToken = data.access_token;

  // Save new token to database
  await prisma.brand.update({
    where: { id: brand.id },
    data: { shopifyAccessToken: newToken },
  });

  return newToken;
}
