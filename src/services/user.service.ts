import { prisma } from "..";
import { createUserSchema, userIdParamSchema } from "../schemas/user.schema";
import { z } from "zod";

import argon2 from "argon2";
import config from "../assets/config.json";
import logger from "../utils/logger";
export async function isUsernameTaken(username: string) {
  const existingUser = await prisma.user.findUnique({
    where: { usernameLower: username.toLowerCase() },
  });
  return existingUser != null;
}

export async function isEmailTaken(email: string) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  return existingEmail != null;
}

type UserData = z.infer<typeof createUserSchema>;

export async function createUser(data: UserData) {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      usernameLower: data.username.toLowerCase(),
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      passwordHash: (await argon2.hash(data.password)) || "",
      adress: data.adress,
    },
  });
  await prisma.log.create({
    data: {
      userId: user.id,
      action: "USER_CREATED",
      details: `User ${user.username} created`,
    },
  });
  const result = await fetch(process.env.PANEL_URL + "/api/application/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PELICAN_APIKEY}`,
    },
    body: JSON.stringify({
      email: user.email,
      external_id: user.id,
      username: user.username,
      password: data.password,
      language: config.panel_language,
      timezone: config.panel_timezone,
    }),
  });
  if (!result.ok) {
    logger.error("Failed to create user in panel:", await result.text());
  }
  return user;
}

export function isValidObjectId(input: string): boolean {
  return userIdParamSchema.safeParse(input).success;
}

export async function retriveUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: {
      passwordHash: true,
      adress: true,
    },
  });
  return user;
}
