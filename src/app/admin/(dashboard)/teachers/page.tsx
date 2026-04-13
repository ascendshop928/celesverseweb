import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteTeacherButton } from "@/features/admin/components/DeleteTeacherButton";

export default async function TeachersAdminPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">導師管理</h1>
        <Link
          href="/admin/teachers/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          新增導師
        </Link>
      </div>

      {teachers.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-400">
          尚無導師
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center gap-4 px-4 py-4"
            >
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm text-zinc-400">
                  {teacher.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  {teacher.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {teacher.title || "未設定頭銜"} ·{" "}
                  {teacher._count.courses} 門課程
                </p>
              </div>
              <Link
                href={`/admin/teachers/${teacher.id}/edit`}
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                編輯
              </Link>
              <DeleteTeacherButton
                teacherId={teacher.id}
                teacherName={teacher.name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
