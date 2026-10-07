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
  flowType?: string;
  emailBlocks?: string;
  customVars?: Record<string, string>;
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
  fi: "Kerro meille kokemuksestasi – {merknaam}",
  it: "Com'è stata la tua esperienza con {merknaam}?",
  es: "¿Qué tal tu experiencia con {merknaam}?",
  ja: "{merknaam}でのご体験はいかがでしたか？",
  cs: "Jaká byla vaše zkušenost s {merknaam}?",
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
  fi: `Hei {voornaam},

Kiitos, että asioit kanssamme!

Tarjoamme sinulle mielellämme 50 %:n hyvityksen tilauksestasi. Rehellinen arvostelusi auttaa meitä kehittymään, ja arvostamme sitä.

Jätä arvostelusi alla olevasta painikkeesta.

Ystävällisin terveisin,
{merknaam}`,
  it: `Ciao {voornaam},

Grazie per essere cliente di {merknaam}!

Siamo lieti di offrirti un rimborso del 50% sul tuo ordine. La tua recensione sincera ci aiuta a migliorare, e lo apprezziamo molto.

Clicca sul pulsante qui sotto per lasciare la tua recensione.

Cordiali saluti,
{merknaam}`,
  es: `Hola {voornaam}:

¡Gracias por ser cliente de {merknaam}!

Nos complace ofrecerte un reembolso del 50% de tu pedido. Tu reseña sincera nos ayuda a mejorar, y lo valoramos mucho.

Haz clic en el botón de abajo para dejar tu reseña.

Un saludo,
{merknaam}`,
  ja: `{voornaam}様

{merknaam}をご利用いただき、誠にありがとうございます。

ご注文金額の50%を返金させていただきます。率直なレビューは私たちの改善に役立ちます。皆さまの声を大切にしています。

下のボタンからレビューをお寄せください。

よろしくお願いいたします。
{merknaam}`,
  cs: `Dobrý den, {voornaam},

děkujeme, že jste zákazníkem {merknaam}!

Rádi vám nabídneme vrácení 50 % ceny vaší objednávky. Vaše upřímná recenze nám pomáhá se zlepšovat a moc si jí vážíme.

Kliknutím na tlačítko níže zanecháte svou recenzi.

S pozdravem
{merknaam}`,
};

const DEFAULT_BASIC_SUBJECTS: Record<string, string> = {
  en: "A message from {merknaam}",
  nl: "Een bericht van {merknaam}",
  de: "Eine Nachricht von {merknaam}",
  sv: "Ett meddelande från {merknaam}",
  da: "En besked fra {merknaam}",
  no: "En melding fra {merknaam}",
  pl: "Wiadomość od {merknaam}",
  fi: "Viesti meiltä – {merknaam}",
  it: "Un messaggio da {merknaam}",
  es: "Un mensaje de {merknaam}",
  ja: "{merknaam}からのお知らせ",
  cs: "Zpráva od {merknaam}",
};

const DEFAULT_BASIC_BODIES: Record<string, string> = {
  en: `Hi {voornaam},

Thank you for your interest in {merknaam}!

Kind regards,
{merknaam}`,
  nl: `Hoi {voornaam},

Bedankt voor je interesse in {merknaam}!

Met vriendelijke groet,
{merknaam}`,
  de: `Hallo {voornaam},

Vielen Dank für Ihr Interesse an {merknaam}!

Mit freundlichen Grüßen,
{merknaam}`,
  sv: `Hej {voornaam},

Tack för ditt intresse för {merknaam}!

Med vänliga hälsningar,
{merknaam}`,
  da: `Hej {voornaam},

Tak for din interesse i {merknaam}!

Med venlig hilsen,
{merknaam}`,
  no: `Hei {voornaam},

Takk for din interesse i {merknaam}!

Med vennlig hilsen,
{merknaam}`,
  pl: `Cześć {voornaam},

Dziękujemy za zainteresowanie {merknaam}!

Z poważaniem,
{merknaam}`,
  fi: `Hei {voornaam},

Kiitos kiinnostuksestasi!

Ystävällisin terveisin,
{merknaam}`,
  it: `Ciao {voornaam},

Grazie per il tuo interesse in {merknaam}!

Cordiali saluti,
{merknaam}`,
  es: `Hola {voornaam}:

¡Gracias por tu interés en {merknaam}!

Un saludo,
{merknaam}`,
  ja: `{voornaam}様

{merknaam}にご関心をお寄せいただき、ありがとうございます。

よろしくお願いいたします。
{merknaam}`,
  cs: `Dobrý den, {voornaam},

děkujeme za váš zájem o {merknaam}!

S pozdravem
{merknaam}`,
};

