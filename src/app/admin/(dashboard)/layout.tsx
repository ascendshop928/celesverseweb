// 管理後台 Layout — 含身份驗證和側邊導覽
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/features/admin/components/LogoutButton";

const sidebarLinks = [
  { href: "/admin", label: "課程行事曆" },
  { href: "/admin/templates", label: "課程管理" },
  { href: "/admin/categories", label: "分類管理" },
  { href: "/admin/teachers", label: "導師管理" },
  { href: "/admin/orders", label: "訂單管理" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminId = await getSession();
  if (!adminId) redirect("/admin/login");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] pt-20">
      {/* 側邊欄 */}
      <aside className="w-56 border-r border-zinc-200 bg-zinc-50 p-4">
        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-zinc-200 pt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* 主要內容 */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
