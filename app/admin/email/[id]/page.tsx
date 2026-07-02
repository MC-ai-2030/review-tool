"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LANGUAGES } from "@/app/lib/translations";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  language: string;
  emailSubject: string;
  emailBody: string;
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

const inputClass = "px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white";

export default function EmailEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchBrand = useCallback(async () => {
    const res = await fetch("/api/brands");
    const brands: Brand[] = await res.json();
    const b = brands.find((br) => br.id === id);
    if (!b) return;
    setBrand(b);
    setSubject(b.emailSubject || DEFAULT_SUBJECTS[b.language] || DEFAULT_SUBJECTS.en);
    setBody(b.emailBody || DEFAULT_BODIES[b.language] || DEFAULT_BODIES.en);
  }, [id]);

  useEffect(() => { fetchBrand(); }, [fetchBrand]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailSubject: subject, emailBody: body }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function replaceVars(text: string): string {
    return text
      .replace(/\{voornaam\}/g, "Julia")
      .replace(/\{merknaam\}/g, brand?.name || "Brand");
  }

  if (!brand) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Laden...</div>;

  const lang = brand.language || "en";
  const previewSubject = replaceVars(subject);
  const previewBody = replaceVars(body);
  const ctaLabel = CTA_LABELS[lang] || CTA_LABELS.en;
  const unsubLabel = UNSUBSCRIBE_LABELS[lang] || UNSUBSCRIBE_LABELS.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/admin")} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">E-mail bewerken — {brand.name}</h1>
        <span className="text-xs text-gray-500">{LANGUAGES[lang]?.flag} {LANGUAGES[lang]?.label}</span>
        <div className="flex-1" />
        {saved && <span className="text-sm text-green-600">Opgeslagen!</span>}
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50">
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Onderwerpregel</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className={`${inputClass} w-full`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail tekst</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)}
                rows={16}
                className={`${inputClass} w-full resize-y font-mono text-xs leading-relaxed`} />
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">Beschikbare variabelen:</p>
              <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{voornaam}"}</span> — voornaam van de klant</p>
              <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{merknaam}"}</span> — naam van het merk</p>
              <p className="text-gray-400 pt-1">De review-knop en uitschrijflink worden automatisch toegevoegd.</p>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="bg-gray-200 rounded-2xl p-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Subject preview */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Onderwerp</p>
                  <p className="text-sm font-medium text-gray-900">{previewSubject}</p>
                </div>

                {/* Email preview */}
                <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                  {/* Header */}
                  <div className="text-center py-6 px-4" style={{ borderBottom: `3px solid ${brand.primaryColor}` }}>
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} style={{ maxHeight: 36, width: "auto", display: "inline-block" }} />
                    ) : (
                      <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>
                        {brand.name}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="px-6 py-6">
                    {previewBody.split("\n").map((line, i) => (
                      <p key={i} className={`text-sm leading-relaxed ${line.trim() === "" ? "h-4" : "text-gray-700"}`}>
                        {line || "\u00A0"}
                      </p>
                    ))}

                    {/* CTA button */}
                    <div className="text-center mt-6">
                      <span className="inline-block px-8 py-3 text-white text-sm font-semibold rounded-lg"
                        style={{ backgroundColor: brand.primaryColor }}>
                        {ctaLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Unsubscribe */}
                <div className="text-center py-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400 underline">{unsubLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
