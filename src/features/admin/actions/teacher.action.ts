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

export async function getTeachers() {
  return prisma.teacher.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getTeacher(id: string) {
  return prisma.teacher.findUnique({
    where: { id },
    include: { courses: true },
  });
}

interface TeacherFormData {
  name: string;
  title?: string;
  bio?: string;
  fullBio?: string;
  quote?: string;
  photo?: string;
  sortOrder: number;
}

export type SaveTeacherResult =
  | { success: true; teacherId: string }
  | { success: false; error: string };

export async function saveTeacher(
  data: TeacherFormData,
  teacherId?: string
): Promise<SaveTeacherResult> {
  await requireAdmin();

  if (!data.name.trim()) {
    return { success: false, error: "請填寫導師姓名" };
  }

  try {
    const teacherData = {
      name: data.name.trim(),
      title: data.title?.trim() || null,
      bio: data.bio?.trim() || null,
      fullBio: data.fullBio?.trim() || null,
      quote: data.quote?.trim() || null,
      photo: data.photo?.trim() || null,
      sortOrder: data.sortOrder,
    };

    let id: string;
    if (teacherId) {
      const updated = await prisma.teacher.update({
        where: { id: teacherId },
        data: teacherData,
      });
      id = updated.id;
    } else {
      const created = await prisma.teacher.create({ data: teacherData });
      id = created.id;
    }

    revalidatePath("/admin/teachers");
    revalidatePath("/teachers");
    return { success: true, teacherId: id };
  } catch (err) {
    console.error("saveTeacher error:", err);
    return { success: false, error: "儲存失敗，請稍後再試" };
  }
}

export async function deleteTeacher(teacherId: string) {
  await requireAdmin();

  // 將使用此導師的課程設為無導師
  await prisma.course.updateMany({
    where: { teacherId },
    data: { teacherId: null },
  });

  await prisma.teacher.delete({ where: { id: teacherId } });

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  revalidatePath("/");
}
