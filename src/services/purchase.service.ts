import Stripe from "stripe";
import { prisma, stripe } from "..";
import { success } from "zod";

export async function createCheckout(userId: string, productId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product: productId,
          unit_amount: 11*100,
        },
        quantity: 1,
      },
    ],
    automatic_tax: { enabled: true },
    metadata: { ram: "16GB", cores: "4", storage: "200GB" },
    success_url: `${process.env.URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.URL}/cancel.html`,
  });

  console.log("Session ID:", session.id);
  console.log(session.url);
  return session.url;
}
