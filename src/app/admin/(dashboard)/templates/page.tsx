// 課程管理（模板列表）
import Link from "next/link";
import { getTemplates } from "@/features/admin/actions/course-template.action";
import { DeleteTemplateButton } from "@/features/admin/components/DeleteTemplateButton";
import { ArchiveTemplateButton } from "@/features/admin/components/ArchiveTemplateButton";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "active" } = await searchParams;
  const allTemplates = await getTemplates();

  const templates =
    view === "archived"
      ? allTemplates.filter((t) => t.isArchived)
      : allTemplates.filter((t) => !t.isArchived);

  const activeCount = allTemplates.filter((t) => !t.isArchived).length;
  const archivedCount = allTemplates.filter((t) => t.isArchived).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">課程管理</h1>
          <p className="mt-1 text-sm text-zinc-400">
            建立可重複使用的課程模板，排課時自動帶入
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          新增課程
        </Link>
      </div>

      {/* 分頁 */}
      <div className="flex rounded-lg border border-zinc-200 overflow-hidden mb-6 w-fit">
        <Link
          href="/admin/templates?view=active"
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            view === "active"
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          使用中（{activeCount}）
        </Link>
        <Link
          href="/admin/templates?view=archived"
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            view === "archived"
              ? "bg-zinc-900 text-white"
              : "text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          已封存（{archivedCount}）
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="py-12 text-center text-zinc-400">
          {view === "archived" ? "沒有已封存的課程" : "尚無課程模板"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">圖片</th>
                <th className="px-4 py-3 font-medium">課程名稱</th>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">排程數</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {templates.map((tmpl) => (
                <tr key={tmpl.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    {tmpl.images[0] ? (
                      <img
                        src={tmpl.images[0].url}
                        alt={tmpl.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-zinc-100 rounded flex items-center justify-center text-zinc-300 text-xs">
                        無圖
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-900 font-medium">{tmpl.title}</p>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {tmpl.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {tmpl.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {tmpl._count.courses} 門
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/templates/${tmpl.id}/edit`}
                        className="text-sm text-zinc-500 hover:text-zinc-700"
                      >
                        編輯
                      </Link>
                      <ArchiveTemplateButton
                        templateId={tmpl.id}
                        isArchived={tmpl.isArchived}
                      />
                      <DeleteTemplateButton
                        templateId={tmpl.id}
                        templateName={tmpl.title}
                        courseCount={tmpl._count.courses}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
