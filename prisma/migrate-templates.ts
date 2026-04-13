/**
 * 資料遷移腳本：將現有 Course 資料拆分為 CourseTemplate + Course
 *
 * 每個現有 Course 會建立一個對應的 CourseTemplate，
 * 並將 title/description/content/categoryId/images 搬到模板上。
 *
 * 執行方式：npx tsx prisma/migrate-templates.ts
 */
import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 取得所有現有課程（含圖片）
  const courses = await prisma.course.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  console.log(`找到 ${courses.length} 門課程需要遷移`);

  if (courses.length === 0) {
    console.log("沒有課程需要遷移，結束。");
    return;
  }

  for (const course of courses) {
    // 跳過已經有 templateId 的（避免重複執行）
    if (course.templateId) {
      console.log(`  跳過「${course.title}」— 已有 templateId`);
      continue;
    }

    console.log(`  遷移「${course.title}」...`);

    // 建立 CourseTemplate
    const template = await prisma.courseTemplate.create({
      data: {
        title: course.title ?? "未命名課程",
        description: course.description ?? "",
        content: course.content ?? null,
        categoryId: course.categoryId ?? null,
      },
    });

    // 搬移圖片到 CourseTemplateImage
    if (course.images.length > 0) {
      await prisma.courseTemplateImage.createMany({
        data: course.images.map((img) => ({
          url: img.url,
          sortOrder: img.sortOrder,
          templateId: template.id,
        })),
      });
    } else if (course.imageUrl) {
      // 舊的單圖模式
      await prisma.courseTemplateImage.create({
        data: {
          url: course.imageUrl,
          sortOrder: 0,
          templateId: template.id,
        },
      });
    }

    // 更新 Course 設定 templateId
    await prisma.course.update({
      where: { id: course.id },
      data: { templateId: template.id },
    });

    console.log(`    ✓ 模板 ${template.id} 已建立`);
  }

  // 驗證
  const unlinked = await prisma.course.count({ where: { templateId: null } });
  if (unlinked > 0) {
    console.error(`⚠️ 還有 ${unlinked} 門課程沒有 templateId！`);
  } else {
    console.log("\n✅ 所有課程已成功遷移到模板系統！");
    console.log("下一步：更新 schema.prisma 移除舊欄位，再跑 npx prisma db push");
  }
}

main()
  .catch(console.error)
  .finally(() => {
    pool.end();
  });
