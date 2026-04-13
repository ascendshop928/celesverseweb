// 學員見證區塊 — Silk & Shadow

interface TestimonialSectionProps {
  quote?: string;
  name?: string;
  title?: string;
}

export function TestimonialSection({
  quote,
  name,
  title,
}: TestimonialSectionProps) {
  return (
    <section id="testimonials" className="mx-6 md:mx-12 lg:mx-16 mt-1 bg-background shadow-2xl py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <div className="w-px h-24 bg-gradient-to-b from-transparent to-gold-dust mx-auto" />
        <blockquote className="text-2xl md:text-4xl font-serif font-light leading-relaxed text-foreground/80">
          「{quote ||
            "這不僅僅是一個平台，它是一口清晨的涼風。我在他們建構的寧靜中，找到了自己的中心。"}」
        </blockquote>
        <div className="space-y-2">
          <cite className="not-italic text-sm tracking-[0.2em] uppercase font-light font-sans">
            {name || "林心如"}
          </cite>
          <p className="text-[10px] text-gold-dust uppercase tracking-[0.3em] font-sans">
            {title || "瑜伽導師 · 身心靈療癒師"}
          </p>
        </div>
      </div>
    </section>
  );
}
