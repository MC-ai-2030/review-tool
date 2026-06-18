"use client";

import { useState } from "react";
import type { Translations } from "@/app/lib/translations";

interface Brand {
  name: string;
  logoUrl: string;
  primaryColor: string;
  trustpilotUrl: string;
}

export default function ReviewClient({ brand, t }: { brand: Brand; t: Translations }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rewardConsent, setRewardConsent] = useState(true);

  function handleSelect(id: string) {
    setSelected(id);

    if (id === "loved") {
      setShowRedirect(true);
      setTimeout(() => {
        window.location.href = brand.trustpilotUrl;
      }, 1500);
    } else {
      setShowFeedback(true);
      setShowThankYou(false);
    }
  }

  function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setShowFeedback(false);
    setShowThankYou(true);
  }

  const color = brand.primaryColor || "#000000";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <header className="text-center bg-white" style={{ padding: "32px 20px 24px", borderBottom: `3px solid ${color}` }}>
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.name} style={{ maxHeight: 48, width: "auto", display: "inline-block" }} />
        ) : (
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2.4rem", fontWeight: 700, letterSpacing: -0.5, color: "#1a1a1a" }}>
            {brand.name}
          </span>
        )}
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: 20 }}>
        {/* Main section */}
        <div className="text-center" style={{ padding: "48px 0 32px" }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a", marginBottom: 16 }}>
            {t.headingText}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#777", marginBottom: 36 }}>{t.subText}</p>

          {/* Sentiment cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {t.sentiments.map((s) => (
              <button key={s.id} onClick={() => handleSelect(s.id)}
                style={{
                  background: selected === s.id ? "#fff" : "#f0edea",
                  border: `2px solid ${selected === s.id ? color : "transparent"}`,
                  borderRadius: 16,
                  padding: "36px 16px 28px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: selected === s.id ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
                }}>
                <span style={{ fontSize: "3.5rem", display: "block", marginBottom: 14 }}>{s.emoji}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: 1.5, color: "#888", textTransform: "uppercase" as const }}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0edea", borderRadius: 12, padding: "18px 24px", marginBottom: 24 }}>
            <input type="checkbox" checked={rewardConsent} onChange={(e) => setRewardConsent(e.target.checked)}
              style={{ width: 22, height: 22, accentColor: color, cursor: "pointer", flexShrink: 0 }} />
            <label style={{ fontSize: "0.95rem", color: "#555", cursor: "pointer" }}>
              {t.rewardCheckboxText}
            </label>
          </div>
        </div>

        {/* Experience heading */}
        <div className="text-center" style={{ padding: "0 0 32px" }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>
            {t.experienceHeading}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#777" }}>
            {t.experienceSubText}
          </p>
        </div>

        {/* Feedback form */}
        {showFeedback && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.6rem", marginBottom: 10 }}>
              {t.feedbackHeading}
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#777", marginBottom: 24 }}>
              {t.feedbackSubText}
            </p>
            <form onSubmit={handleSubmitFeedback}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t.feedbackPlaceholder}
                autoFocus
                style={{ width: "100%", minHeight: 140, padding: 16, border: "2px solid #ddd", borderRadius: 12, fontFamily: "inherit", fontSize: "1rem", resize: "vertical", background: "#fff" }}
              />
              <br />
              <button type="submit" style={{ display: "inline-block", marginTop: 16, padding: "14px 40px", background: color, color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>
                {t.sendButton}
              </button>
            </form>
          </div>
        )}

        {/* Thank you */}
        {showThankYou && (
          <div className="text-center" style={{ padding: "48px 20px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>&#10003;</div>
            <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.6rem", marginBottom: 10 }}>{t.redirectText}</h2>
            <p style={{ color: "#777", fontSize: "1rem" }}>{t.feedbackThankYou}</p>
          </div>
        )}
      </div>

      {/* Redirect overlay */}
      {showRedirect && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(245,243,240,0.95)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ padding: 40 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>&#128525;</div>
            <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.6rem", marginBottom: 10 }}>{t.redirectText}</h2>
            <p style={{ color: "#777", fontSize: "1rem" }}>{t.redirectSubText}</p>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
