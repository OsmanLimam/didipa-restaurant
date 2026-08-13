import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Revenue over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ["CANCELLED"] },
      },
      include: { items: true },
    });

    // Daily revenue
    const dailyRevenue: Record<string, number> = {};
    const dailyOrders: Record<string, number> = {};

    for (const order of orders) {
      const day = order.createdAt.toISOString().split("T")[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + order.total;
      dailyOrders[day] = (dailyOrders[day] || 0) + 1;
    }

    // Orders by status
    const allOrders = await db.order.findMany({
      select: { status: true },
    });
    const statusCounts: Record<string, number> = {};
    for (const o of allOrders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    // Popular items
    const orderItems = await db.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    // Category performance
    const categories = await db.category.findMany({
      include: {
        menuItems: {
          include: {
            orderItems: {
              where: { order: { status: { notIn: ["CANCELLED"] } } },
            },
          },
        },
      },
    });

    const categoryPerformance = categories.map((cat) => {
      const totalQuantity = cat.menuItems.reduce(
        (sum, item) => sum + item.orderItems.reduce((s, oi) => s + oi.quantity, 0),
        0
      );
      const totalRevenue = cat.menuItems.reduce(
        (sum, item) => sum + item.orderItems.reduce((s, oi) => s + oi.price * oi.quantity, 0),
        0
      );
      return {
        category: cat.name,
        totalQuantity,
        totalRevenue,
      };
    });

    // Delivery vs Pickup
    const deliveryCount = allOrders.filter((o) => o.status !== "CANCELLED").length;
    const typeCounts = await db.order.groupBy({
      by: ["type"],
      _count: true,
      where: { status: { notIn: ["CANCELLED"] } },
    });

    return NextResponse.json({
      dailyRevenue,
      dailyOrders,
      statusCounts,
      popularItems: orderItems,
      categoryPerformance,
      typeCounts,
      totalOrders: deliveryCount,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
