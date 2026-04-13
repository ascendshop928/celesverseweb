"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  postponeCourse,
  cancelPostpone,
} from "@/features/admin/actions/course.action";

interface PostponeButtonProps {
  courseId: string;
  courseName: string;
  isPostponed: boolean;
  postponedTo: string | null;
}

export function PostponeButton({
  courseId,
  courseName,
  isPostponed,
  postponedTo,
}: PostponeButtonProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(postponedTo || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePostpone() {
    if (!date) return;
    setLoading(true);
    await postponeCourse(courseId, date, note);
    setShowForm(false);
    router.refresh();
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm(`確定取消「${courseName}」的延期狀態？`)) return;
    setLoading(true);
    await cancelPostpone(courseId);
    router.refresh();
    setLoading(false);
  }

  if (isPostponed) {
    return (
      <button
        onClick={handleCancel}
        disabled={loading}
        className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : "恢復"}
      </button>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註（選填）"
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs w-20"
        />
        <button
          onClick={handlePostpone}
          disabled={loading || !date}
          className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "..." : "確定"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      延期
    </button>
  );
}
