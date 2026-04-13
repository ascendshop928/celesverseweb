"use client";

import { deleteTeacher } from "@/features/admin/actions/teacher.action";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteTeacherButton({
  teacherId,
  teacherName,
}: {
  teacherId: string;
  teacherName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `確定要刪除導師「${teacherName}」嗎？其關聯的課程會變成未指定導師。`
      )
    )
      return;

    setDeleting(true);
    await deleteTeacher(teacherId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-400 hover:text-red-600 disabled:opacity-50"
    >
      {deleting ? "刪除中..." : "刪除"}
    </button>
  );
}
