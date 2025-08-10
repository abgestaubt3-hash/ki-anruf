# KI-Anruf – Next.js MVP

## Setup
1. Env-Variablen setzen (.env oder Vercel Project Settings)
2. `npm install`
3. `npm run dev` (lokal) oder bei Vercel deployen

## API Fluss
- POST /api/upload → nimmt FormData(file) und lädt zu Bunny (gibt publicUrl zurück)
- POST /api/checkout → erstellt Stripe-Checkout-Session und speichert Order
- POST /api/stripe-webhook → nach Zahlung: ElevenLabs Voice klonen & Vapi-Call starten
