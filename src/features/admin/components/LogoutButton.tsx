// 登出按鈕
"use client";

import { logout } from "@/features/admin/actions/auth.action";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-200 transition-colors"
    >
      登出
    </button>
  );
}
