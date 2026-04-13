"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleArchiveTemplate } from "@/features/admin/actions/course-template.action";

export function ArchiveTemplateButton({
  templateId,
  isArchived,
}: {
  templateId: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleArchiveTemplate(templateId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
    >
      {isArchived ? "取消封存" : "封存"}
    </button>
  );
}
