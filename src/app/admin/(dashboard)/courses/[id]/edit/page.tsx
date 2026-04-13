// 編輯排程
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/features/admin/components/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course, templates, teachers] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
    }),
    prisma.courseTemplate.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { title: "asc" },
    }),
    prisma.teacher.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!course) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">編輯排程</h1>
      <div className="mt-6">
        <CourseForm
          courseId={course.id}
          defaultValues={{
            templateId: course.templateId,
            price: course.price,
            teacherId: course.teacherId,
            totalSlots: course.totalSlots,
            location: course.location,
            calendarColor: course.calendarColor,
            paymentLink: course.paymentLink,
            startDate: course.startDate,
            endDate: course.endDate,
          }}
          templates={templates}
          teachers={teachers}
        />
      </div>
    </div>
  );
}
