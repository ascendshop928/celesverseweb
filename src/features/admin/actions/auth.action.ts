// 管理員登入/登出 Server Actions
"use server";

import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/auth";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email.trim() || !password) {
    return { success: false, error: "請填寫 Email 和密碼" };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: email.trim() },
  });

  if (!admin) {
    return { success: false, error: "帳號或密碼錯誤" };
  }

  const valid = await compare(password, admin.password);
  if (!valid) {
    return { success: false, error: "帳號或密碼錯誤" };
  }

  await createSession(admin.id);
  return { success: true };
}

export async function logout() {
  await clearSession();
  redirect("/admin/login");
}
