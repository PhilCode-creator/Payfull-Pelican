import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient, User } from "@prisma/client";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import userRouter from "./routers/user.router";
import authRouter from "./routers/auth.router";
import purchaseRouter from "./routers/purchase.router";
import Stripe from "stripe";

app.use(express.json());
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/purchase", purchaseRouter);
export const stripe = new Stripe(process.env.STRIPE_KEY || "");

export const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "passwordHash" | "adress">;
    }
  }
}
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
