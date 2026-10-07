"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/app/lib/translations";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  language: string;
}

type EmailBlock =
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "button"; text: string; url: string; color: string }
  | { type: "divider" }
  | { type: "products" };

interface FlowEmail {
  position: number;
  enabled: boolean;
  delayMinutes: number;
  subject: string;
  body: string;
  blocks: string;
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

const DEFAULT_BODY: Record<string, string> = {
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

Mit freundlichen Grüßen,
{merknaam}`,
  sv: `Hej {voornaam},

Tack för att du är kund hos {merknaam}!

Vi erbjuder dig gärna 50% återbetalning på din beställning.

Med vänliga hälsningar,
{merknaam}`,
  da: `Hej {voornaam},

Tak fordi du er kunde hos {merknaam}!

Vi tilbyder dig gerne 50% refusion på din ordre.

Med venlig hilsen,
{merknaam}`,
  no: `Hei {voornaam},

Takk for at du er kunde hos {merknaam}!

Vi tilbyr deg gjerne 50% refusjon på din bestilling.

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
  en: "Leave your review", nl: "Laat je review achter", de: "Bewertung abgeben",
  sv: "Lämna din recension", da: "Giv din anmeldelse", no: "Gi din anmeldelse",
  pl: "Zostaw opinię",
};

const CHECKOUT_CTA_LABELS: Record<string, string> = {
  en: "Complete your order", nl: "Rond je bestelling af", de: "Bestellung abschließen",
  sv: "Slutför din beställning", da: "Fuldfør din bestilling", no: "Fullfør bestillingen din",
  pl: "Dokończ zamówienie",
};

const DEFAULT_BASIC_SUBJECTS: Record<string, string> = {
  en: "A message from {merknaam}",
  nl: "Een bericht van {merknaam}",
  de: "Eine Nachricht von {merknaam}",
  sv: "Ett meddelande från {merknaam}",
  da: "En besked fra {merknaam}",
  no: "En melding fra {merknaam}",
  pl: "Wiadomość od {merknaam}",
};

const DEFAULT_BASIC_BODY: Record<string, string> = {
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
};

const DEFAULT_AC_SUBJECTS: Record<string, string> = {
  en: "You left something behind, {voornaam}!",
  nl: "Je bent iets vergeten, {voornaam}!",
  de: "Sie haben etwas vergessen, {voornaam}!",
  sv: "Du glömde något, {voornaam}!",
  da: "Du glemte noget, {voornaam}!",
  no: "Du glemte noe, {voornaam}!",
  pl: "Zapomniałeś o czymś, {voornaam}!",
};

const DEFAULT_AC_BODY: Record<string, string> = {
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
};

const inputClass = "px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white";

function delayLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} uur`;
  return `${minutes / 1440} dag${minutes / 1440 !== 1 ? "en" : ""}`;
}

const BLOCK_LABELS: Record<string, string> = {
  text: "Tekst",
  image: "Afbeelding",
  button: "Button",
  divider: "Scheidingslijn",
  products: "Producten",
};

const BASIC_CTA_LABELS: Record<string, string> = {
  en: "Learn more", nl: "Meer informatie", de: "Mehr erfahren",
  sv: "Läs mer", da: "Læs mere", no: "Les mer", pl: "Dowiedz się więcej",
};

function defaultBlocksForFlow(flowType: string, lang: string): EmailBlock[] {
  if (flowType === "abandoned_checkout") {
    return [
      { type: "text", content: DEFAULT_AC_BODY[lang] || DEFAULT_AC_BODY.en },
      { type: "products" },
      { type: "button", text: CHECKOUT_CTA_LABELS[lang] || CHECKOUT_CTA_LABELS.en, url: "{checkout_url}", color: "#000000" },
    ];
  }
  if (flowType === "basic") {
    return [
      { type: "text", content: DEFAULT_BASIC_BODY[lang] || DEFAULT_BASIC_BODY.en },
      { type: "button", text: BASIC_CTA_LABELS[lang] || BASIC_CTA_LABELS.en, url: "{link}", color: "#000000" },
    ];
  }
  return [
    { type: "text", content: DEFAULT_BODY[lang] || DEFAULT_BODY.en },
    { type: "button", text: CTA_LABELS[lang] || CTA_LABELS.en, url: "{link}", color: "#000000" },
  ];
}

function bodyToBlocks(body: string, flowType: string, lang: string): EmailBlock[] {
  const blocks: EmailBlock[] = [{ type: "text", content: body }];
  if (flowType === "abandoned_checkout") {
    blocks.push({ type: "products" });
    blocks.push({ type: "button", text: CHECKOUT_CTA_LABELS[lang] || CHECKOUT_CTA_LABELS.en, url: "{checkout_url}", color: "#000000" });
  } else {
    blocks.push({ type: "button", text: CTA_LABELS[lang] || CTA_LABELS.en, url: "{link}", color: "#000000" });
  }
  return blocks;
}

export default function FlowEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [flowType, setFlowType] = useState<"review" | "abandoned_checkout" | "basic">("review");
  const [emails, setEmails] = useState<FlowEmail[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Block editor state — derived from active email
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [useBlocks, setUseBlocks] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    const [brandsRes, flowRes] = await Promise.all([
      fetch("/api/brands"),
      fetch(`/api/brands/${id}/flow?type=${flowType}`),
    ]);
    const brands: Brand[] = await brandsRes.json();
    const b = brands.find((br) => br.id === id);
    if (!b) return;
    setBrand(b);

    const flow: FlowEmail[] = await flowRes.json();
    if (flow.length > 0) {
      setEmails(flow);
    } else {
      const defaultBlocks = defaultBlocksForFlow(flowType, b.language);
      const subjectMap: Record<string, Record<string, string>> = {
        review: DEFAULT_SUBJECTS,
        abandoned_checkout: DEFAULT_AC_SUBJECTS,
        basic: DEFAULT_BASIC_SUBJECTS,
      };
      const bodyMap: Record<string, Record<string, string>> = {
        review: DEFAULT_BODY,
        abandoned_checkout: DEFAULT_AC_BODY,
        basic: DEFAULT_BASIC_BODY,
      };
      const subjects = subjectMap[flowType] || DEFAULT_SUBJECTS;
      const bodies = bodyMap[flowType] || DEFAULT_BODY;
      setEmails([{
        position: 1,
        enabled: true,
        delayMinutes: flowType === "abandoned_checkout" ? 60 : 30,
        subject: subjects[b.language] || subjects.en,
        body: bodies[b.language] || bodies.en,
        blocks: JSON.stringify(defaultBlocks),
      }]);
    }
    setActiveIdx(0);
  }, [id, flowType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync block state when active email changes
  useEffect(() => {
    const active = emails[activeIdx];
    if (!active) return;
    if (active.blocks) {
      try {
        setBlocks(JSON.parse(active.blocks));
        setUseBlocks(true);
      } catch {
        setBlocks(bodyToBlocks(active.body, flowType, brand?.language || "en"));
        setUseBlocks(false);
      }
    } else {
      setBlocks(bodyToBlocks(active.body, flowType, brand?.language || "en"));
      setUseBlocks(false);
    }
    setSelectedBlock(null);
  }, [activeIdx, emails, flowType, brand?.language]);

  function updateEmail(idx: number, updates: Partial<FlowEmail>) {
    setEmails((prev) => prev.map((e, i) => i === idx ? { ...e, ...updates } : e));
  }

  function syncBlocksToEmail(newBlocks: EmailBlock[]) {
    setBlocks(newBlocks);
    const blocksJson = JSON.stringify(newBlocks);
    // Also update body with text content for backwards compat
    const textContent = newBlocks
      .filter((b): b is { type: "text"; content: string } => b.type === "text")
      .map((b) => b.content)
      .join("\n\n");
    updateEmail(activeIdx, { blocks: blocksJson, body: textContent });
  }

  function switchToBlocks() {
    const active = emails[activeIdx];
    if (!active) return;
    const newBlocks = bodyToBlocks(active.body, flowType, brand?.language || "en");
    setBlocks(newBlocks);
    setUseBlocks(true);
    syncBlocksToEmail(newBlocks);
  }

  function switchToLegacy() {
    setUseBlocks(false);
    updateEmail(activeIdx, { blocks: "" });
  }

  function updateBlock(idx: number, updates: Partial<EmailBlock>) {
    const newBlocks = blocks.map((b, i) => i === idx ? { ...b, ...updates } as EmailBlock : b);
    syncBlocksToEmail(newBlocks);
  }

  function addBlock(type: EmailBlock["type"]) {
    let block: EmailBlock;
    const lang = brand?.language || "en";
    switch (type) {
      case "text": block = { type: "text", content: "" }; break;
      case "image": block = { type: "image", url: "", alt: "" }; break;
      case "button": block = {
        type: "button",
        text: flowType === "abandoned_checkout"
          ? (CHECKOUT_CTA_LABELS[lang] || CHECKOUT_CTA_LABELS.en)
          : (CTA_LABELS[lang] || CTA_LABELS.en),
        url: flowType === "abandoned_checkout" ? "{checkout_url}" : "{link}",
        color: "#000000",
      }; break;
      case "divider": block = { type: "divider" }; break;
      case "products": block = { type: "products" }; break;
      default: return;
    }
    const insertIdx = selectedBlock !== null ? selectedBlock + 1 : blocks.length;
    const newBlocks = [...blocks.slice(0, insertIdx), block, ...blocks.slice(insertIdx)];
    syncBlocksToEmail(newBlocks);
    setSelectedBlock(insertIdx);
  }

  function removeBlock(idx: number) {
    if (blocks.length <= 1) return;
    const newBlocks = blocks.filter((_, i) => i !== idx);
    syncBlocksToEmail(newBlocks);
    setSelectedBlock(null);
  }

  function moveBlock(from: number, to: number) {
    if (to < 0 || to >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, moved);
    syncBlocksToEmail(newBlocks);
    setSelectedBlock(to);
  }

  function handleDragStart(idx: number) {
    dragItem.current = idx;
  }

  function handleDragEnter(idx: number) {
    dragOverItem.current = idx;
  }

  function handleDragEnd() {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      moveBlock(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  }

  function addEmail() {
    if (emails.length >= 5) return;
    const lang = brand?.language || "en";
    const defaultBlocks = defaultBlocksForFlow(flowType, lang);
    const subjectMap: Record<string, Record<string, string>> = {
      review: DEFAULT_SUBJECTS, abandoned_checkout: DEFAULT_AC_SUBJECTS, basic: DEFAULT_BASIC_SUBJECTS,
    };
    const bodyMap: Record<string, Record<string, string>> = {
      review: DEFAULT_BODY, abandoned_checkout: DEFAULT_AC_BODY, basic: DEFAULT_BASIC_BODY,
    };
    const subjects = subjectMap[flowType] || DEFAULT_SUBJECTS;
    const bodies = bodyMap[flowType] || DEFAULT_BODY;
    setEmails((prev) => [...prev, {
      position: prev.length + 1,
      enabled: true,
      delayMinutes: prev.length === 0 ? (flowType === "abandoned_checkout" ? 60 : 30) : 4320,
      subject: subjects[lang] || subjects.en,
      body: bodies[lang] || bodies.en,
      blocks: JSON.stringify(defaultBlocks),
    }]);
    setActiveIdx(emails.length);
  }

  function removeEmail(idx: number) {
    if (emails.length <= 1) return;
    setEmails((prev) => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, position: i + 1 })));
    if (activeIdx >= emails.length - 1) setActiveIdx(Math.max(0, emails.length - 2));
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/brands/${id}/flow`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, flowType }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTestSend() {
    const active = emails[activeIdx];
    if (!testEmail || !active) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/brands/${id}/test-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: active.subject,
          body: active.body,
          flowType,
          blocks: useBlocks ? active.blocks : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult("Testmail verstuurd!");
      } else {
        setTestResult(data.error || "Verzenden mislukt");
      }
    } catch {
      setTestResult("Verzenden mislukt");
    }
    setTestSending(false);
    setTimeout(() => setTestResult(null), 4000);
  }

  function replaceVars(text: string): string {
    const reviewUrl = `https://reviews-verified.com/${brand?.slug || "brand"}`;
    return text
      .replace(/\{voornaam\}/g, "Julia")
      .replace(/\{merknaam\}/g, brand?.name || "Brand")
      .replace(/\{ordernummer\}/g, "#1234")
      .replace(/\{link\}/g, reviewUrl)
      .replace(/\{checkout_url\}/g, "https://shop.example.com/checkout/recover/...");
  }

  if (!brand) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Laden...</div>;

  const lang = brand.language || "en";
  const active = emails[activeIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/admin")} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">E-mail flow — {brand.name}</h1>
        <span className="text-xs text-gray-500">{LANGUAGES[lang]?.flag} {LANGUAGES[lang]?.label}</span>
        <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
          <button onClick={() => setFlowType("review")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${flowType === "review" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Review
          </button>
          <button onClick={() => setFlowType("abandoned_checkout")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${flowType === "abandoned_checkout" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Abandoned Checkout
          </button>
          <button onClick={() => setFlowType("basic")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${flowType === "basic" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Basic Flow
          </button>
        </div>
        <div className="flex-1" />
        {saved && <span className="text-sm text-green-600">Opgeslagen!</span>}
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50">
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Flow steps */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {emails.map((email, idx) => (
            <button key={idx} onClick={() => setActiveIdx(idx)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                activeIdx === idx
                  ? "bg-black text-white"
                  : email.enabled
                    ? "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                    : "bg-gray-100 border border-gray-200 text-gray-400"
              }`}>
              <span>Mail {idx + 1}</span>
              <span className="text-xs opacity-70">{delayLabel(email.delayMinutes)}</span>
            </button>
          ))}
          {emails.length < 5 && (
            <button onClick={addEmail}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 cursor-pointer">
              + Mail toevoegen
            </button>
          )}
        </div>

        {active && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={active.enabled} onChange={(e) => updateEmail(activeIdx, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-black cursor-pointer" />
                  <span className="text-gray-700">Actief</span>
                </label>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-700">Verstuur na:</span>
                  <select value={active.delayMinutes} onChange={(e) => updateEmail(activeIdx, { delayMinutes: Number(e.target.value) })}
                    className={`${inputClass} w-auto`}>
                    <option value={1}>1 minuut (test)</option>
                    <option value={30}>30 minuten</option>
                    <option value={60}>1 uur</option>
                    <option value={120}>2 uur</option>
                    <option value={360}>6 uur</option>
                    <option value={720}>12 uur</option>
                    <option value={1440}>1 dag</option>
                    <option value={2880}>2 dagen</option>
                    <option value={4320}>3 dagen</option>
                    <option value={7200}>5 dagen</option>
                    <option value={10080}>7 dagen</option>
                    <option value={20160}>14 dagen</option>
                  </select>
                </div>

                <div className="flex-1" />
                {emails.length > 1 && (
                  <button onClick={() => removeEmail(activeIdx)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Verwijderen</button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerpregel</label>
                <input type="text" value={active.subject} onChange={(e) => updateEmail(activeIdx, { subject: e.target.value })}
                  className={`${inputClass} w-full`} />
              </div>

              {/* Editor mode toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Editor:</span>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => { if (useBlocks) switchToLegacy(); }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${!useBlocks ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    Tekst
                  </button>
                  <button onClick={() => { if (!useBlocks) switchToBlocks(); }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${useBlocks ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    Blokken
                  </button>
                </div>
              </div>

              {!useBlocks ? (
                <>
                  {/* Legacy text editor */}
                  <div>
                    <textarea value={active.body} onChange={(e) => updateEmail(activeIdx, { body: e.target.value })}
                      rows={14}
                      className={`${inputClass} w-full resize-y font-mono text-xs leading-relaxed`} />
                  </div>
                </>
              ) : (
                <>
                  {/* Block editor */}
                  <div className="space-y-2">
                    {blocks.map((block, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragEnter={() => handleDragEnter(idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => setSelectedBlock(selectedBlock === idx ? null : idx)}
                        className={`border rounded-xl bg-white transition-all ${
                          selectedBlock === idx ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Block header */}
                        <div className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing">
                          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 flex-1">{BLOCK_LABELS[block.type]}</span>
                          <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, idx - 1); }}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, idx + 1); }}
                            disabled={idx === blocks.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {blocks.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); removeBlock(idx); }}
                              className="p-0.5 text-gray-400 hover:text-red-500 cursor-pointer">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>

                        {/* Block editing — only shown when selected */}
                        {selectedBlock === idx && (
                          <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                            {block.type === "text" && (
                              <textarea
                                value={block.content}
                                onChange={(e) => updateBlock(idx, { content: e.target.value })}
                                rows={6}
                                onClick={(e) => e.stopPropagation()}
                                className={`${inputClass} w-full resize-y font-mono text-xs leading-relaxed`}
                              />
                            )}
                            {block.type === "image" && (
                              <div className="space-y-2">
                                <input type="url" value={block.url} onChange={(e) => updateBlock(idx, { url: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Afbeelding URL" className={`${inputClass} w-full`} />
                                <input type="text" value={block.alt} onChange={(e) => updateBlock(idx, { alt: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Alt tekst" className={`${inputClass} w-full`} />
                              </div>
                            )}
                            {block.type === "button" && (
                              <div className="space-y-2">
                                <input type="text" value={block.text} onChange={(e) => updateBlock(idx, { text: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Button tekst" className={`${inputClass} w-full`} />
                                <input type="text" value={block.url} onChange={(e) => updateBlock(idx, { url: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="URL (bijv. {link} of {checkout_url})" className={`${inputClass} w-full font-mono text-xs`} />
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Kleur:</span>
                                  <input type="color" value={block.color} onChange={(e) => updateBlock(idx, { color: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-7 h-7 rounded border border-gray-300 cursor-pointer" />
                                  <span className="text-xs text-gray-400 font-mono">{block.color}</span>
                                </div>
                              </div>
                            )}
                            {block.type === "divider" && (
                              <p className="text-xs text-gray-400">Horizontale scheidingslijn — geen instellingen.</p>
                            )}
                            {block.type === "products" && (
                              <p className="text-xs text-gray-400">Toont automatisch de producten uit de winkelwagen van de klant.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add block buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {(["text", "image", "button", "divider", "products"] as const).map((type) => (
                      <button key={type} onClick={() => addBlock(type)}
                        className="px-3 py-1.5 text-xs font-medium border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 cursor-pointer transition-colors">
                        + {BLOCK_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Variables help */}
              <div className="bg-blue-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-700">Beschikbare variabelen:</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{voornaam}"}</span> — voornaam van de klant</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{merknaam}"}</span> — naam van het merk</p>
                {flowType !== "basic" && (
                  <>
                    <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{ordernummer}"}</span> — ordernummer van de bestelling</p>
                    <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{link}"}</span> — link naar de review-pagina</p>
                  </>
                )}
                {flowType === "abandoned_checkout" && (
                  <>
                    <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{checkout_url}"}</span> — link naar de verlaten winkelwagen</p>
                    <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{producten}"}</span> — producten uit de winkelwagen (in tekst blok)</p>
                  </>
                )}
                {flowType === "basic" && (
                  <>
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <p className="font-medium text-gray-700 mb-1">Eigen variabelen:</p>
                      <p className="text-gray-500 mb-1">Je kunt zelf variabelen bedenken en gebruiken in je tekst. Typ ze als <span className="font-mono bg-white px-1 rounded border border-blue-200">{"{naam}"}</span> in de editor.</p>
                      <p className="text-gray-500">Geef ze mee via het <span className="font-mono bg-white px-1 rounded border border-blue-200">vars</span> object in de trigger API. Voorbeeld:</p>
                      <div className="mt-1.5 bg-white rounded-lg border border-blue-200 p-2 font-mono text-gray-700">
                        {`{ "kortingscode": "ZOMER25", "product": "Sneakers", "url": "https://..." }`}
                      </div>
                      <p className="text-gray-500 mt-1.5">Gebruik dan <span className="font-mono bg-white px-1 rounded border border-blue-200">{"{kortingscode}"}</span>, <span className="font-mono bg-white px-1 rounded border border-blue-200">{"{product}"}</span>, <span className="font-mono bg-white px-1 rounded border border-blue-200">{"{url}"}</span> in je email.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Test email */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Testmail versturen</p>
                <div className="flex gap-2">
                  <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="E-mailadres"
                    className={`${inputClass} flex-1`} />
                  <button onClick={handleTestSend} disabled={testSending || !testEmail}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50 whitespace-nowrap">
                    {testSending ? "Versturen..." : "Verstuur test"}
                  </button>
                </div>
                {testResult && (
                  <p className={`text-xs mt-2 ${testResult.includes("mislukt") ? "text-red-500" : "text-green-600"}`}>
                    {testResult}
                  </p>
                )}
              </div>

              {/* Trigger URL for basic flow */}
              {flowType === "basic" && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Hoe werkt de Basic Flow?</p>
                    <p className="text-xs text-gray-500">Deze flow wordt niet automatisch getriggerd door Shopify, maar via een API call. Ideaal voor Zapier, Make, of je eigen systeem.</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Endpoint</p>
                    <div className="bg-white rounded-lg border border-amber-200 p-2.5 font-mono text-xs text-gray-800 break-all select-all">
                      POST {typeof window !== "undefined" ? window.location.origin : "https://reviews-verified.com"}/api/brands/{id}/trigger
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Voorbeeld request body</p>
                    <pre className="bg-white rounded-lg border border-amber-200 p-2.5 font-mono text-xs text-gray-700 whitespace-pre-wrap">{`{
  "email": "klant@voorbeeld.nl",
  "name": "Jan Jansen",
  "flowType": "basic",
  "vars": {
    "kortingscode": "ZOMER25",
    "product": "Classic Sneakers",
    "url": "https://shop.nl/aanbieding"
  }
}`}</pre>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>email</strong> (verplicht) — e-mailadres van de ontvanger</p>
                    <p><strong>name</strong> (optioneel) — naam, wordt beschikbaar als {"{voornaam}"}</p>
                    <p><strong>vars</strong> (optioneel) — eigen variabelen, elke key wordt een {"{variabele}"} in je email</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preview — Mail {activeIdx + 1}</p>
              <div className={`bg-gray-200 rounded-2xl p-4 ${!active.enabled ? "opacity-50" : ""}`}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Onderwerp</p>
                    <p className="text-sm font-medium text-gray-900">{replaceVars(active.subject)}</p>
                  </div>

                  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                    <div className="text-center py-6 px-4" style={{ borderBottom: `3px solid ${brand.primaryColor}` }}>
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} style={{ maxHeight: 36, width: "auto", display: "inline-block" }} />
                      ) : (
                        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>
                          {brand.name}
                        </span>
                      )}
                    </div>

                    <div className="px-6 py-6">
                      {useBlocks ? (
                        <>
                          {blocks.map((block, idx) => (
                            <div key={idx} className={`${selectedBlock === idx ? "ring-2 ring-blue-300 ring-offset-2 rounded" : ""}`}>
                              {block.type === "text" && (
                                <div>
                                  {replaceVars(block.content).split("\n").map((line, i) => (
                                    <p key={i} className={`text-sm leading-relaxed ${line.trim() === "" ? "h-4" : "text-gray-700"}`}>
                                      {line.includes("{producten}") ? (
                                        <span className="inline-block bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-600 font-mono">Producten worden hier getoond</span>
                                      ) : (line || "\u00A0")}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {block.type === "image" && (
                                <div className="text-center my-4">
                                  {block.url ? (
                                    <img src={block.url} alt={block.alt} style={{ maxWidth: "100%", borderRadius: 8, display: "inline-block" }} />
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-full h-32 bg-gray-100 rounded-lg text-gray-400 text-xs">Afbeelding</div>
                                  )}
                                </div>
                              )}
                              {block.type === "button" && (
                                <div className="text-center mt-6 mb-2">
                                  <span className="inline-block px-8 py-3 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: block.color }}>
                                    {block.text}
                                  </span>
                                </div>
                              )}
                              {block.type === "divider" && (
                                <hr className="my-5 border-t border-gray-200" />
                              )}
                              {block.type === "products" && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 mb-2">
                                  <div className="flex gap-3 items-center">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">Classic Sneakers</p>
                                      <p className="text-xs text-gray-400">42 / White</p>
                                      <p className="text-sm text-gray-600 mt-0.5">&euro;89,95</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 items-center">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">Cotton T-Shirt</p>
                                      <p className="text-xs text-gray-400">M / Black</p>
                                      <p className="text-sm text-gray-600 mt-0.5">&euro;34,95 &times; 2</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {replaceVars(active.body).split("\n").map((line, i) => (
                            <p key={i} className={`text-sm leading-relaxed ${line.trim() === "" ? "h-4" : "text-gray-700"}`}>
                              {line || "\u00A0"}
                            </p>
                          ))}

                          {flowType === "abandoned_checkout" && (
                            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                              <div className="flex gap-3 items-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Classic Sneakers</p>
                                  <p className="text-xs text-gray-400">42 / White</p>
                                  <p className="text-sm text-gray-600 mt-0.5">&euro;89,95</p>
                                </div>
                              </div>
                              <div className="flex gap-3 items-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Cotton T-Shirt</p>
                                  <p className="text-xs text-gray-400">M / Black</p>
                                  <p className="text-sm text-gray-600 mt-0.5">&euro;34,95 &times; 2</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="text-center mt-6">
                            <span className="inline-block px-8 py-3 text-white text-sm font-semibold rounded-lg bg-black">
                              {flowType === "abandoned_checkout"
                                ? (CHECKOUT_CTA_LABELS[lang] || CHECKOUT_CTA_LABELS.en)
                                : (CTA_LABELS[lang] || CTA_LABELS.en)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
