import { prisma } from "..";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
export async function tryLoginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { usernameLower: username.toLowerCase() },
  });
  if (!user) return { success: false };
  if (await argon2.verify(user.passwordHash, password)) {
    await prisma.log.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        details: `User ${user.username} logged in`,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
        issuer: "payfull-pelican",
      }
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, token };
  } else {
    await prisma.log.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        details: `User ${user.username} tried login wrong password in`,
      },
    });
  }
  return { success: false };
}

export async function tryLogoutUser(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return { success: false, error: "Invalid token" };
  await prisma.session.update({
    where: { token },
    data: { expired: true },
  });
  await prisma.log.create({
    data: {
      userId: session.userId,
      action: "USER_LOGOUT",
      details: `User ${session.user.username} logged out`,
    },
  });
  return { success: true };
}
