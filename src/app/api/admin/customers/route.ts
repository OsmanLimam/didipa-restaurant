import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedCustomers = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        orderCount: customer._count.orders,
        totalSpent,
        lastOrder: customer.orders[0]?.createdAt || null,
        createdAt: customer.createdAt,
      };
    });

    return NextResponse.json(enrichedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
