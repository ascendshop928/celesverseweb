// 課程列表頁 — Silk & Shadow
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/features/courses/components/CourseCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Experiences",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      price: true,
      totalSlots: true,
      soldCount: true,
      startDate: true,
      location: true,
      template: {
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });

  return (
    <section className="pt-32 md:pt-40 pb-24 mx-6 md:mx-12 lg:mx-16">
      <div className="bg-background shadow-2xl py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16 md:mb-24">
            <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-fg font-sans">
              Experiences
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light">
            </h1>
            <div className="h-px w-12 bg-gold-dust mx-auto" />
          </div>

          {courses.length === 0 ? (
            <div className="py-20 text-center text-muted-fg font-sans">
              <p className="text-5xl mb-6 font-serif font-light text-foreground/10">✦</p>
              <p className="text-lg font-light">目前沒有開放的課程，請稍後再來</p>
            </div>
          ) : (
            <div className="grid gap-x-10 gap-y-16 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.template.title}
                  description={course.template.description}
                  price={course.price}
                  imageUrl={course.template.images?.[0]?.url ?? null}
                  totalSlots={course.totalSlots}
                  soldCount={course.soldCount}
                  category={course.template.category}
                  startDate={course.startDate}
                  location={course.location}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
