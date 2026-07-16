import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface LineItem {
  title: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  variantTitle?: string;
}

interface SendReviewEmailParams {
  to: string;
  customerName: string;
  brandName: string;
  brandSlug: string;
  logoUrl: string;
  primaryColor: string;
  language: string;
  emailSubject: string;
  emailBody: string;
  senderEmail?: string;
  senderName?: string;
  orderNumber?: string;
  checkoutUrl?: string;
  lineItems?: LineItem[];
  currency?: string;
  trackingId?: string;
  scheduledAt?: Date;
}

export async function cancelScheduledEmail(resendEmailId: string) {
  if (!resendEmailId) return;
  try {
    await getResend().emails.cancel(resendEmailId);
  } catch {
    // Already sent or invalid — ignore
  }
}

const DEFAULT_SUBJECTS: Record<string, string> = {
  en: "How was your experience with {merknaam}?",
  nl: "Hoe was je ervaring met {merknaam}?",
  de: "Wie war Ihre Erfahrung mit {merknaam}?",
  sv: "Hur var din upplevelse med {merknaam}?",
  da: "Hvordan var din oplevelse med {merknaam}?",
  no: "Hvordan var opplevelsen din med {merknaam}?",
  pl: "Jak oceniasz swoje doświadczenie z {merknaam}?",
};

const DEFAULT_BODIES: Record<string, string> = {
  en: `Hi {voornaam},

Thank you for being a customer of {merknaam}!

We're happy to offer you a 50% refund on your order. Your honest review helps us improve, and we value that.

Click the button below to leave your review.

Kind regards,
{merknaam}`,
  nl: `Hoi {voornaam},

Bedankt dat je klant bent bij {merknaam}!

We bieden je graag 50% restitutie aan op je bestelling. Jouw eerlijke review helpt ons verbeteren, en dat waarderen we.

Klik op de knop hieronder om je review achter te laten.

Met vriendelijke groet,
{merknaam}`,
  de: `Hallo {voornaam},

Vielen Dank, dass Sie Kunde bei {merknaam} sind!

Wir bieten Ihnen gerne 50% Erstattung auf Ihre Bestellung. Ihre ehrliche Bewertung hilft uns, besser zu werden.

Klicken Sie auf den Button unten, um Ihre Bewertung abzugeben.

Mit freundlichen Grüßen,
{merknaam}`,
  sv: `Hej {voornaam},

Tack för att du är kund hos {merknaam}!

Vi erbjuder dig gärna 50% återbetalning på din beställning. Din ärliga recension hjälper oss att förbättras.

Klicka på knappen nedan för att lämna din recension.

Med vänliga hälsningar,
{merknaam}`,
  da: `Hej {voornaam},

Tak fordi du er kunde hos {merknaam}!

Vi tilbyder dig gerne 50% refusion på din ordre. Din ærlige anmeldelse hjælper os med at forbedre os.

Klik på knappen nedenfor for at give din anmeldelse.

Med venlig hilsen,
{merknaam}`,
  no: `Hei {voornaam},

Takk for at du er kunde hos {merknaam}!

Vi tilbyr deg gjerne 50% refusjon på din bestilling. Din ærlige anmeldelse hjelper oss å bli bedre.

Klikk på knappen nedenfor for å gi din anmeldelse.

Med vennlig hilsen,
{merknaam}`,
  pl: `Cześć {voornaam},

Dziękujemy, że jesteś klientem {merknaam}!

Z przyjemnością oferujemy Ci 50% zwrotu za zamówienie. Twoja szczera opinia pomaga nam się rozwijać.

Kliknij przycisk poniżej, aby zostawić swoją opinię.

Z poważaniem,
{merknaam}`,
};

const CTA_LABELS: Record<string, string> = {
  en: "Leave your review",
  nl: "Laat je review achter",
  de: "Bewertung abgeben",
  sv: "Lämna din recension",
  da: "Giv din anmeldelse",
  no: "Gi din anmeldelse",
  pl: "Zostaw opinię",
};

const CHECKOUT_CTA_LABELS: Record<string, string> = {
  en: "Complete your order",
  nl: "Rond je bestelling af",
  de: "Bestellung abschließen",
  sv: "Slutför din beställning",
  da: "Fuldfør din bestilling",
  no: "Fullfør bestillingen din",
  pl: "Dokończ zamówienie",
};

const UNSUBSCRIBE_LABELS: Record<string, string> = {
  en: "Unsubscribe",
  nl: "Uitschrijven",
  de: "Abmelden",
  sv: "Avprenumerera",
  da: "Afmeld",
  no: "Avmeld",
};

