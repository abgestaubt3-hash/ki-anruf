import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/lib/db";

const PRICES: Record<string, {name: string, amount: number, minutes: number}> = {
  "5":  { name:"5 Minuten",  amount:1499, minutes:5 },
  "10": { name:"10 Minuten", amount:1999, minutes:10 },
  "20": { name:"20 Minuten", amount:2499, minutes:20 },
};

export async function POST(req: NextRequest) {
  try {
    const { phone, email, pkg, audioUrl } = await req.json();
    if (!PRICES[pkg] || !phone || !audioUrl) return NextResponse.json({ error: "Ungültige Eingaben." }, { status: 400 });

    const order = await createOrder({ phone, email, package: pkg, audio_url: audioUrl, status: "pending" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/`,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `KI-Anruf (${PRICES[pkg].name})` },
          unit_amount: PRICES[pkg].amount,
        },
        quantity: 1,
      }],
      metadata: {
        order_id: order.id,
        pkg,
        phone,
        audioUrl,
        minutes: String(PRICES[pkg].minutes),
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "checkout failed" }, { status: 500 });
  }
}
