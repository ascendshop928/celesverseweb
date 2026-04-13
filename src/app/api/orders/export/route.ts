import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const paymentLabels: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已付款",
  REFUNDED: "已退款",
};

const orderLabels: Record<string, string> = {
  CONFIRMED: "已確認",
  PREPARING: "準備中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export async function GET(request: NextRequest) {
  const adminId = await getSession();
  if (!adminId) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const month = searchParams.get("month") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const orderStatus = searchParams.get("orderStatus") || "";

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

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where.createdAt = { gte: start, lt: end };
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (orderStatus) {
    where.orderStatus = orderStatus;
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

  // 產生 CSV（加 BOM 讓 Excel/Google Sheets 正確顯示中文）
  const BOM = "\uFEFF";
  const header = "訂單編號,姓名,Email,電話,課程,金額,付款狀態,訂單狀態,建立日期";
  const rows = orders.map((order) => {
    const courses = order.items.map((i) => i.course.template.title).join("；");
    return [
      order.id,
      escapeCsv(order.buyerName),
      order.buyerEmail,
      order.buyerPhone || "",
      escapeCsv(courses),
      order.totalPrice,
      paymentLabels[order.paymentStatus] || order.paymentStatus,
      orderLabels[order.orderStatus] || order.orderStatus,
      new Date(order.createdAt).toLocaleDateString("zh-TW"),
    ].join(",");
  });

  const csv = BOM + header + "\n" + rows.join("\n");

  const filename = month
    ? `orders_${month}.csv`
    : `orders_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
