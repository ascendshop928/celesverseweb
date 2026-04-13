// 課程狀態自動計算

export type CourseStatus =
  | "unscheduled"  // 未排期
  | "upcoming"     // 未開始
  | "in_progress"  // 上課中
  | "completed"    // 已完成
  | "postponed";   // 延期中

export const courseStatusLabels: Record<CourseStatus, { text: string; className: string }> = {
  unscheduled: { text: "未排期", className: "bg-zinc-100 text-zinc-500" },
  upcoming:    { text: "未開始", className: "bg-blue-100 text-blue-700" },
  in_progress: { text: "上課中", className: "bg-amber-100 text-amber-700" },
  completed:   { text: "已完成", className: "bg-emerald-100 text-emerald-700" },
  postponed:   { text: "延期中", className: "bg-red-100 text-red-600" },
};

interface CourseForStatus {
  startDate: Date | null;
  endDate: Date | null;
  isPostponed: boolean;
}

export function getCourseStatus(course: CourseForStatus): CourseStatus {
  // 延期優先
  if (course.isPostponed) return "postponed";

  // 沒有開課日期
  if (!course.startDate) return "unscheduled";

  const now = new Date();
  const start = new Date(course.startDate);

  // 未開始
  if (now < start) return "upcoming";

  // 有結束日期
  if (course.endDate) {
    const end = new Date(course.endDate);
    // 結束日當天 21:00 後算完成
    const endCutoff = new Date(end);
    endCutoff.setHours(21, 0, 0, 0);

    if (now <= endCutoff) return "in_progress";
    return "completed";
  }

  // 只有開始日期（單日課程）：開課日當天 21:00 後算完成
  const startCutoff = new Date(start);
  startCutoff.setHours(21, 0, 0, 0);

  if (now <= startCutoff) return "in_progress";
  return "completed";
}
