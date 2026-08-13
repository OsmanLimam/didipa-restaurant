import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingOrders,
      totalRevenue,
      totalOrders,
      recentOrders,
      popularItems,
    ] = await Promise.all([
      // Today's orders
      db.order.findMany({
        where: { createdAt: { gte: today } },
      }),
      // Pending orders
      db.order.count({ where: { status: "PENDING" } }),
      // Total revenue (non-cancelled)
      db.order.aggregate({
        where: { status: { notIn: ["CANCELLED"] } },
        _sum: { total: true },
      }),
      // Total orders count
      db.order.count(),
      // Recent orders
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          items: { include: { extras: true } },
        },
      }),
      // Popular items
      db.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const todayRevenue = todayOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);

    const todayCount = todayOrders.length;
    const completedToday = todayOrders.filter((o) => o.status === "DELIVERED").length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

    return NextResponse.json({
      todayRevenue,
      todayCount,
      pendingOrders,
      completedToday,
      avgOrderValue,
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      recentOrders,
      popularItems,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
