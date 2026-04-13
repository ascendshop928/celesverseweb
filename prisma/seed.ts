// 資料庫 Seed — 填入測試用課程與管理員資料
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashSync } from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("開始填入測試資料...");

  await prisma.course.createMany({
    data: [
      {
        title: "冥想入門：靜心的藝術",
        description:
          "學習基礎冥想技巧，培養專注力與內在平靜。適合完全沒有經驗的初學者，從呼吸觀察開始，逐步建立每日靜心的習慣。",
        content:
          "第一堂：認識冥想與呼吸觀察\n第二堂：身體掃描與放鬆技巧\n第三堂：專注力訓練\n第四堂：慈悲冥想\n第五堂：日常生活中的正念練習",
        price: 3600,
        // category:"冥想",
        totalSlots: 20,
        soldCount: 12,
        isPublished: true,
        startDate: new Date("2026-05-10"),
        endDate: new Date("2026-06-14"),
      },
      {
        title: "頌缽療癒工作坊",
        description:
          "透過頌缽的聲音振動，深層放鬆身心。本工作坊將帶領你體驗聲音療癒的力量，學習如何運用頌缽進行自我療癒。",
        price: 4800,
        // category:"聲音療癒",
        totalSlots: 15,
        soldCount: 15,
        isPublished: true,
        startDate: new Date("2026-05-03"),
        endDate: new Date("2026-05-03"),
      },
      {
        title: "塔羅牌直覺力開發",
        description:
          "深入學習塔羅牌的象徵語言，開發你的直覺力。從大阿爾克那到小阿爾克那，建立完整的解讀能力。",
        content:
          "課程包含：\n- 78 張牌義深度解析\n- 牌陣設計與實戰練習\n- 直覺力培養技巧\n- 個案解讀演練",
        price: 8500,
        // category:"塔羅",
        totalSlots: 12,
        soldCount: 8,
        isPublished: true,
        startDate: new Date("2026-05-17"),
        endDate: new Date("2026-07-19"),
      },
      {
        title: "瑜伽與脈輪平衡",
        description:
          "結合瑜伽體位法與脈輪能量概念，透過身體動作與呼吸法，疏通七大脈輪的能量流動，達到身心靈的全面平衡。",
        price: 5200,
        // category:"瑜伽",
        totalSlots: 25,
        soldCount: 3,
        isPublished: true,
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-07-20"),
      },
      {
        title: "水晶能量療癒師認證班",
        description:
          "系統性學習水晶的能量屬性與療癒應用，完成課程後可取得認證。課程涵蓋選晶、淨化、編程與療癒手法。",
        price: 12000,
        // category:"水晶療癒",
        totalSlots: 10,
        soldCount: 2,
        isPublished: true,
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-08-30"),
      },
      {
        title: "靈氣 Reiki 一階工作坊",
        description:
          "學習靈氣療癒的基礎技術，接受一階點化，開啟自我療癒與為他人療癒的能力。",
        price: 6800,
        // category:"靈氣",
        totalSlots: 8,
        soldCount: 0,
        isPublished: false,
        startDate: new Date("2026-07-01"),
      },
    ],
  });

  // 建立預設管理員帳號
  await prisma.admin.upsert({
    where: { email: "admin@celesverse.com" },
    update: {},
    create: {
      email: "admin@celesverse.com",
      password: hashSync("admin123", 10),
      name: "管理員",
    },
  });

  console.log("測試資料填入完成！（6 筆課程 + 1 位管理員）");
  console.log("管理員帳號: admin@celesverse.com / admin123");
}

main()
  .catch((e) => {
    console.error("Seed 執行失敗:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
