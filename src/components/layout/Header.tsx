// 網站頂部導覽列 — Silk & Shadow
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 flex items-center px-6 md:px-12 lg:px-16 py-4 md:py-6 bg-background/80 backdrop-blur-sm">
      <Link href="/" className="flex items-center relative z-10">
        <Image
          src="/images/logo-horizontal.png"
          alt="神仙部落 Celesverse"
          width={180}
          height={48}
          className="h-10 md:h-12 w-auto"
          priority
        />
      </Link>

      <div className="hidden md:flex gap-12 text-sm tracking-widest uppercase font-light font-sans absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="hover:text-gold-dust transition-colors duration-500">
          首頁
        </Link>
        <Link href="/experiences" className="hover:text-gold-dust transition-colors duration-500">
          體驗課程
        </Link>
        <Link href="/Guides" className="hover:text-gold-dust transition-colors duration-500">
          靈性嚮導
        </Link>
      </div>
    </nav>
  );
}
