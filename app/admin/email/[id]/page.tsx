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
}

interface FlowEmail {
  position: number;
  enabled: boolean;
  delayMinutes: number;
  subject: string;
  body: string;
}

const DEFAULT_SUBJECTS: Record<string, string> = {
  en: "How was your experience with {merknaam}?",
  nl: "Hoe was je ervaring met {merknaam}?",
  de: "Wie war Ihre Erfahrung mit {merknaam}?",
  sv: "Hur var din upplevelse med {merknaam}?",
  da: "Hvordan var din oplevelse med {merknaam}?",
  no: "Hvordan var opplevelsen din med {merknaam}?",
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
};

const CTA_LABELS: Record<string, string> = {
  en: "Leave your review", nl: "Laat je review achter", de: "Bewertung abgeben",
  sv: "Lämna din recension", da: "Giv din anmeldelse", no: "Gi din anmeldelse",
};

const UNSUB_LABELS: Record<string, string> = {
  en: "Unsubscribe", nl: "Uitschrijven", de: "Abmelden",
  sv: "Avprenumerera", da: "Afmeld", no: "Avmeld",
};

const inputClass = "px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white";

function delayLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} uur`;
  return `${minutes / 1440} dag${minutes / 1440 !== 1 ? "en" : ""}`;
}

export default function FlowEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [emails, setEmails] = useState<FlowEmail[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [brandsRes, flowRes] = await Promise.all([
      fetch("/api/brands"),
      fetch(`/api/brands/${id}/flow`),
    ]);
    const brands: Brand[] = await brandsRes.json();
    const b = brands.find((br) => br.id === id);
    if (!b) return;
    setBrand(b);

    const flow: FlowEmail[] = await flowRes.json();
    if (flow.length > 0) {
      setEmails(flow);
    } else {
      // Create default first email
      setEmails([{
        position: 1,
        enabled: true,
        delayMinutes: 30,
        subject: DEFAULT_SUBJECTS[b.language] || DEFAULT_SUBJECTS.en,
        body: DEFAULT_BODY[b.language] || DEFAULT_BODY.en,
      }]);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function updateEmail(idx: number, updates: Partial<FlowEmail>) {
    setEmails((prev) => prev.map((e, i) => i === idx ? { ...e, ...updates } : e));
  }

  function addEmail() {
    if (emails.length >= 5) return;
    const lang = brand?.language || "en";
    setEmails((prev) => [...prev, {
      position: prev.length + 1,
      enabled: true,
      delayMinutes: prev.length === 0 ? 30 : 4320, // first: 30min, rest: 3 days
      subject: DEFAULT_SUBJECTS[lang] || DEFAULT_SUBJECTS.en,
      body: DEFAULT_BODY[lang] || DEFAULT_BODY.en,
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
      body: JSON.stringify({ emails }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTestSend() {
    if (!testEmail || !active) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/brands/${id}/test-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail, subject: active.subject, body: active.body }),
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
      .replace(/\{link\}/g, reviewUrl);
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
        <h1 className="text-lg font-bold">E-mail flow — {brand.name}</h1>
        <span className="text-xs text-gray-500">{LANGUAGES[lang]?.flag} {LANGUAGES[lang]?.label}</span>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail tekst</label>
                <textarea value={active.body} onChange={(e) => updateEmail(activeIdx, { body: e.target.value })}
                  rows={14}
                  className={`${inputClass} w-full resize-y font-mono text-xs leading-relaxed`} />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-700">Beschikbare variabelen:</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{voornaam}"}</span> — voornaam van de klant</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{merknaam}"}</span> — naam van het merk</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{ordernummer}"}</span> — ordernummer van de bestelling</p>
                <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{"{link}"}</span> — link naar de review-pagina</p>
              </div>

              {/* Test versturen */}
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
                      {replaceVars(active.body).split("\n").map((line, i) => (
                        <p key={i} className={`text-sm leading-relaxed ${line.trim() === "" ? "h-4" : "text-gray-700"}`}>
                          {line || "\u00A0"}
                        </p>
                      ))}

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
