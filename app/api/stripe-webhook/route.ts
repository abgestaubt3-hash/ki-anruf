import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getOrder, updateOrder } from "@/lib/db";
import { ensureElevenLabsVoice } from "@/lib/elevenlabs";
import { startOutboundCall } from "@/lib/vapi";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing stripe signature", { status: 400 });
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err:any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id!;
    const minutes = Number(session.metadata?.minutes || 10);
    const phone = session.metadata?.phone!;
    const audioUrl = session.metadata?.audioUrl!;

    try {
      await getOrder(orderId); // ensure exists
      const voiceId = await ensureElevenLabsVoice(orderId, audioUrl);

      const systemPrompt = process.env.VAPI_SYSTEM_PROMPT || undefined;
      await startOutboundCall({
        to: phone,
        minutes,
        voiceId,
        systemPrompt,
        vars: {
          EX_NAME: "Mila",
          CALLEE_NAME: "du",
          BEZIEHUNG_DAUER: "1,5 Jahre",
          ZEIT_SEIT_TRENNUNG: "8 Monate",
          HARMLOSE_ERINNERUNG: "unseren Spaziergang am Donaukanal",
        }
      });

      await updateOrder(orderId, { status: "called", voice_id: voiceId });
    } catch (e:any) {
      await updateOrder(orderId, { status: "failed" });
      console.error(e);
    }
  }

  return NextResponse.json({ received: true });
}