const DEFAULT_CHECKOUT_SUBJECTS: Record<string, string> = {
  en: "You left something behind, {voornaam}!",
  nl: "Je bent iets vergeten, {voornaam}!",
  de: "Sie haben etwas vergessen, {voornaam}!",
  sv: "Du glömde något, {voornaam}!",
  da: "Du glemte noget, {voornaam}!",
  no: "Du glemte noe, {voornaam}!",
  pl: "Zapomniałeś o czymś, {voornaam}!",
  fi: "Unohdit jotain, {voornaam}!",
  it: "Hai dimenticato qualcosa, {voornaam}!",
  es: "¡Te has dejado algo, {voornaam}!",
  ja: "{voornaam}様、お忘れ物はありませんか？",
  cs: "Něco jste zapomněli, {voornaam}!",
};

const DEFAULT_CHECKOUT_BODIES: Record<string, string> = {
  en: `Hi {voornaam},

It looks like you left some items in your cart at {merknaam}.

Don't worry — your cart is still saved. Click the button below to complete your order.

Kind regards,
{merknaam}`,
  nl: `Hoi {voornaam},

Het lijkt erop dat je nog wat producten in je winkelwagen hebt achtergelaten bij {merknaam}.

Geen zorgen — je winkelwagen is bewaard. Klik op de knop hieronder om je bestelling af te ronden.

Met vriendelijke groet,
{merknaam}`,
  de: `Hallo {voornaam},

Es sieht so aus, als hätten Sie einige Artikel in Ihrem Warenkorb bei {merknaam} vergessen.

Keine Sorge — Ihr Warenkorb ist gespeichert. Klicken Sie auf den Button unten, um Ihre Bestellung abzuschließen.

Mit freundlichen Grüßen,
{merknaam}`,
  sv: `Hej {voornaam},

Det verkar som att du lämnade några varor i din kundvagn hos {merknaam}.

Oroa dig inte — din kundvagn är sparad. Klicka på knappen nedan för att slutföra din beställning.

Med vänliga hälsningar,
{merknaam}`,
  da: `Hej {voornaam},

Det ser ud til, at du har efterladt nogle varer i din indkøbskurv hos {merknaam}.

Bare rolig — din indkøbskurv er gemt. Klik på knappen nedenfor for at afslutte din ordre.

Med venlig hilsen,
{merknaam}`,
  no: `Hei {voornaam},

Det ser ut som du har lagt igjen noen varer i handlekurven din hos {merknaam}.

Ikke bekymre deg — handlekurven din er lagret. Klikk på knappen nedenfor for å fullføre bestillingen.

Med vennlig hilsen,
{merknaam}`,
  pl: `Cześć {voornaam},

Wygląda na to, że zostawiłeś kilka produktów w koszyku w {merknaam}.

Nie martw się — Twój koszyk jest zapisany. Kliknij przycisk poniżej, aby dokończyć zamówienie.

Z poważaniem,
{merknaam}`,
  fi: `Hei {voornaam},

Näyttää siltä, että ostoskoriisi jäi tuotteita.

Ei hätää — ostoskorisi on tallessa. Viimeistele tilauksesi alla olevasta painikkeesta.

Ystävällisin terveisin,
{merknaam}`,
  it: `Ciao {voornaam},

Sembra che tu abbia lasciato alcuni articoli nel carrello su {merknaam}.

Nessun problema — il tuo carrello è stato salvato. Clicca sul pulsante qui sotto per completare il tuo ordine.

Cordiali saluti,
{merknaam}`,
  es: `Hola {voornaam}:

Parece que has dejado algunos artículos en tu carrito de {merknaam}.

No te preocupes — tu carrito sigue guardado. Haz clic en el botón de abajo para completar tu pedido.

Un saludo,
{merknaam}`,
  ja: `{voornaam}様

{merknaam}のカートに商品が残っているようです。

ご安心ください。カートの内容は保存されています。下のボタンからご注文を完了してください。

よろしくお願いいたします。
{merknaam}`,
  cs: `Dobrý den, {voornaam},

zdá se, že jste v košíku v obchodě {merknaam} nechali nějaké zboží.

Nemusíte se bát — váš košík zůstal uložený. Kliknutím na tlačítko níže dokončíte objednávku.

S pozdravem
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
  fi: "Jätä arvostelu",
  it: "Lascia la tua recensione",
  es: "Deja tu reseña",
  ja: "レビューを書く",
  cs: "Napsat recenzi",
};

const CHECKOUT_CTA_LABELS: Record<string, string> = {
  en: "Complete your order",
  nl: "Rond je bestelling af",
  de: "Bestellung abschließen",
  sv: "Slutför din beställning",
  da: "Fuldfør din bestilling",
  no: "Fullfør bestillingen din",
  pl: "Dokończ zamówienie",
  fi: "Viimeistele tilaus",
  it: "Completa il tuo ordine",
  es: "Completa tu pedido",
  ja: "注文を完了する",
  cs: "Dokončit objednávku",
};

const UNSUBSCRIBE_LABELS: Record<string, string> = {
  en: "Unsubscribe",
  nl: "Uitschrijven",
  de: "Abmelden",
  sv: "Avprenumerera",
  da: "Afmeld",
  no: "Avmeld",
  pl: "Wypisz się",
  fi: "Lopeta sähköpostit",
  it: "Annulla iscrizione",
  es: "Darse de baja",
  ja: "配信停止",
  cs: "Odhlásit odběr",
};

function replaceVars(text: string, vars: { firstName: string; brandName: string; orderNumber: string; reviewUrl: string; checkoutUrl: string }, isHtml: boolean, customVars?: Record<string, string>): string {
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

  // Replace custom variables from trigger API
  if (customVars) {
    for (const [key, value] of Object.entries(customVars)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    }
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

type EmailBlock =
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "button"; text: string; url: string; color: string }
  | { type: "divider" }
  | { type: "products" };

function renderBlocksHtml(
  blocks: EmailBlock[],
  vars: { firstName: string; brandName: string; orderNumber: string; reviewUrl: string; checkoutUrl: string },
  lineItems: LineItem[] | undefined,
  currencySymbol: string,
  customVars?: Record<string, string>,
): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "text": {
        const processed = replaceVars(block.content, vars, true, customVars);
        return processed.split("\n").map((line) => {
          if (line.includes("{producten}")) {
            const parts = line.split("{producten}");
            const productHtml = renderLineItemsHtml(lineItems || [], currencySymbol);
            return parts.join(productHtml);
          }
          return `<p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">${line || "&nbsp;"}</p>`;
        }).join("\n");
      }
      case "image":
        return `<div style="text-align:center;margin:16px 0;"><img src="${block.url}" alt="${block.alt}" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;"></div>`;
      case "button": {
        const buttonUrl = replaceVars(block.url, vars, false, customVars);
        return `<div style="text-align:center;margin-top:28px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${buttonUrl}" style="height:48px;width:220px;" arcsize="21%" fillcolor="${block.color}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">${block.text}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
            <tr>
              <td align="center" bgcolor="${block.color}" style="border-radius:10px;background-color:${block.color};">
                <a href="${buttonUrl}" target="_blank" style="display:block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:1rem;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  ${block.text}
                </a>
              </td>
            </tr>
          </table>
          <!--<![endif]-->
        </div>`;
      }
      case "divider":
        return `<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">`;
      case "products":
        return renderLineItemsHtml(lineItems || [], currencySymbol);
      default:
        return "";
    }
  }).join("\n");
}

