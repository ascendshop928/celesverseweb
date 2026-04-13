"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Palette, Check } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { EditableLegend, type LegendItem } from "./EditableLegend";

const COLOR_PALETTE = [
  { name: "深綠", value: "#1B5B4A" },
  { name: "翡翠", value: "#2D8B78" },
  { name: "金橘", value: "#D4943A" },
  { name: "赤土", value: "#8B5E3C" },
  { name: "靛藍", value: "#3B5998" },
  { name: "紫羅蘭", value: "#7C3AED" },
  { name: "玫紅", value: "#BE185D" },
  { name: "石墨", value: "#4B5563" },
  { name: "珊瑚", value: "#F97316" },
  { name: "湖水藍", value: "#0891B2" },
];

export interface CalendarCourse {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  isPublished: boolean;
  categoryName?: string | null;
  calendarColor?: string | null;
}

interface AdminCalendarProps {
  courses: CalendarCourse[];
  legendItems: LegendItem[];
  onLegendChange: (items: LegendItem[]) => void;
}

export function AdminCalendar({
  courses,
  legendItems,
  onLegendChange,
}: AdminCalendarProps) {
  const router = useRouter();
  const [colorOverrides, setColorOverrides] = useState<
    Record<string, string>
  >({});
  const [selectedCourse, setSelectedCourse] = useState<CalendarCourse | null>(
    null
  );

  const categoryColorMap = useCallback(() => {
    const map: Record<string, string> = {};
    legendItems.forEach((item) => {
      if (item.editable !== false) {
        map[item.key] = item.color;
      }
    });
    return map;
  }, [legendItems]);

  const getColor = useCallback(
    (course: CalendarCourse) => {
      // 1. 行事曆上的臨時覆蓋（session only）
      const override = colorOverrides[course.id];
      if (override) return override;

      // 2. 課程編輯頁存的自訂顏色（DB 持久化）
      if (course.calendarColor) return course.calendarColor;

      // 3. 標籤列的分類顏色
      const catMap = categoryColorMap();
      if (course.categoryName && catMap[course.categoryName]) {
        return catMap[course.categoryName];
      }

      // 4. 預設
      return course.isPublished ? "#1B5B4A" : "#A1A1AA";
    },
    [colorOverrides, categoryColorMap]
  );

  const events = courses
    .filter((c) => c.startDate)
    .map((c) => {
      const color = getColor(c);
      return {
        id: c.id,
        title: c.title,
        start: c.startDate!,
        end: c.endDate || undefined,
        backgroundColor: c.isPublished ? color : "#A1A1AA",
        borderColor: c.isPublished ? color : "#A1A1AA",
        textColor: c.isPublished ? "#FDFAF5" : "#27272A",
      };
    });

  function handleDateClick(info: DateClickArg) {
    router.push(`/admin/courses/new?date=${info.dateStr}`);
  }

  function handleEventClick(info: { event: { id: string } }) {
    const course = courses.find((c) => c.id === info.event.id);
    if (course) setSelectedCourse(course);
  }

  function applyColor(courseId: string, color: string | null) {
    setColorOverrides((prev) => {
      const next = { ...prev };
      if (color) {
        next[courseId] = color;
      } else {
        delete next[courseId];
      }
      return next;
    });
    setSelectedCourse(null);
  }

  return (
    <div className="space-y-4">
      <EditableLegend items={legendItems} onChange={onLegendChange} />

      {/* 課程顏色選擇彈窗 */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl p-5 w-72 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-900 truncate">
                {selectedCourse.title}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              選擇顏色或重設為分類預設
            </p>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((c) => {
                const isActive =
                  colorOverrides[selectedCourse.id] === c.value;
                return (
                  <button
                    key={c.value}
                    title={c.name}
                    onClick={() => applyColor(selectedCourse.id, c.value)}
                    className="relative w-9 h-9 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: c.value,
                      borderColor: isActive ? "#fff" : c.value,
                      boxShadow: isActive
                        ? `0 0 0 2px ${c.value}`
                        : undefined,
                    }}
                  >
                    {isActive && (
                      <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => applyColor(selectedCourse.id, null)}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                重設為分類預設
              </button>
              <button
                onClick={() => {
                  router.push(
                    `/admin/courses/${selectedCourse.id}/edit`
                  );
                  setSelectedCourse(null);
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                編輯課程
              </button>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 pt-1"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <style>{`
          .fc { font-size: 0.875rem; }
          .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600; }
          .fc-button-primary {
            background: #18181b !important;
            border: none !important;
            font-size: 0.75rem !important;
            padding: 0.375rem 0.75rem !important;
            border-radius: 0.5rem !important;
          }
          .fc-button-primary:hover { background: #3f3f46 !important; }
          .fc-button-primary:not(:disabled).fc-button-active { background: #3f3f46 !important; }
          .fc-day-today { background: #fef9c3 !important; }
          .fc-daygrid-day:hover { background: #f4f4f5; cursor: pointer; }
          .fc-event {
            cursor: pointer;
            border-radius: 0.375rem;
            padding: 2px 6px;
            font-size: 0.75rem;
          }
          .fc-event:hover { opacity: 0.8; transition: opacity 0.15s; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="zh-tw"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          buttonText={{
            today: "今天",
            month: "月",
            week: "週",
          }}
          height="auto"
          dayMaxEvents={3}
          eventDisplay="block"
        />
      </div>
    </div>
  );
}
