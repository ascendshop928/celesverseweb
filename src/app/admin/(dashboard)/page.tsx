// 管理後台 — 課程行事曆
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CalendarWithLegend } from "@/features/admin/components/CalendarWithLegend";
import { getCalendarLegend } from "@/features/admin/actions/site-content.action";
import { TogglePublishButton } from "@/features/admin/components/TogglePublishButton";
import { DeleteCourseButton } from "@/features/admin/components/DeleteCourseButton";
import { PostponeButton } from "@/features/admin/components/PostponeButton";
import { DuplicateCourseButton } from "@/features/admin/components/DuplicateCourseButton";
import { CourseListFilters } from "@/features/admin/components/CourseListFilters";
import { getCourseStatus, courseStatusLabels } from "@/lib/course-status";
import type { LegendItem } from "@/features/admin/components/EditableLegend";

export const dynamic = "force-dynamic";

const DEFAULT_COLORS = [
  "#1B5B4A", "#2D8B78", "#D4943A", "#8B5E3C",
  "#3B5998", "#7C3AED", "#BE185D", "#4B5563",
  "#F97316", "#0891B2",
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cy?: string; cm?: string }>;
}) {
  const { tab = "active", cy, cm } = await searchParams;

  const [allCourses, categories, savedLegend] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        templateId: true,
        template: {
          select: {
            title: true,
            category: { select: { name: true } },
          },
        },
        startDate: true,
        endDate: true,
        isPublished: true,
        isPostponed: true,
        postponedTo: true,
        postponedNote: true,
        calendarColor: true,
        price: true,
        totalSlots: true,
        soldCount: true,
        teacher: { select: { name: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getCalendarLegend(),
  ]);

  // 計算每門課的狀態
  const coursesWithStatus = allCourses.map((c) => ({
    ...c,
    status: getCourseStatus(c),
  }));

  // 行事曆資料（全部課程）
  const calendarCourses = allCourses.map((c) => ({
    id: c.id,
    title: c.template.title,
    startDate: c.startDate?.toISOString() ?? null,
    endDate: c.endDate?.toISOString() ?? null,
    isPublished: c.isPublished,
    categoryName: c.template.category?.name ?? null,
    calendarColor: c.calendarColor ?? null,
  }));

  // Legend
  let legendItems: LegendItem[];
  if (savedLegend && savedLegend.length > 0) {
    legendItems = savedLegend.map((item) => ({ ...item, editable: true }));
  } else {
    legendItems = categories.map((cat, i) => ({
      key: cat.name,
      label: cat.name,
      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      editable: true,
    }));
  }
  legendItems.push({
    key: "_unpublished",
    label: "未上架",
    color: "#A1A1AA",
    editable: false,
  });

  // 分頁篩選
  let filteredCourses = coursesWithStatus;
  if (tab === "active") {
    filteredCourses = coursesWithStatus.filter(
      (c) => c.status === "upcoming" || c.status === "in_progress" || c.status === "unscheduled" || c.status === "postponed"
    );
  } else if (tab === "completed") {
    filteredCourses = coursesWithStatus.filter((c) => c.status === "completed");
  }

  // 年月篩選（針對課程列表）
  if (cy && cm && !isNaN(Number(cy)) && !isNaN(Number(cm))) {
    const y = Number(cy);
    const m = Number(cm);
    if (y > 2000 && m >= 1 && m <= 12) {
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 1);
      filteredCourses = filteredCourses.filter((c) => {
        if (!c.startDate) return false;
        const start = new Date(c.startDate);
        // 課程在該月有任何重疊
        const end = c.endDate ? new Date(c.endDate) : start;
        return start < monthEnd && end >= monthStart;
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">課程行事曆</h1>
          <p className="mt-1 text-sm text-zinc-400">
            點擊日期新增課程，點擊課程自訂顏色或編輯
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          新增課程
        </Link>
      </div>

      {/* 行事曆 */}
      <CalendarWithLegend
        courses={calendarCourses}
        initialLegendItems={legendItems}
      />

      {/* 課程列表 */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">
          課程列表
        </h2>

        <Suspense>
          <CourseListFilters />
        </Suspense>

        <p className="text-xs text-zinc-400 mb-4">
          共 {filteredCourses.length} 門課程
        </p>

        {filteredCourses.length === 0 ? (
          <p className="py-12 text-center text-zinc-400">沒有符合條件的課程</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-medium">課程名稱</th>
                  <th className="px-4 py-3 font-medium">分類</th>
                  <th className="px-4 py-3 font-medium">導師</th>
                  <th className="px-4 py-3 font-medium">日期</th>
                  <th className="px-4 py-3 font-medium">名額</th>
                  <th className="px-4 py-3 font-medium">價格</th>
                  <th className="px-4 py-3 font-medium">上架</th>
                  <th className="px-4 py-3 font-medium">課程狀態</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCourses.map((course) => {
                  const remaining = course.totalSlots - course.soldCount;
                  const statusInfo = courseStatusLabels[course.status];
                  return (
                    <tr key={course.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="text-zinc-900 font-medium hover:text-gold-dust transition-colors"
                        >
                          {course.template.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {course.template.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {course.teacher?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                        {course.startDate
                          ? new Date(course.startDate).toLocaleDateString("zh-TW")
                          : "—"}
                        {course.endDate && (
                          <>
                            <span className="text-zinc-300 mx-1">~</span>
                            {new Date(course.endDate).toLocaleDateString("zh-TW")}
                          </>
                        )}
                        {course.isPostponed && course.postponedTo && (
                          <div className="text-xs text-red-500 mt-0.5">
                            延期至 {new Date(course.postponedTo).toLocaleDateString("zh-TW")}
                            {course.postponedNote && (
                              <span className="text-zinc-400 ml-1">
                                ({course.postponedNote})
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {course.soldCount}/{course.totalSlots}
                        {remaining <= 3 && remaining > 0 && (
                          <span className="ml-1 text-amber-500 text-xs">
                            剩{remaining}
                          </span>
                        )}
                        {remaining <= 0 && (
                          <span className="ml-1 text-red-500 text-xs">額滿</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-900">
                        NT$ {course.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            course.isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {course.isPublished ? "已上架" : "未上架"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TogglePublishButton
                            courseId={course.id}
                            isPublished={course.isPublished}
                          />
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="text-sm text-zinc-500 hover:text-zinc-700"
                          >
                            編輯
                          </Link>
                          <DuplicateCourseButton
                            courseId={course.id}
                            courseName={course.template.title}
                          />
                          <PostponeButton
                            courseId={course.id}
                            courseName={course.template.title}
                            isPostponed={course.isPostponed}
                            postponedTo={
                              course.postponedTo
                                ? course.postponedTo.toISOString().split("T")[0]
                                : null
                            }
                          />
                          <DeleteCourseButton
                            courseId={course.id}
                            courseName={course.template.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