export async function sendReviewEmail(params: SendReviewEmailParams) {
  const { to, customerName, brandName, brandSlug, logoUrl, primaryColor, language, emailSubject, emailBody, senderEmail, senderName, orderNumber, checkoutUrl, lineItems, currency, trackingId, scheduledAt, flowType, emailBlocks, customVars } = params;
  const currencySymbols: Record<string, string> = { GBP: "£", EUR: "€", USD: "$", SEK: "kr ", DKK: "kr ", NOK: "kr ", PLN: "zł ", CHF: "CHF ", JPY: "¥", CZK: "Kč " };
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
  const isCheckoutFlow = flowType === "abandoned_checkout";
  const defaultSubjectsMap: Record<string, Record<string, string>> = {
    abandoned_checkout: DEFAULT_CHECKOUT_SUBJECTS,
    basic: DEFAULT_BASIC_SUBJECTS,
  };
  const defaultBodiesMap: Record<string, Record<string, string>> = {
    abandoned_checkout: DEFAULT_CHECKOUT_BODIES,
    basic: DEFAULT_BASIC_BODIES,
  };
  const defaultSubjects = defaultSubjectsMap[flowType || ""] || DEFAULT_SUBJECTS;
  const defaultBodies = defaultBodiesMap[flowType || ""] || DEFAULT_BODIES;
  const rawSubject = emailSubject || defaultSubjects[language] || defaultSubjects.en;
  const rawBody = emailBody || defaultBodies[language] || defaultBodies.en;
  const subject = replaceVars(rawSubject, vars, false, customVars);
  const bodyText = replaceVars(rawBody, vars, true, customVars);

  // Determine inner body content: block-based or legacy
  let innerBodyHtml: string;

  if (emailBlocks) {
    // Block-based email content
    const parsedBlocks: EmailBlock[] = JSON.parse(emailBlocks);
    innerBodyHtml = renderBlocksHtml(parsedBlocks, vars, lineItems, currencySymbol, customVars);
  } else {
    // Legacy: body text + line items + CTA button
    const isCheckout = isCheckoutFlow || (lineItems && lineItems.length > 0);
    const ctaLabel = isCheckout
      ? (CHECKOUT_CTA_LABELS[language] || CHECKOUT_CTA_LABELS.en)
      : (CTA_LABELS[language] || CTA_LABELS.en);

    const bodyHtml = bodyText.split("\n").map((line) =>
      `<p style="font-size:1rem;color:#444;margin:0 0 4px;line-height:1.6;">${line || "&nbsp;"}</p>`
    ).join("\n");

    innerBodyHtml = `${bodyHtml}
        ${lineItems && lineItems.length > 0 ? renderLineItemsHtml(lineItems, currencySymbol) : ""}
        <div style="text-align:center;margin-top:28px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${trackedCheckoutUrl || reviewUrl}" style="height:48px;width:220px;" arcsize="21%" fillcolor="#000000">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">${ctaLabel}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
            <tr>
              <td align="center" bgcolor="#000000" style="border-radius:10px;background-color:#000000;">
                <a href="${trackedCheckoutUrl || reviewUrl}" target="_blank" style="display:block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:1rem;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  ${ctaLabel}
                </a>
              </td>
            </tr>
          </table>
          <!--<![endif]-->
        </div>`;
  }

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
        ${innerBodyHtml}
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
