// 學生詳情頁 — 上課紀錄、訂單歷史
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCourseStatus, courseStatusLabels } from "@/lib/course-status";

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

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);

  // 找到所有這個 email 的訂單
  const orders = await prisma.order.findMany({
    where: { buyerEmail: email },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          course: {
            include: {
              template: { include: { category: true } },
              teacher: true,
            },
          },
        },
      },
    },
  });

  if (orders.length === 0) notFound();

  const latestOrder = orders[0];
  const studentName = latestOrder.buyerName;
  const phone = latestOrder.buyerPhone;

  // 統計
  const totalOrders = orders.length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const coursesTaken = new Set(
    orders
      .filter((o) => o.orderStatus !== "CANCELLED")
      .flatMap((o) => o.items.map((i) => i.courseId))
  ).size;

  return (
    <div>
      <Link
        href="/admin"
        className="text-zinc-400 hover:text-zinc-600 text-sm"
      >
        &larr; 返回
      </Link>

      {/* 學生資訊 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{studentName}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
          <span>{email}</span>
          {phone && <span>{phone}</span>}
        </div>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">報名次數</p>
          <p className="text-xl font-medium text-zinc-900">{totalOrders}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">參加課程</p>
          <p className="text-xl font-medium text-zinc-900">{coursesTaken} 門</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">累計消費</p>
          <p className="text-xl font-medium text-zinc-900">
            NT$ {totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 上課紀錄 */}
      <h2 className="text-lg font-semibold text-zinc-800 mb-4">
        上課紀錄
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    (paymentLabel[order.paymentStatus] ?? paymentLabel.PENDING).className
                  }`}
                >
                  {(paymentLabel[order.paymentStatus] ?? paymentLabel.PENDING).text}
                </span>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    (orderLabel[order.orderStatus] ?? orderLabel.CONFIRMED).className
                  }`}
                >
                  {(orderLabel[order.orderStatus] ?? orderLabel.CONFIRMED).text}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {new Date(order.createdAt).toLocaleDateString("zh-TW")}
              </span>
            </div>

            {order.items.map((item) => {
              const courseStatus = getCourseStatus(item.course);
              const csInfo = courseStatusLabels[courseStatus];
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/courses/${item.course.id}`}
                      className="text-sm font-medium text-zinc-900 hover:text-gold-dust transition-colors"
                    >
                      {item.course.template.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {item.course.template.category && (
                        <span className="text-xs text-zinc-400">
                          {item.course.template.category.name}
                        </span>
                      )}
                      {item.course.teacher && (
                        <span className="text-xs text-zinc-400">
                          {item.course.teacher.name}
                        </span>
                      )}
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${csInfo.className}`}>
                        {csInfo.text}
                      </span>
                      {item.course.startDate && (
                        <span className="text-xs text-zinc-400">
                          {new Date(item.course.startDate).toLocaleDateString("zh-TW")}
                          {item.course.endDate && (
                            <> ~ {new Date(item.course.endDate).toLocaleDateString("zh-TW")}</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-900">
                    NT$ {item.price.toLocaleString()}
                  </span>
                </div>
              );
            })}

            {order.note && (
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-400">備註</p>
                <p className="text-sm text-zinc-600 mt-1">{order.note}</p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400">
                {order.id}
              </span>
              <span className="text-sm font-medium text-zinc-900">
                NT$ {order.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
