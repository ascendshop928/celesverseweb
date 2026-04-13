// 新增課程模板
import { prisma } from "@/lib/prisma";
import { CourseTemplateForm } from "@/features/admin/components/CourseTemplateForm";

export default async function NewTemplatePage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">新增課程</h1>
      <div className="mt-6">
        <CourseTemplateForm categories={categories} />
      </div>
    </div>
  );
}
