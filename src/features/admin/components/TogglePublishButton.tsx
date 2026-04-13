// 課程上下架切換按鈕
"use client";

import { togglePublish } from "@/features/admin/actions/course.action";
import { useTransition } from "react";

export function TogglePublishButton({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => togglePublish(courseId))}
      className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors disabled:opacity-50"
    >
      {isPending ? "..." : isPublished ? "下架" : "上架"}
    </button>
  );
}
