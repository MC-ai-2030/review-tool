"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface FlowStats {
  total: number;
  sent: number;
  clicked: number;
  clickRate: number;
  cancelled: number;
  pending: number;
  revenue: number;
  days: { date: string; sent: number; clicked: number; revenue: number }[];
}

interface Stats {
  review: FlowStats;
  abandoned_checkout: FlowStats;
}

interface Brand {
  id: string;
  name: string;
  language: string;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function FlowSection({ title, stats }: { title: string; stats: FlowStats }) {
  const maxSent = Math.max(...stats.days.map((d) => d.sent), 1);

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Verzonden" value={stats.sent} />
        <StatCard label="Geklikt" value={stats.clicked} sub={`${stats.clickRate}% click rate`} />
        <StatCard label="Geannuleerd" value={stats.cancelled} />
        {stats.revenue > 0 && (
          <StatCard label="Herstelde omzet" value={`€${stats.revenue.toFixed(2)}`} />
        )}
      </div>

      {/* Simple bar chart - last 7 days */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-4">Laatste 7 dagen</p>
        <div className="flex items-end gap-2 h-32">
          {stats.days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-24">
                {day.clicked > 0 && (
                  <div className="w-full bg-green-400 rounded-t"
                    style={{ height: `${Math.max((day.clicked / maxSent) * 100, 4)}%` }} />
                )}
                <div className="w-full bg-black rounded-t"
                  style={{ height: `${Math.max((day.sent / maxSent) * 100, 4)}%`, marginTop: day.clicked > 0 ? -1 : 0 }} />
              </div>
              <span className="text-xs text-gray-400">
                {new Date(day.date).toLocaleDateString("nl-NL", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 bg-black rounded" /> Verzonden
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 bg-green-400 rounded" /> Geklikt
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchData = useCallback(async () => {
    const [brandsRes, statsRes] = await Promise.all([
      fetch("/api/brands"),
      fetch(`/api/brands/${id}/stats`),
    ]);
    const brands: Brand[] = await brandsRes.json();
    setBrand(brands.find((b) => b.id === id) || null);
    setStats(await statsRes.json());
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!brand || !stats) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Laden...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/admin")} className="text-gray-500 hover:text-gray-900 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Performance — {brand.name}</h1>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        <FlowSection title="Review flow" stats={stats.review} />

        {(stats.abandoned_checkout.total > 0 || stats.abandoned_checkout.sent > 0) && (
          <FlowSection title="Abandoned Checkout flow" stats={stats.abandoned_checkout} />
        )}

        {stats.abandoned_checkout.total === 0 && stats.review.total === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">Nog geen e-mails verstuurd voor dit merk.</p>
          </div>
        )}
      </div>
    </div>
  );
}
