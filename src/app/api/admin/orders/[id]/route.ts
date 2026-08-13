import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidStatusTransition } from "@/lib/order-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            extras: true,
            menuItem: {
              select: { name: true, image: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate status transition
    if (status && !isValidStatusTransition(order.status, status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status, updatedAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          changedBy: "ADMIN",
        },
      });

      return updated;
    });

    const fullOrder = await db.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        customer: true,
        items: { include: { extras: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json(fullOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
