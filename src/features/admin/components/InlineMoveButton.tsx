"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moveStudentToCourse } from "@/features/admin/actions/course.action";

interface TargetCourse {
  id: string;
  title: string;
  remaining: number;
  startDate: string | null;
}

interface InlineMoveButtonProps {
  orderItemId: string;
  fromCourseId: string;
  studentName: string;
  otherCourses: TargetCourse[];
}

export function InlineMoveButton({
  orderItemId,
  fromCourseId,
  studentName,
  otherCourses,
}: InlineMoveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleMove() {
    if (!targetId) return;
    const target = otherCourses.find((c) => c.id === targetId);
    if (!target) return;

    if (
      !confirm(
        `確定將「${studentName}」移動到「${target.title}」？`
      )
    )
      return;

    setLoading(true);
    try {
      await moveStudentToCourse(orderItemId, fromCourseId, targetId);
      setOpen(false);
      router.refresh();
    } catch {
      alert("移動失敗");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
      >
        轉移
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        className="rounded-md border border-zinc-300 px-1.5 py-1 text-xs text-zinc-900 max-w-[160px]"
      >
        <option value="">選擇課程</option>
        {otherCourses.map((c) => (
          <option key={c.id} value={c.id} disabled={c.remaining <= 0}>
            {c.title} (剩{c.remaining})
          </option>
        ))}
      </select>
      <button
        onClick={handleMove}
        disabled={loading || !targetId}
        className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-700 disabled:bg-zinc-300 transition-colors"
      >
        {loading ? "..." : "確定"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-zinc-400 hover:text-zinc-600"
      >
        取消
      </button>
    </div>
  );
}
