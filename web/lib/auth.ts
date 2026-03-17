import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "moodflow_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: {
      name: input.name.trim() || email.split("@")[0],
      email,
      passwordHash,
      preferences: { create: {} },
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    throw new Error("Invalid email or password.");
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.authSession.create({
    data: {
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.authSession.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const authSession = await db.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!authSession || authSession.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE);
    throw new Error("Unauthorized");
  }

  return authSession.user;
}

export async function getOptionalUser() {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}
