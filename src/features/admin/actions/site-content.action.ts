"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const adminId = await getSession();
  if (!adminId) redirect("/admin/login");
  return adminId;
}

export async function saveCalendarLegend(
  items: Array<{ key: string; label: string; color: string }>
): Promise<{ success: boolean }> {
  await requireAdmin();

  try {
    await prisma.siteContent.upsert({
      where: { key: "calendar_legend" },
      update: { value: JSON.stringify(items) },
      create: { key: "calendar_legend", value: JSON.stringify(items) },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getCalendarLegend(): Promise<
  Array<{ key: string; label: string; color: string }> | null
> {
  const record = await prisma.siteContent.findUnique({
    where: { key: "calendar_legend" },
  });
  if (!record) return null;
  try {
    return JSON.parse(record.value);
  } catch {
    return null;
  }
}
