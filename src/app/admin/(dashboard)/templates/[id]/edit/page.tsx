// 編輯課程模板
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseTemplateForm } from "@/features/admin/components/CourseTemplateForm";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [template, categories] = await Promise.all([
    prisma.courseTemplate.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!template) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">編輯課程</h1>
      <div className="mt-6">
        <CourseTemplateForm
          templateId={template.id}
          defaultValues={template}
          existingImages={template.images.map((img) => img.url)}
          categories={categories}
        />
      </div>
    </div>
  );
}
