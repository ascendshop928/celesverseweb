"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, Download, X } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSearch = searchParams.get("search") || "";
  const currentYear = searchParams.get("year") || "";
  const currentMonth = searchParams.get("month") || "";
  const hasDateFilter = currentYear !== "" && currentMonth !== "";

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
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value.trim() });
    }, 300);
  }

  function applyDateFilter(year: string, month: string) {
    if (year && month) {
      updateParams({ year, month });
    }
  }

  function clearDateFilter() {
    updateParams({ year: "", month: "" });
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (currentSearch) params.set("search", currentSearch);
    if (hasDateFilter) {
      params.set(
        "month",
        `${currentYear}-${String(Number(currentMonth)).padStart(2, "0")}`
      );
    }
    window.open(`/api/orders/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* 即時搜尋 */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜尋姓名、Email、電話..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          {currentSearch && (
            <button
              onClick={() => {
                updateParams({ search: "" });
                // 清空 input
                const input = document.querySelector<HTMLInputElement>(
                  'input[placeholder*="搜尋"]'
                );
                if (input) input.value = "";
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 年份 */}
        <select
          value={currentYear}
          onChange={(e) => {
            const y = e.target.value;
            if (y) {
              applyDateFilter(y, currentMonth || String(CURRENT_YEAR === Number(y) ? new Date().getMonth() + 1 : 1));
            } else {
              clearDateFilter();
            }
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="">全部年份</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y} 年
            </option>
          ))}
        </select>

        {/* 月份 */}
        <select
          value={currentMonth}
          onChange={(e) => {
            const m = e.target.value;
            if (m) {
              applyDateFilter(currentYear || String(CURRENT_YEAR), m);
            } else {
              clearDateFilter();
            }
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="">全部月份</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m} 月
            </option>
          ))}
        </select>

        {/* 清除日期 */}
        {hasDateFilter && (
          <button
            onClick={clearDateFilter}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3 h-3" />
            清除日期
          </button>
        )}

        {/* 匯出 */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          匯出
        </button>
      </div>
    </div>
  );
}
