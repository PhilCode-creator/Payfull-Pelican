import { Request, Response } from "express";
import { createUserSchema } from "../schemas/user.schema";
import { validate } from "../utils/validator";
import logger from "../utils/logger";
import {
  createUser,
  isEmailTaken,
  isUsernameTaken,
  isValidObjectId,
  retriveUserById,
} from "../services/user.service";

export async function createUserController(req: Request, res: Response) {
  const result = validate(createUserSchema, req.body);

  if (!result.valid) return res.status(400).json({ error: result.error });
  const data = result.data;

  if (await isEmailTaken(data.email)) {
    return res.status(409).json({ error: "Email already in use" });
  }

  if (await isUsernameTaken(data.username)) {
    return res.status(409).json({ error: "Username already in use" });
  }
  const user = await createUser(data);
  logger.info(`User created: ${user.username} (${user.id})`);
  return res.status(201).json({});
}

export async function getUserByIdController(req: Request, res: Response) {
  const userId = req.params["id"];

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  req.user = req.user!;
  if (userId != req.user.id && !req.user.role.includes("ADMIN")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid User ID format" });
  }

  const user = await retriveUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ user: user });
}

export async function getSelfController(req: Request, res: Response) {
  return res.status(200).json({ user: req.user });
}
