import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
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
  scheduledAt?: Date;
}

const DEFAULT_SUBJECTS: Record<string, string> = {
  en: "How was your experience with {merknaam}?",
  nl: "Hoe was je ervaring met {merknaam}?",
  de: "Wie war Ihre Erfahrung mit {merknaam}?",
  sv: "Hur var din upplevelse med {merknaam}?",
  da: "Hvordan var din oplevelse med {merknaam}?",
  no: "Hvordan var opplevelsen din med {merknaam}?",
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
};

const CTA_LABELS: Record<string, string> = {
  en: "Leave your review",
  nl: "Laat je review achter",
  de: "Bewertung abgeben",
  sv: "Lämna din recension",
  da: "Giv din anmeldelse",
  no: "Gi din anmeldelse",
};

const UNSUBSCRIBE_LABELS: Record<string, string> = {
  en: "Unsubscribe",
  nl: "Uitschrijven",
  de: "Abmelden",
  sv: "Avprenumerera",
  da: "Afmeld",
  no: "Avmeld",
};

function replaceVars(text: string, firstName: string, brandName: string, orderNumber: string, reviewUrl: string, isHtml: boolean): string {
  let result = text
    .replace(/\{voornaam\}/g, firstName || "")
    .replace(/\{merknaam\}/g, brandName)
    .replace(/\{ordernummer\}/g, orderNumber || "");

  if (isHtml) {
    result = result.replace(/\{link\}/g, `<a href="${reviewUrl}" style="color:#1a1a1a;font-weight:600;">${reviewUrl}</a>`);
  } else {
    result = result.replace(/\{link\}/g, reviewUrl);
  }

  return result;
}

export async function sendReviewEmail(params: SendReviewEmailParams) {
  const { to, customerName, brandName, brandSlug, logoUrl, primaryColor, language, emailSubject, emailBody, senderEmail, senderName, orderNumber, scheduledAt } = params;
  const firstName = customerName.split(" ")[0] || "";
  const reviewUrl = `https://reviews-verified.com/${brandSlug}`;

  const rawSubject = emailSubject || DEFAULT_SUBJECTS[language] || DEFAULT_SUBJECTS.en;
  const rawBody = emailBody || DEFAULT_BODIES[language] || DEFAULT_BODIES.en;
  const subject = replaceVars(rawSubject, firstName, brandName, orderNumber || "", reviewUrl, false);
  const bodyText = replaceVars(rawBody, firstName, brandName, orderNumber || "", reviewUrl, true);

  const ctaLabel = CTA_LABELS[language] || CTA_LABELS.en;

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
        <div style="text-align:center;margin-top:28px;">
          <a href="${reviewUrl}" style="display:inline-block;padding:14px 36px;background:#000000;color:#fff;text-decoration:none;border-radius:10px;font-size:1rem;font-weight:600;">
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
