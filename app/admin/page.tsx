"use client";

import { useState, useEffect, useCallback } from "react";

interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  trustpilotUrl: string;
  headingText: string;
  subText: string;
}

export default function AdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [trustpilotUrl, setTrustpilotUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Brand>>({});

  const fetchBrands = useCallback(async () => {
    const res = await fetch("/api/brands");
    setBrands(await res.json());
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, logoUrl, primaryColor, trustpilotUrl }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error);
    } else {
      setName(""); setSlug(""); setLogoUrl(""); setPrimaryColor("#000000"); setTrustpilotUrl("");
      fetchBrands();
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

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-bold">Review Tool — Admin</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Add brand */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">Nieuw merk toevoegen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Merknaam" required
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug (URL)" required
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
            <input type="url" value={trustpilotUrl} onChange={(e) => setTrustpilotUrl(e.target.value)}
              placeholder="Trustpilot URL" required
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Logo URL (optioneel)"
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Kleur:</span>
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
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
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              {editing === brand.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Merknaam"
                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
                    <input type="text" value={editData.slug || ""} onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                      placeholder="Slug"
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
                    <input type="url" value={editData.trustpilotUrl || ""} onChange={(e) => setEditData({ ...editData, trustpilotUrl: e.target.value })}
                      placeholder="Trustpilot URL"
                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
                    <input type="url" value={editData.logoUrl || ""} onChange={(e) => setEditData({ ...editData, logoUrl: e.target.value })}
                      placeholder="Logo URL"
                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
                    <input type="text" value={editData.headingText || ""} onChange={(e) => setEditData({ ...editData, headingText: e.target.value })}
                      placeholder="Heading tekst"
                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
                    <input type="text" value={editData.subText || ""} onChange={(e) => setEditData({ ...editData, subText: e.target.value })}
                      placeholder="Sub tekst"
                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editData.primaryColor || "#000000"} onChange={(e) => setEditData({ ...editData, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
                    <div className="flex-1" />
                    <button onClick={() => setEditing(null)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Annuleren</button>
                    <button onClick={saveEdit}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 cursor-pointer">Opslaan</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: brand.primaryColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{brand.name}</p>
                    <p className="text-xs text-gray-400 font-mono">/{brand.slug}</p>
                  </div>
                  <a href={`${baseUrl}/${brand.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex-shrink-0">
                    Bekijk pagina
                  </a>
                  <button onClick={() => startEdit(brand)}
                    className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg cursor-pointer">
                    Bewerken
                  </button>
                  <button onClick={() => handleDelete(brand.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {brands.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nog geen merken. Voeg er hierboven een toe.</p>
          )}
        </div>
      </div>
    </div>
  );
}
