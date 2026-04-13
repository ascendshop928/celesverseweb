"use client";

import { useState, useCallback, useRef } from "react";
import { AdminCalendar, type CalendarCourse } from "./AdminCalendar";
import type { LegendItem } from "./EditableLegend";
import { saveCalendarLegend } from "@/features/admin/actions/site-content.action";

interface CalendarWithLegendProps {
  courses: CalendarCourse[];
  initialLegendItems: LegendItem[];
}

export function CalendarWithLegend({
  courses,
  initialLegendItems,
}: CalendarWithLegendProps) {
  const [legendItems, setLegendItems] = useState(initialLegendItems);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLegendChange = useCallback((items: LegendItem[]) => {
    setLegendItems(items);

    // Debounce 存檔，避免每次改動都打 API
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const toSave = items
        .filter((it) => it.editable !== false)
        .map(({ key, label, color }) => ({ key, label, color }));
      saveCalendarLegend(toSave);
    }, 800);
  }, []);

  return (
    <AdminCalendar
      courses={courses}
      legendItems={legendItems}
      onLegendChange={handleLegendChange}
    />
  );
}
