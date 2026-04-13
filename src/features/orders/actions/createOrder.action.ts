// 建立訂單 Server Action
"use server";

import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail } from "@/lib/email";

const LUCKY_SUFFIXES = [
  "13", "14", "19", "26", "27", "28", "31", "39",
  "41", "49", "62", "68", "72", "78", "82", "86",
  "87", "91", "93", "94",
];

const BANNED_PAIRS = ["18", "81", "79", "97", "42", "24", "36", "63"];

function hasBannedPair(digits: string): boolean {
  for (let i = 0; i < digits.length - 1; i++) {
    const pair = digits[i] + digits[i + 1];
    if (BANNED_PAIRS.includes(pair)) return true;
  }
  return false;
}

function generateOrderId(): string {
  const now = new Date();
  const date =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const dateLastDigit = date.slice(-1);

  // 過濾掉會與日期尾數組成禁用配對的尾碼
  const validSuffixes = LUCKY_SUFFIXES.filter((s) => {
    const pair = `${dateLastDigit}${s[0]}`;
    return !BANNED_PAIRS.includes(pair);
  });
  const pool = validSuffixes.length > 0 ? validSuffixes : LUCKY_SUFFIXES;
  const suffix = pool[Math.floor(Math.random() * pool.length)];

  // 產生前 4 碼：每位獨立隨機，避免 0 和 5 過度集中（最多出現 1 次）
  // 同時確保相鄰數字不含禁用配對，且與日期首碼也不衝突
  let rand4: string;
  do {
    const digits: string[] = [];
    for (let i = 0; i < 4; i++) {
      digits.push(String(Math.floor(Math.random() * 10)));
    }
    rand4 = digits.join("");
    const zeroCount = rand4.split("0").length - 1;
    const fiveCount = rand4.split("5").length - 1;
    if (zeroCount > 1 || fiveCount > 1) continue;
  } while (
    hasBannedPair(rand4) ||
    BANNED_PAIRS.includes(rand4[3] + date[0]) ||
    (rand4.split("0").length - 1) > 1 ||
    (rand4.split("5").length - 1) > 1
  );

  return `${rand4}${date}${suffix}`;
}

interface CreateOrderInput {
  courseId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
}

export type CreateOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const { courseId, buyerName, buyerEmail, buyerPhone } = input;

  if (!buyerName.trim() || !buyerEmail.trim()) {
    return { success: false, error: "請填寫姓名和 Email" };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({
        where: { id: courseId, isPublished: true },
        include: { template: { select: { title: true, category: { select: { name: true } } } } },
      });

      if (!course) {
        throw new Error("課程不存在或已下架");
      }

      const remaining = course.totalSlots - course.soldCount;
      if (remaining <= 0) {
        throw new Error("此課程已額滿，無法報名");
      }

      // 建立訂單 — 自訂編號
      const orderId = generateOrderId();
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone?.trim() || null,
          totalPrice: course.price,
          paymentStatus: "PENDING",
          orderStatus: "CONFIRMED",
          items: {
            create: {
              courseId: course.id,
              quantity: 1,
              price: course.price,
            },
          },
        },
      });

      // 扣減庫存
      await tx.course.update({
        where: { id: courseId },
        data: { soldCount: { increment: 1 } },
      });

      return { order: newOrder, courseName: course.template.title, categoryName: course.template.category?.name, location: course.location, startDate: course.startDate, price: course.price };
    });

    // 寄報名通知信（含付款連結）
    try {
      console.log("準備寄信給:", order.order.buyerEmail);
      const emailResult = await sendRegistrationEmail({
        orderId: order.order.id,
        buyerName: order.order.buyerName,
        buyerEmail: order.order.buyerEmail,
        courseName: order.courseName,
        categoryName: order.categoryName,
        location: order.location ?? undefined,
        startDate: order.startDate ? new Date(order.startDate).toLocaleDateString("zh-TW") : undefined,
        price: order.price,
      });
      console.log("寄信結果:", JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error("寄信失敗:", emailErr);
      // 寄信失敗不影響訂單建立
    }

    return { success: true, orderId: order.order.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "下單失敗，請稍後再試";
    return { success: false, error: message };
  }
}
