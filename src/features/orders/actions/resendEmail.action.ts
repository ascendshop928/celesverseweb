"use server";

import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail } from "@/lib/email";

export async function resendConfirmationEmail(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            course: {
              include: {
                template: { select: { title: true, category: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    if (!order) return { success: false, error: "找不到訂單" };

    const firstItem = order.items[0];
    if (!firstItem) return { success: false, error: "訂單無課程資料" };

    await sendRegistrationEmail({
      orderId: order.id,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      courseName: firstItem.course.template.title,
      categoryName: firstItem.course.template.category?.name,
      location: firstItem.course.location ?? undefined,
      startDate: firstItem.course.startDate ? new Date(firstItem.course.startDate).toLocaleDateString("zh-TW") : undefined,
      price: order.totalPrice,
    });

    return { success: true };
  } catch (e) {
    console.error("重寄確認信失敗:", e);
    return { success: false, error: "寄送失敗，請稍後再試" };
  }
}