function replaceVars(text: string, vars: { firstName: string; brandName: string; orderNumber: string; reviewUrl: string; checkoutUrl: string }, isHtml: boolean): string {
  let result = text
    .replace(/\{voornaam\}/g, vars.firstName || "")
    .replace(/\{merknaam\}/g, vars.brandName)
    .replace(/\{ordernummer\}/g, vars.orderNumber || "");

  if (isHtml) {
    result = result
      .replace(/\{link\}/g, `<a href="${vars.reviewUrl}" style="color:#1a1a1a;font-weight:600;">${vars.reviewUrl}</a>`)
      .replace(/\{checkout_url\}/g, `<a href="${vars.checkoutUrl}" style="color:#1a1a1a;font-weight:600;">${vars.checkoutUrl}</a>`);
  } else {
    result = result
      .replace(/\{link\}/g, vars.reviewUrl)
      .replace(/\{checkout_url\}/g, vars.checkoutUrl);
  }

  return result;
}

function renderLineItemsHtml(items: LineItem[], currency: string): string {
  if (!items || items.length === 0) return "";
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
            <p style="margin:6px 0 0;font-size:0.9rem;color:#444;">${currency}${item.price}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</p>
          </div>
        </div>
      `).join("")}
    </div>`;
}

export async function sendReviewEmail(params: SendReviewEmailParams) {
  const { to, customerName, brandName, brandSlug, logoUrl, primaryColor, language, emailSubject, emailBody, senderEmail, senderName, orderNumber, checkoutUrl, lineItems, currency, trackingId, scheduledAt } = params;
  const currencySymbols: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", SEK: "kr ", DKK: "kr ", NOK: "kr ", PLN: "zł ", CHF: "CHF " };
  const currencySymbol = currencySymbols[currency || ""] || (currency ? currency + " " : "€");
  const firstName = customerName.split(" ")[0] || "";
  const rawReviewUrl = `https://reviews-verified.com/${brandSlug}`;
  const rawCheckoutUrl = checkoutUrl || "";

  // Wrap URLs in tracker if trackingId is available
  const reviewUrl = trackingId
    ? `https://reviews-verified.com/api/track/${trackingId}?url=${encodeURIComponent(rawReviewUrl)}`
    : rawReviewUrl;
  const trackedCheckoutUrl = trackingId && rawCheckoutUrl
    ? `https://reviews-verified.com/api/track/${trackingId}?url=${encodeURIComponent(rawCheckoutUrl)}`
    : rawCheckoutUrl;

  const vars = { firstName, brandName, orderNumber: orderNumber || "", reviewUrl, checkoutUrl: trackedCheckoutUrl };
  const rawSubject = emailSubject || DEFAULT_SUBJECTS[language] || DEFAULT_SUBJECTS.en;
  const rawBody = emailBody || DEFAULT_BODIES[language] || DEFAULT_BODIES.en;
  const subject = replaceVars(rawSubject, vars, false);
  const bodyText = replaceVars(rawBody, vars, true);

  const isCheckout = lineItems && lineItems.length > 0;
  const ctaLabel = isCheckout
    ? (CHECKOUT_CTA_LABELS[language] || CHECKOUT_CTA_LABELS.en)
    : (CTA_LABELS[language] || CTA_LABELS.en);

  const bodyHtml = bodyText.split("\n").map((line) =>
    `<p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">${line || "&nbsp;"}</p>`
  ).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f3f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="text-align:center;padding:32px 24px 24px;border-bottom:3px solid ${primaryColor};">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:44px;width:auto;">`
          : `<span style="font-family:Georgia,'Times New Roman',serif;font-size:1.8rem;font-weight:700;color:#1a1a1a;">${brandName}</span>`
        }
      </div>
      <!-- Body -->
      <div style="padding:32px 28px 36px;">
        ${bodyHtml}
        ${lineItems && lineItems.length > 0 ? renderLineItemsHtml(lineItems, currencySymbol) : ""}
        <div style="text-align:center;margin-top:28px;">
          <a href="${trackedCheckoutUrl || reviewUrl}" style="display:inline-block;padding:14px 36px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:1rem;font-weight:600;">
            ${ctaLabel}
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const fromName = senderName || brandName;
  const fromEmail = senderEmail || "noreply@reviews-verified.com";

  const result = await getResend().emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    ...(scheduledAt ? { scheduledAt: scheduledAt.toISOString() } : {}),
  });

  return result;
}
