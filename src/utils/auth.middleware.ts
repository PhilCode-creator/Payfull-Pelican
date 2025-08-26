import { NextFunction, Request, Response } from "express";
import { prisma } from "..";
import { tokenParamSchema } from "../schemas/auth.schema";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!tokenParamSchema.safeParse(authHeader).success) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or malformed" });
  }
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or malformed" });
  }
  const token = authHeader.substring(7);
  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          token,
          expired: false,
          expiresAt: { gte: new Date() },
        },
      },
    },
    omit: {
      passwordHash: true,
      adress: true,
    },
  });
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = user;

  next();
}
