/**
 * Test script: genereert de abandoned checkout email HTML en schrijft naar test-email-output.html
 * Run: npx tsx test-checkout-email.ts
 * Open daarna test-email-output.html in je browser
 */
import fs from "fs";

// Mock de Resend module zodat we geen echte email sturen
const capturedHtml: string[] = [];
const mockResend = {
  emails: {
    send: async (params: { html: string; subject: string; to: string; from: string }) => {
      capturedHtml.push(params.html);
      console.log("Subject:", params.subject);
      console.log("To:", params.to);
      console.log("From:", params.from);
      return { data: { id: "test-123" } };
    },
    cancel: async () => {},
  },
};

// Monkey-patch de Resend import
jest: undefined;
const origModule = await import("resend");
(globalThis as Record<string, unknown>).__mockResend = mockResend;

// Nu importeren we de email functie en overschrijven de Resend instantie
// Simpelere aanpak: we bouwen de HTML zelf op basis van dezelfde logica

const lineItems = [
  {
    title: "Classic Leather Jacket - Black",
    price: "189.00",
    quantity: 1,
    variantTitle: "Size M",
    imageUrl: "https://cdn.shopify.com/s/files/1/0553/7052/0541/products/classic-leather-jacket.jpg?v=1234",
  },
  {
    title: "Silk Scarf - Navy",
    price: "49.00",
    quantity: 2,
    variantTitle: "",
    imageUrl: "",  // test zonder afbeelding
  },
  {
    title: "Wool Blend Coat - Camel",
    price: "299.00",
    quantity: 1,
    variantTitle: "Size L",
    imageUrl: "https://cdn.shopify.com/s/files/1/0553/7052/0541/products/wool-coat.jpg?v=5678",
  },
];

const currency = "GBP";
const currencySymbols: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", SEK: "kr ", DKK: "kr ", NOK: "kr ", PLN: "zł ", CHF: "CHF " };
const currencySymbol = currencySymbols[currency] || "€";

function renderLineItemsHtml(items: typeof lineItems, sym: string): string {
  return `
    <div style="margin:24px 0 8px;border-top:1px solid #eee;padding-top:20px;">
      ${items.map(item => `
        <div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid #f0f0f0;">
          ${item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.title}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #eee;">`
            : `<div style="width:72px;height:72px;background:#f0edea;border-radius:8px;"></div>`
          }
          <div style="flex:1;min-width:0;">
            <p style="margin:0;font-size:0.95rem;font-weight:600;color:#1a1a1a;line-height:1.3;">${item.title}</p>
            ${item.variantTitle && item.variantTitle !== "Default Title" ? `<p style="margin:2px 0 0;font-size:0.8rem;color:#999;">${item.variantTitle}</p>` : ""}
            <p style="margin:6px 0 0;font-size:0.9rem;color:#444;">${sym}${item.price}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</p>
          </div>
        </div>
      `).join("")}
    </div>`;
}

const brandName = "London Rd";
const primaryColor = "#000000";
const logoUrl = "https://londonrd.com/cdn/shop/files/1LD.png?v=1770491899&width=380";
const checkoutUrl = "https://londonrd.com/checkout/recover/abc123";

const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="text-align:center;padding:32px 24px 24px;border-bottom:3px solid ${primaryColor};">
        <img src="${logoUrl}" alt="${brandName}" style="max-height:44px;width:auto;">
      </div>
      <!-- Body -->
      <div style="padding:32px 28px 36px;">
        <p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">Hi Sarah,</p>
        <p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">&nbsp;</p>
        <p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">You left something behind! Your items are still waiting for you.</p>
        <p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">&nbsp;</p>
        <p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">Complete your purchase before they sell out.</p>
        ${renderLineItemsHtml(lineItems, currencySymbol)}
        <div style="text-align:center;margin-top:28px;">
          <a href="${checkoutUrl}" style="display:inline-block;padding:14px 36px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:1rem;font-weight:600;">
            Complete your order
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync("test-email-output.html", html);
console.log("\n✅ Email HTML geschreven naar test-email-output.html");
console.log("   Open in browser: open test-email-output.html");
