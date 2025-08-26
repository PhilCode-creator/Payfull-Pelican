import Stripe from "stripe";
import { prisma } from "..";
import { success } from "zod";

const stripe = new Stripe(process.env.STRIPE_KEY || "");

async function createCheckout(userId: string, productId: string) {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "embedded",
    return_url:
      "https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
  });
}
