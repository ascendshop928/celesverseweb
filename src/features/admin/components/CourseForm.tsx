// 排課表單 — 選擇模板 + 填寫排程資訊
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { saveCourse } from "@/features/admin/actions/course.action";

const CALENDAR_COLORS = [
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
  { name: "翠綠", value: "#10B981" },
  { name: "紅色", value: "#DC2626" },
];

interface Template {
  id: string;
  title: string;
  description: string;
  category?: { name: string } | null;
  images?: Array<{ url: string }>;
}

interface CourseFormProps {
  courseId?: string;
  defaultValues?: {
    templateId: string;
    price: number;
    teacherId: string | null;
    totalSlots: number;
    location: string | null;
    calendarColor: string | null;
    paymentLink: string | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  templates: Template[];
  teachers: Array<{ id: string; name: string }>;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function CourseForm({
  courseId,
  defaultValues,
  templates,
  teachers,
}: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    defaultValues?.templateId ?? ""
  );
  const [calendarColor, setCalendarColor] = useState<string | null>(
    defaultValues?.calendarColor ?? null
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedTemplateId) {
      setError("請選擇課程模板");
      setIsSubmitting(false);
      return;
    }

    const fd = new FormData(e.currentTarget);

    const result = await saveCourse(
      {
        templateId: selectedTemplateId,
        price: Number(fd.get("price")),
        teacherId: (fd.get("teacherId") as string) || undefined,
        totalSlots: Number(fd.get("totalSlots")),
        location: (fd.get("location") as string) || undefined,
        calendarColor: calendarColor || undefined,
        paymentLink: (fd.get("paymentLink") as string) || undefined,
        startDate: fd.get("startDate") as string,
        endDate: fd.get("endDate") as string,
      },
      courseId
    );

    if (result.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 模板選擇 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          課程模板 *
        </label>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className={inputClass}
        >
          <option value="">請選擇課程</option>
          {templates.map((tmpl) => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.title}
              {tmpl.category ? ` (${tmpl.category.name})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* 模板預覽 */}
      {selectedTemplate && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex gap-4">
            {selectedTemplate.images?.[0] && (
              <img
                src={selectedTemplate.images[0].url}
                alt={selectedTemplate.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900">
                {selectedTemplate.title}
              </p>
              {selectedTemplate.category && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedTemplate.category.name}
                </p>
              )}
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                {selectedTemplate.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-zinc-200" />

      {/* 排程資訊 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            價格（NT$）*
          </label>
          <input
            name="price"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.price}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            總名額 *
          </label>
          <input
            name="totalSlots"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.totalSlots}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          授課導師
        </label>
        <select
          name="teacherId"
          defaultValue={defaultValues?.teacherId ?? ""}
          className={inputClass}
        >
          <option value="">未指定</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          上課地點
        </label>
        <input
          name="location"
          defaultValue={defaultValues?.location ?? ""}
          className={inputClass}
          placeholder="例如：台北市大安區..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            開課日期
          </label>
          <input
            name="startDate"
            type="date"
            defaultValue={formatDate(defaultValues?.startDate ?? null)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            結束日期
          </label>
          <input
            name="endDate"
            type="date"
            defaultValue={formatDate(defaultValues?.endDate ?? null)}
            className={inputClass}
          />
        </div>
      </div>

      {/* 付款連結 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          付款連結
        </label>
        <p className="text-xs text-zinc-400 mt-0.5 mb-1">
          輸入第三方付款頁面的網址（如綠界、藍新）
        </p>
        <input
          name="paymentLink"
          type="url"
          defaultValue={defaultValues?.paymentLink ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* 行事曆顏色 */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          行事曆顏色
        </label>
        <p className="text-xs text-zinc-400 mt-0.5 mb-2">
          不選則使用分類預設
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCalendarColor(null)}
            className={`w-8 h-8 rounded-lg border-2 text-xs transition-all hover:scale-110 ${
              !calendarColor
                ? "border-zinc-900 bg-zinc-100 ring-2 ring-zinc-300"
                : "border-zinc-200 bg-zinc-50"
            }`}
            title="使用分類預設"
          >
            自動
          </button>
          {CALENDAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => setCalendarColor(c.value)}
              className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: calendarColor === c.value ? "#fff" : c.value,
                boxShadow:
                  calendarColor === c.value
                    ? `0 0 0 2px ${c.value}`
                    : undefined,
              }}
            >
              {calendarColor === c.value && (
                <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "儲存中..." : courseId ? "更新排程" : "建立排程"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
