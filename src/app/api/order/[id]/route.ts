import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            extras: true,
            menuItem: {
              select: { image: true, slug: true },
            },
          },
        },
        customer: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify token for security
    if (token && order.orderToken !== token) {
      return NextResponse.json(
        { error: "Invalid order token" },
        { status: 403 }
      );
    }

    // Also allow access by order number
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
