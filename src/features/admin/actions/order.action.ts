"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  sendPaymentConfirmedEmail,
  sendRegistrationEmail,
} from "@/lib/email";

async function requireAdmin() {
  const adminId = await getSession();
  if (!adminId) redirect("/admin/login");
  return adminId;
}

/** 確認付款 */
export async function confirmPayment(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { course: { include: { template: { select: { title: true } } } } } } },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });

  const firstItem = order.items[0];
  if (firstItem) {
    try {
      await sendPaymentConfirmedEmail({
        orderId: order.id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        courseName: firstItem.course.template.title,
        price: order.totalPrice,
      });
    } catch (err) {
      console.error("寄確認信失敗:", err);
    }
  }

  revalidatePath("/admin/orders");
}

/** 退款 */
export async function refundOrder(orderId: string) {
  await requireAdmin();

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "REFUNDED" },
  });

  revalidatePath("/admin/orders");
}

/** 更新訂單狀態 */
export async function updateOrderStatus(
  orderId: string,
  orderStatus: "CONFIRMED" | "PREPARING" | "COMPLETED" | "CANCELLED"
) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return;

  if (orderStatus === "CANCELLED" && order.orderStatus !== "CANCELLED") {
    // 取消訂單退回庫存
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: "CANCELLED" },
      });

      for (const item of order.items) {
        await tx.course.update({
          where: { id: item.courseId },
          data: { soldCount: { decrement: item.quantity } },
        });
      }
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus },
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/");
}

/** 重寄付款連結信 */
export async function resendPaymentEmail(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { course: { include: { template: { select: { title: true } } } } } } },
  });

  if (!order) return;

  const firstItem = order.items[0];
  if (firstItem) {
    try {
      await sendRegistrationEmail({
        orderId: order.id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        courseName: firstItem.course.template.title,
        price: order.totalPrice,
      });
    } catch (err) {
      console.error("重寄信失敗:", err);
    }
  }

  revalidatePath("/admin/orders");
}
