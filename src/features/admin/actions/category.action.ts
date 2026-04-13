"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const adminId = await getSession();
  if (!adminId) redirect("/admin/login");
  return adminId;
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export type SaveCategoryResult =
  | { success: true }
  | { success: false; error: string };

export async function saveCategory(
  data: { name: string; sortOrder: number },
  categoryId?: string
): Promise<SaveCategoryResult> {
  await requireAdmin();

  const name = data.name.trim();
  if (!name) return { success: false, error: "請填寫分類名稱" };

  try {
    if (categoryId) {
      await prisma.category.update({
        where: { id: categoryId },
        data: { name, sortOrder: data.sortOrder },
      });
    } else {
      await prisma.category.create({
        data: { name, sortOrder: data.sortOrder },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "名稱已存在或儲存失敗" };
  }
}

export async function deleteCategory(
  categoryId: string
): Promise<SaveCategoryResult> {
  await requireAdmin();

  // 將使用此分類的模板設為無分類
  await prisma.courseTemplate.updateMany({
    where: { categoryId },
    data: { categoryId: null },
  });

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
