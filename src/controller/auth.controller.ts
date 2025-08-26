import { Request, Response } from "express";
import { validate } from "../utils/validator";
import { loginSchema } from "../schemas/auth.schema";
import { tryLoginUser, tryLogoutUser } from "../services/auth.service";

export async function loginController(req: Request, res: Response) {
  const result = validate(loginSchema, req.body);

  if (!result.valid) return res.status(400).json({ error: result.error });
  const data = result.data;
  const loginResult = await tryLoginUser(data.username, data.password);
  if (loginResult.success) {
    return res
      .status(200)
      .json({ message: "Login successful", token: loginResult.token });
  } else {
    return res.status(401).json({ error: "Invalid username or password" });
  }
}

export async function logoutController(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authorization header missing or malformed" });
  }
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const logoutResult = await tryLogoutUser(token);
  if (logoutResult.success) {
    return res.status(200).json({ message: "Logout successful" });
  } else {
    return res
      .status(400)
      .json({ error: logoutResult.error || "Logout failed" });
  }
}
