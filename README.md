# KI-Anruf – Next.js MVP (Bunny + Stripe + Supabase + ElevenLabs + Vapi)

## Env Variablen
Siehe `.env.example` und trage sie in Vercel unter Project → Settings → Environment Variables ein.

## Flow
- /api/upload: Datei → Bunny (public URL)
- /api/checkout: Stripe Checkout Session
- /api/stripe-webhook: Nach Zahlung → ElevenLabs Clone → Vapi Outbound Call
