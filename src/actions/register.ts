"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "required"
        | "emailInvalid"
        | "passwordShort"
        | "emailExists"
        | "generic";
    };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!displayName || !email || !password) {
    return { ok: false, error: "required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "emailInvalid" };
  }
  if (password.length < 8) {
    return { ok: false, error: "passwordShort" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "emailExists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        roles: {
          create: [{ role: { connect: { key: "member" } } }],
        },
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "generic" };
  }
}
