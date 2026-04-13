"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  confirmPayment,
  refundOrder,
  updateOrderStatus,
  resendPaymentEmail,
} from "@/features/admin/actions/order.action";

interface OrderActionsProps {
  orderId: string;
  paymentStatus: string;
  orderStatus: string;
  buyerName: string;
}

export function OrderActions({
  orderId,
  paymentStatus,
  orderStatus,
  buyerName,
}: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handle(action: string, fn: () => Promise<void>) {
    setLoading(action);
    await fn();
    router.refresh();
    setLoading(null);
  }

  const disabled = loading !== null;
  const isPending = paymentStatus === "PENDING";
  const isPaid = paymentStatus === "PAID";
  const isRefunded = paymentStatus === "REFUNDED";
  const isCancelled = orderStatus === "CANCELLED";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* 付款相關 */}
      {isPending && (
        <>
          <button
            onClick={() =>
              handle("confirm", async () => {
                if (confirm(`確認「${buyerName}」的付款？將自動寄出確認信。`))
                  await confirmPayment(orderId);
              })
            }
            disabled={disabled}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading === "confirm" ? "..." : "確認付款"}
          </button>
          <button
            onClick={() =>
              handle("resend", async () => {
                if (confirm(`重新寄送付款連結給「${buyerName}」？`)) {
                  await resendPaymentEmail(orderId);
                  alert("已重新寄出！");
                }
              })
            }
            disabled={disabled}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {loading === "resend" ? "..." : "重寄連結"}
          </button>
        </>
      )}

      {isPaid && !isRefunded && (
        <button
          onClick={() =>
            handle("refund", async () => {
              if (confirm(`確定標記「${buyerName}」的訂單為已退款？`))
                await refundOrder(orderId);
            })
          }
          disabled={disabled}
          className="rounded-md border border-amber-300 px-2.5 py-1 text-xs text-amber-600 hover:bg-amber-50 disabled:opacity-50 transition-colors"
        >
          {loading === "refund" ? "..." : "標記退款"}
        </button>
      )}

      {/* 訂單狀態相關 */}
      {!isCancelled && orderStatus === "CONFIRMED" && (
        <button
          onClick={() =>
            handle("preparing", async () => {
              await updateOrderStatus(orderId, "PREPARING");
            })
          }
          disabled={disabled}
          className="rounded-md border border-blue-300 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {loading === "preparing" ? "..." : "準備中"}
        </button>
      )}

      {!isCancelled && orderStatus !== "COMPLETED" && (
        <button
          onClick={() =>
            handle("completed", async () => {
              await updateOrderStatus(orderId, "COMPLETED");
            })
          }
          disabled={disabled}
          className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
        >
          {loading === "completed" ? "..." : "已完成"}
        </button>
      )}

      {!isCancelled && (
        <button
          onClick={() =>
            handle("cancel", async () => {
              if (confirm(`確定取消「${buyerName}」的訂單？庫存將退回。`))
                await updateOrderStatus(orderId, "CANCELLED");
            })
          }
          disabled={disabled}
          className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
        >
          {loading === "cancel" ? "..." : "取消"}
        </button>
      )}
    </div>
  );
}
