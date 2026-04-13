import { TeacherForm } from "@/features/admin/components/TeacherForm";

export default function NewTeacherPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">新增導師</h1>
      <div className="mt-6">
        <TeacherForm />
      </div>
    </div>
  );
}
