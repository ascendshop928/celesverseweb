// 行動呼籲區塊 — Silk & Shadow
import Link from "next/link";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  button1Text?: string;
  button2Text?: string;
}

export function CTASection({
  title,
  subtitle,
  button1Text,
  button2Text,
}: CTASectionProps) {
  return (
    <section className="mx-6 md:mx-12 lg:mx-16 mt-1 bg-background shadow-2xl relative py-40 md:py-60 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-mist via-background to-transparent opacity-40 blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 md:px-12">
        <h2 className="text-4xl md:text-5xl font-serif font-light mb-12 leading-snug">
          {title || (
            <>
              踏入
              <br />
              <span className="italic">光的殿堂</span>
            </>
          )}
        </h2>
        <p className="text-base md:text-lg font-light text-muted-fg mb-12 max-w-[45ch] mx-auto font-sans">
          {subtitle ||
            "加入我們的探索者社群。課程報名現已開放，名額有限。"}
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/experiences"
            className="px-12 py-4 border border-border text-foreground text-sm tracking-widest uppercase hover:bg-mist transition-colors duration-500 font-sans"
          >
            {button1Text || "探索課程"}
          </Link>
          <Link
            href="/experiences"
            className="px-12 py-4 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-moss transition-colors duration-500 font-sans"
          >
            {button2Text || "立即報名"}
          </Link>
        </div>
      </div>
    </section>
  );
}
