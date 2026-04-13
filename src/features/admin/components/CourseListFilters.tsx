"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { key: "active", label: "進行中 / 未開始" },
  { key: "completed", label: "已完成" },
  { key: "all", label: "全部" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function CourseListFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "active";
  const currentYear = searchParams.get("cy") || "";
  const currentMonth = searchParams.get("cm") || "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* 分頁 */}
      <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => updateParams({ tab: tab.key })}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              currentTab === tab.key
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 年月篩選 */}
      <select
        value={currentYear}
        onChange={(e) => {
          const y = e.target.value;
          if (y && !currentMonth) {
            updateParams({ cy: y, cm: String(new Date().getMonth() + 1) });
          } else {
            updateParams({ cy: y });
          }
        }}
        className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700"
      >
        <option value="">全部年份</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y} 年</option>
        ))}
      </select>

      <select
        value={currentMonth}
        onChange={(e) => {
          const m = e.target.value;
          if (m && !currentYear) {
            updateParams({ cm: m, cy: String(CURRENT_YEAR) });
          } else {
            updateParams({ cm: m });
          }
        }}
        className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700"
      >
        <option value="">全部月份</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>{m} 月</option>
        ))}
      </select>

      {(currentYear || currentMonth) && (
        <button
          onClick={() => updateParams({ cy: "", cm: "" })}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          清除日期
        </button>
      )}
    </div>
  );
}
