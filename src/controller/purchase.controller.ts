import { Request, Response } from "express";
import { validate } from "../utils/validator";
import { purchaseSchema } from "../schemas/purchase.schema";
import { createCheckout } from "../services/purchase.service";

export async function purchase(req: Request, res: Response) {
  req.user = req.user!;
  res.status(200).json({
    message: "Purchase endpoint",
    secret: await createCheckout(req.user.id, process.env.STRIPE_PRODUCT_ID!),
  });
}

export async function handleSuccessPayment(req: Request, res: Response) {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session_id parameter" });
  }


  res.status(200).json({ message: "Payment successful", sessionId });
}
