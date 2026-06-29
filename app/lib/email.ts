import { Resend } from "resend";
import { getTranslations } from "./translations";

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
  scheduledAt: Date;
}

const EMAIL_SUBJECTS: Record<string, string> = {
  en: "How was your experience with {brand}?",
  nl: "Hoe was je ervaring met {brand}?",
  de: "Wie war Ihre Erfahrung mit {brand}?",
  sv: "Hur var din upplevelse med {brand}?",
  da: "Hvordan var din oplevelse med {brand}?",
  no: "Hvordan var opplevelsen din med {brand}?",
};

export async function sendReviewEmail(params: SendReviewEmailParams) {
  const { to, customerName, brandName, brandSlug, logoUrl, primaryColor, language, scheduledAt } = params;
  const t = getTranslations(language);
  const subject = (EMAIL_SUBJECTS[language] || EMAIL_SUBJECTS.en).replace("{brand}", brandName);
  const reviewUrl = `https://reviews-verified.com/${brandSlug}`;
  const firstName = customerName.split(" ")[0] || "";

  const greeting: Record<string, string> = {
    en: firstName ? `Hi ${firstName},` : "Hi,",
    nl: firstName ? `Hoi ${firstName},` : "Hoi,",
    de: firstName ? `Hallo ${firstName},` : "Hallo,",
    sv: firstName ? `Hej ${firstName},` : "Hej,",
    da: firstName ? `Hej ${firstName},` : "Hej,",
    no: firstName ? `Hei ${firstName},` : "Hei,",
  };

  const cta: Record<string, string> = {
    en: "Leave your review",
    nl: "Laat je review achter",
    de: "Bewertung abgeben",
    sv: "Lämna din recension",
    da: "Giv din anmeldelse",
    no: "Gi din anmeldelse",
  };

  const unsubscribeText: Record<string, string> = {
    en: "Unsubscribe",
    nl: "Uitschrijven",
    de: "Abmelden",
    sv: "Avprenumerera",
    da: "Afmeld",
    no: "Avmeld",
  };

  const unsubscribeUrl = `https://reviews-verified.com/unsubscribe?email=${encodeURIComponent(to)}`;

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
        <p style="font-size:1rem;color:#1a1a1a;margin:0 0 20px;line-height:1.6;">
          ${greeting[language] || greeting.en}
        </p>
        <p style="font-size:1rem;color:#444;margin:0 0 12px;line-height:1.6;">
          ${t.headingText}
        </p>
        <p style="font-size:0.95rem;color:#777;margin:0 0 28px;line-height:1.5;">
          ${t.subText}
        </p>
        <div style="text-align:center;">
          <a href="${reviewUrl}" style="display:inline-block;padding:14px 36px;background:${primaryColor};color:#fff;text-decoration:none;border-radius:10px;font-size:1rem;font-weight:600;">
            ${cta[language] || cta.en}
          </a>
        </div>
      </div>
    </div>
    <!-- Unsubscribe -->
    <div style="text-align:center;padding:20px 0 0;">
      <a href="${unsubscribeUrl}" style="color:#999;font-size:0.75rem;text-decoration:underline;">
        ${unsubscribeText[language] || unsubscribeText.en}
      </a>
    </div>
  </div>
</body>
</html>`;

  const result = await getResend().emails.send({
    from: `${brandName} <noreply@reviews-verified.com>`,
    to,
    subject,
    html,
    scheduledAt: scheduledAt.toISOString(),
  });

  return result;
}
