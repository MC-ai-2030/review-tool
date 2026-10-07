@AGENTS.md

# Review Tool — Shopify review-request & abandoned-checkout e-mails

**Wat:** Multi-brand e-mailtool voor Shopify-shops. Na een order stuurt het een review-verzoek (Trustpilot-link) via een flow met meerdere mails; daarnaast een abandoned-checkout flow met achtergelaten producten. Met klick-tracking en omzetattributie in een admin-dashboard.
**Live:** Vercel project `review-tool` (team MC-ai-2030) · **Repo:** https://github.com/MC-ai-2030/review-tool (⚠️ publieke repo — nooit secrets committen) · **Map:** `~/review-tool`

## Stack
Next.js 16 (App Router, `app/` zonder `src`), Tailwind v4, Prisma 7 + libsql adapter → Turso, Resend voor e-mail. Prisma client wordt gegenereerd naar `app/generated/prisma`.
Env (`.env.local`): `APP_PASSWORD` (admin-login), `DATABASE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RESEND_API_KEY`.

## Domeinmodel
`Brand` (slug, logo, kleur, trustpilotUrl, taal, Shopify domain + client id/secret/access token, sender e-mail, webhook ids, emailEnabled) → `FlowEmail` (stappen in de flow, timing, template met variabelen zoals `{link}`) → `SentEmail` (status pending/sent, scheduledAt, tracking) · `Unsubscribed`.

## Routes
- `/admin` brands beheren · `/admin/email/[id]` flow-editor · `/admin/stats/[id]` performance (clicks, omzet) · `/login`
- `/[slug]` publieke reviewpagina per brand · `/unsubscribe`
- API: `api/webhooks/shopify` (orders in), `api/brands/[id]/{flow,shopify,test-email,stats,trigger}`, `api/track/[emailId]`, `api/cron` (dagelijks 08:00 via vercel.json: pollt abandoned checkouts + verstuurt pending mails ≤72u vooruit, max 50), `api/cron/abandoned-checkouts`.

## Regels
- Talen: en/nl/pl e.a. — nieuwe taal = optie in admin + templates.
- Abandoned-checkout mail toont producten (afbeelding, naam, prijs) en juiste CTA; test met `test-checkout-email.ts`.
- Resend gratis plan heeft lage limieten (~100/maand) — let op bij bulk.
- Deploy = push naar `main`. Lokaal `npm run dev`.
