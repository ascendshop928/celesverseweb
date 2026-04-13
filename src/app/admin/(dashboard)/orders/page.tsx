// 管理後台 — 訂單列表
import { prisma } from "@/lib/prisma";
import { OrderActions } from "@/features/admin/components/OrderActions";
import { OrderFilters } from "@/features/admin/components/OrderFilters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const paymentLabel: Record<string, { text: string; className: string }> = {
  PENDING: { text: "待付款", className: "bg-amber-100 text-amber-700" },
  PAID: { text: "已付款", className: "bg-emerald-100 text-emerald-700" },
  REFUNDED: { text: "已退款", className: "bg-purple-100 text-purple-700" },
};

const orderLabel: Record<string, { text: string; className: string }> = {
  CONFIRMED: { text: "已確認", className: "bg-blue-100 text-blue-700" },
  PREPARING: { text: "準備中", className: "bg-cyan-100 text-cyan-700" },
  COMPLETED: { text: "已完成", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { text: "已取消", className: "bg-zinc-100 text-zinc-500" },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; year?: string; month?: string }>;
}) {
  const { search, year, month } = await searchParams;

  // 建立查詢條件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { buyerName: { contains: search, mode: "insensitive" } },
      { buyerEmail: { contains: search, mode: "insensitive" } },
      { buyerPhone: { contains: search } },
    ];
  }

  if (year && month && !isNaN(Number(year)) && !isNaN(Number(month))) {
    const y = Number(year);
    const m = Number(month);
    if (y > 2000 && m >= 1 && m <= 12) {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      where.createdAt = { gte: start, lt: end };
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          course: {
            select: { template: { select: { title: true } } },
          },
        },
      },
    },
  });


  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">訂單管理</h1>

      {/* 搜尋 + 篩選 + 匯出 */}
      <Suspense>
        <OrderFilters />
      </Suspense>

      {/* 篩選結果提示 */}
      <p className="text-xs text-zinc-400 mb-4">
        共 {orders.length} 筆訂單
        {search && <span> · 搜尋「{search}」</span>}
        {year && month && <span> · {year} 年 {month} 月</span>}
      </p>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-zinc-400">
          {search || month ? "沒有符合條件的訂單" : "還沒有任何訂單"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">訂單編號</th>
                <th className="px-4 py-3 font-medium">購買者</th>
                <th className="px-4 py-3 font-medium">課程</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">付款</th>
                <th className="px-4 py-3 font-medium">訂單</th>
                <th className="px-4 py-3 font-medium">時間</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => {
                const payment =
                  paymentLabel[order.paymentStatus] ?? paymentLabel.PENDING;
                const status =
                  orderLabel[order.orderStatus] ?? orderLabel.CONFIRMED;
                return (
                  <tr key={order.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {order.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-zinc-900">{order.buyerName}</div>
                      <div className="text-xs text-zinc-400">
                        {order.buyerEmail}
                      </div>
                      {order.buyerPhone && (
                        <div className="text-xs text-zinc-400">
                          {order.buyerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {order.items
                        .map((item) => item.course.template.title)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 text-zinc-900">
                      NT$ {order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${payment.className}`}
                      >
                        {payment.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3">
                      <OrderActions
                        orderId={order.id}
                        paymentStatus={order.paymentStatus}
                        orderStatus={order.orderStatus}
                        buyerName={order.buyerName}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
