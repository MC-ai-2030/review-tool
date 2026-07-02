"use client";

import { useState, useEffect, useCallback } from "react";
import { LANGUAGES } from "@/app/lib/translations";

interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  trustpilotUrl: string;
  language: string;
  shopifyDomain: string;
  emailEnabled: boolean;
  emailDelayMin: number;
}

const inputClass = "px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white";
const selectClass = "px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white";

export default function AdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [trustpilotUrl, setTrustpilotUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Brand>>({});

  // Shopify connect state
  const [connecting, setConnecting] = useState<string | null>(null);
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/brands");
    setBrands(await res.json());
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, logoUrl, primaryColor, trustpilotUrl, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error);
      } else {
        setName(""); setSlug(""); setLogoUrl(""); setPrimaryColor("#000000"); setTrustpilotUrl(""); setLanguage("en");
        fetchBrands();
      }
    } catch {
      setAddError("Er ging iets mis");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Merk verwijderen?")) return;
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
    fetchBrands();
  }

  function startEdit(brand: Brand) {
    setEditing(brand.id);
    setEditData({ ...brand });
  }

  async function saveEdit() {
    if (!editing) return;
    await fetch(`/api/brands/${editing}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditing(null);
    fetchBrands();
  }

  async function handleConnectShopify(brandId: string) {
    setConnectError("");
    setConnectLoading(true);
    try {
      const res = await fetch(`/api/brands/${brandId}/shopify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopifyDomain, clientId, clientSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error);
      } else {
        setConnecting(null);
        setShopifyDomain("");
        setClientId("");
        setClientSecret("");
        fetchBrands();
      }
    } catch {
      setConnectError("Er ging iets mis");
    }
    setConnectLoading(false);
  }

  async function handleDisconnectShopify(brandId: string) {
    if (!confirm("Shopify koppeling verwijderen? E-mails worden gestopt.")) return;
    await fetch(`/api/brands/${brandId}/shopify`, { method: "DELETE" });
    fetchBrands();
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Review Tool — Admin</h1>
        <button onClick={() => setShowGuide(!showGuide)}
          className="px-3 py-1.5 text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg cursor-pointer">
          {showGuide ? "Sluiten" : "Hoe werkt het?"}
        </button>
      </nav>

      {showGuide && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Hoe werkt het?</h2>

            <div className="space-y-6 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stap 1: Merk aanmaken</h3>
                <p>Vul hieronder de merknaam, Trustpilot URL, logo en kleur in. Kies de juiste taal voor de review-pagina en e-mails. Na het toevoegen is de review-pagina direct beschikbaar op <span className="font-mono text-gray-900">reviews-verified.com/jouw-slug</span>.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stap 2: Shopify koppelen</h3>
                <p className="mb-2">Klik op <strong>"+ Shopify koppelen voor review e-mails"</strong> bij het merk. Je hebt drie dingen nodig: Shopify domein, Client ID en Client Secret.</p>
                <ol className="list-decimal list-inside space-y-1.5 ml-1">
                  <li>Ga naar <strong>dev.shopify.com</strong> en log in</li>
                  <li>Klik <strong>Apps → Create app → Start from Dev Dashboard</strong></li>
                  <li>Geef de app een naam (bijv. "Review Tool") → <strong>Create</strong></li>
                  <li>Ga naar <strong>Versions</strong> → stel de API scope <strong>read_orders</strong> in</li>
                  <li>Klik <strong>Release</strong> om de versie te activeren</li>
                  <li>Ga naar <strong>Home</strong> → installeer de app op je store</li>
                  <li>Ga naar <strong>Settings</strong> → kopieer <strong>Client ID</strong> en <strong>Client Secret</strong></li>
                </ol>
                <p className="mt-2">Vul je Shopify domein in (bijv. <span className="font-mono">jouw-store.myshopify.com</span>), de Client ID en Client Secret. Klik "Koppelen" — de tool haalt automatisch een access token op en registreert een webhook bij Shopify.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stap 3: Klaar!</h3>
                <p>Na het koppelen ontvangt elke klant automatisch <strong>30 minuten na een bestelling</strong> een review-mail. De mail bevat:</p>
                <ul className="list-disc list-inside space-y-1 ml-1 mt-1">
                  <li>Merknaam, logo en kleuren</li>
                  <li>Persoonlijke begroeting met voornaam</li>
                  <li>Link naar de review-pagina</li>
                  <li>Uitschrijflink onderaan</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Wat ziet de klant?</h3>
                <p>Op de review-pagina kiest de klant uit drie opties:</p>
                <ul className="list-disc list-inside space-y-1 ml-1 mt-1">
                  <li><strong>Loved it</strong> → wordt doorgestuurd naar Trustpilot</li>
                  <li><strong>It was okay / Disappointed</strong> → kan feedback achterlaten (komt niet op Trustpilot)</li>
                </ul>
                <p className="mt-1">Zo krijg je meer positieve Trustpilot reviews en waardevolle interne feedback.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Add brand */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">Nieuw merk toevoegen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Merknaam" required className={inputClass} />
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (URL)" required className={`${inputClass} font-mono`} />
            <input type="url" value={trustpilotUrl} onChange={(e) => setTrustpilotUrl(e.target.value)}
              placeholder="Trustpilot URL" required className={inputClass} />
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Logo URL (optioneel)" className={inputClass} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Kleur:</span>
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Taal:</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
                {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
                  <option key={code} value={code}>{flag} {label}</option>
                ))}
              </select>
            </label>
            <div className="flex-1" />
            <button type="submit" disabled={adding}
              className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50">
              {adding ? "Toevoegen..." : "Toevoegen"}
            </button>
          </div>
          {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        </form>

        {/* Brand list */}
        <h2 className="font-semibold mb-3">Merken ({brands.length})</h2>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4">
                {editing === brand.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Merknaam" className={inputClass} />
                      <input type="text" value={editData.slug || ""} onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                        placeholder="Slug" className={`${inputClass} font-mono`} />
                      <input type="url" value={editData.trustpilotUrl || ""} onChange={(e) => setEditData({ ...editData, trustpilotUrl: e.target.value })}
                        placeholder="Trustpilot URL" className={inputClass} />
                      <input type="url" value={editData.logoUrl || ""} onChange={(e) => setEditData({ ...editData, logoUrl: e.target.value })}
                        placeholder="Logo URL" className={inputClass} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input type="color" value={editData.primaryColor || "#000000"} onChange={(e) => setEditData({ ...editData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
                      <select value={editData.language || "en"} onChange={(e) => setEditData({ ...editData, language: e.target.value })} className={selectClass}>
                        {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
                          <option key={code} value={code}>{flag} {label}</option>
                        ))}
                      </select>
                      <div className="flex-1" />
                      <button onClick={() => setEditing(null)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">Annuleren</button>
                      <button onClick={saveEdit}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer">Opslaan</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: brand.primaryColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{brand.name}</p>
                      <p className="text-xs text-gray-500 font-mono">/{brand.slug}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {LANGUAGES[brand.language]?.flag || ""} {LANGUAGES[brand.language]?.label || brand.language}
                    </span>
                    {brand.emailEnabled ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                        E-mail actief
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 flex-shrink-0">
                        Geen e-mail
                      </span>
                    )}
                    <a href={`${baseUrl}/${brand.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex-shrink-0">
                      Bekijk
                    </a>
                    <button onClick={() => startEdit(brand)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg cursor-pointer">
                      Bewerken
                    </button>
                    <button onClick={() => handleDelete(brand.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Shopify connection panel */}
              {!editing && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                  {brand.emailEnabled ? (
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Shopify gekoppeld: <span className="font-mono text-gray-900">{brand.shopifyDomain}</span></span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{brand.emailDelayMin} min na bestelling</span>
                      <div className="flex-1" />
                      <button onClick={() => handleDisconnectShopify(brand.id)}
                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                        Ontkoppelen
                      </button>
                    </div>
                  ) : connecting === brand.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Shopify koppelen</p>
                      <p className="text-xs text-gray-500">
                        Ga naar <strong>dev.shopify.com</strong> → Apps → Create app. Stel <strong>read_orders</strong> scope in bij Versions, release de versie, en installeer de app op je store. Kopieer daarna Client ID en Client Secret vanuit Settings.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input type="text" value={shopifyDomain} onChange={(e) => setShopifyDomain(e.target.value)}
                          placeholder="store-naam.myshopify.com" className={`${inputClass} font-mono`} />
                        <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)}
                          placeholder="Client ID" className={`${inputClass} font-mono`} />
                        <input type="text" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)}
                          placeholder="Client Secret" className={`${inputClass} font-mono`} />
                      </div>
                      {connectError && <p className="text-red-500 text-xs">{connectError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleConnectShopify(brand.id)} disabled={connectLoading || !shopifyDomain || !clientId || !clientSecret}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-50">
                          {connectLoading ? "Koppelen..." : "Koppelen"}
                        </button>
                        <button onClick={() => { setConnecting(null); setConnectError(""); }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                          Annuleren
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setConnecting(brand.id); setShopifyDomain(""); setClientId(""); setClientSecret(""); setConnectError(""); }}
                      className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">
                      + Shopify koppelen voor review e-mails
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {brands.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nog geen merken. Voeg er hierboven een toe.</p>
          )}
        </div>
      </div>
    </div>
  );
}
