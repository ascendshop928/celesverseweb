import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherForm } from "@/features/admin/components/TeacherForm";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">編輯導師</h1>
      <div className="mt-6">
        <TeacherForm teacherId={teacher.id} defaultValues={teacher} />
      </div>
    </div>
  );
}
