// 課程報名詳情頁
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCourseStatus, courseStatusLabels } from "@/lib/course-status";
import { InlineMoveButton } from "@/features/admin/components/InlineMoveButton";
import { DuplicateCourseButton } from "@/features/admin/components/DuplicateCourseButton";

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

export default async function CourseDetailAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      template: { include: { category: true } },
      teacher: true,
    },
  });

  if (!course) notFound();

  const orderItems = await prisma.orderItem.findMany({
    where: { courseId: id },
    include: { order: true },
    orderBy: { order: { createdAt: "desc" } },
  });

  // 可移動到的課程
  const otherCourses = await prisma.course.findMany({
    where: { id: { not: id } },
    select: {
      id: true,
      template: { select: { title: true } },
      totalSlots: true,
      soldCount: true,
      startDate: true,
    },
    orderBy: { startDate: "asc" },
  });

  const otherCoursesData = otherCourses.map((c) => ({
    id: c.id,
    title: c.template.title,
    remaining: c.totalSlots - c.soldCount,
    startDate: c.startDate?.toISOString().split("T")[0] ?? null,
  }));

  const status = getCourseStatus(course);
  const statusInfo = courseStatusLabels[status];
  const remaining = course.totalSlots - course.soldCount;

  const paidCount = orderItems.filter((i) => i.order.paymentStatus === "PAID").length;
  const pendingCount = orderItems.filter((i) => i.order.paymentStatus === "PENDING").length;
  const cancelledCount = orderItems.filter((i) => i.order.orderStatus === "CANCELLED").length;
  const refundedCount = orderItems.filter((i) => i.order.paymentStatus === "REFUNDED").length;

  return (
    <div>
      <Link
        href="/admin"
        className="text-zinc-400 hover:text-zinc-600 text-sm"
      >
        &larr; 返回
      </Link>

      <div className="flex items-start justify-between mt-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{course.template.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {course.template.category && (
              <span className="text-xs text-zinc-400">{course.template.category.name}</span>
            )}
            {course.teacher && (
              <span className="text-xs text-zinc-400">{course.teacher.name}</span>
            )}
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${course.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
              {course.isPublished ? "已上架" : "未上架"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DuplicateCourseButton
            courseId={id}
            courseName={course.template.title}
          />
          <Link
            href={`/admin/courses/${id}/edit`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            編輯課程
          </Link>
        </div>
      </div>

      {/* 概覽 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">日期</p>
          <p className="text-sm font-medium text-zinc-900">
            {course.startDate
              ? new Date(course.startDate).toLocaleDateString("zh-TW")
              : "未設定"}
            {course.endDate && (
              <> ~ {new Date(course.endDate).toLocaleDateString("zh-TW")}</>
            )}
          </p>
          {course.isPostponed && course.postponedTo && (
            <p className="text-xs text-red-500 mt-1">
              延期至 {new Date(course.postponedTo).toLocaleDateString("zh-TW")}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">名額</p>
          <p className="text-sm font-medium text-zinc-900">
            {course.soldCount} / {course.totalSlots}
            {remaining <= 0 && <span className="text-red-500 ml-1">額滿</span>}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">已付款</p>
          <p className="text-sm font-medium text-emerald-600">{paidCount} 人</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">待付款</p>
          <p className="text-sm font-medium text-amber-600">{pendingCount} 人</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="text-xs text-zinc-400 mb-1">取消 / 退款</p>
          <p className="text-sm font-medium text-zinc-500">
            {cancelledCount} / {refundedCount}
          </p>
        </div>
      </div>

      {/* 報名明細 */}
      <h2 className="text-lg font-semibold text-zinc-800 mb-4">
        報名明細（{orderItems.length}）
      </h2>

      {orderItems.length === 0 ? (
        <p className="py-8 text-center text-zinc-400">尚無報名</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">電話</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">付款</th>
                <th className="px-4 py-3 font-medium">訂單</th>
                <th className="px-4 py-3 font-medium">時間</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orderItems.map((item) => {
                const p = paymentLabel[item.order.paymentStatus] ?? paymentLabel.PENDING;
                const o = orderLabel[item.order.orderStatus] ?? orderLabel.CONFIRMED;
                const isCancelled = item.order.orderStatus === "CANCELLED";
                return (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/students/${encodeURIComponent(item.order.buyerEmail)}`}
                        className="text-zinc-900 font-medium hover:text-gold-dust transition-colors"
                      >
                        {item.order.buyerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {item.order.buyerEmail}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {item.order.buyerPhone || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-900">
                      NT$ {item.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.className}`}>
                        {p.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${o.className}`}>
                        {o.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {new Date(item.order.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="px-4 py-3">
                      {!isCancelled && (
                        <InlineMoveButton
                          orderItemId={item.id}
                          fromCourseId={id}
                          studentName={item.order.buyerName}
                          otherCourses={otherCoursesData}
                        />
                      )}
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
