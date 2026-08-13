import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const restaurant = await db.restaurant.findFirst({
      include: { hours: { orderBy: { dayOfWeek: "asc" } } },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const restaurant = await db.restaurant.findFirst();

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsappNumber !== undefined) updateData.whatsappNumber = body.whatsappNumber;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.deliveryFee !== undefined) updateData.deliveryFee = body.deliveryFee;
    if (body.minimumOrder !== undefined) updateData.minimumOrder = body.minimumOrder;
    if (body.preparationTime !== undefined) updateData.preparationTime = body.preparationTime;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await db.restaurant.update({
      where: { id: restaurant.id },
      data: updateData,
      include: { hours: { orderBy: { dayOfWeek: "asc" } } },
    });

    // Update hours if provided
    if (body.hours && Array.isArray(body.hours)) {
      for (const hour of body.hours) {
        if (hour.id) {
          await db.restaurantHours.update({
            where: { id: hour.id },
            data: {
              openTime: hour.openTime,
              closeTime: hour.closeTime,
              isClosed: hour.isClosed,
            },
          });
        }
      }
    }

    const fullRestaurant = await db.restaurant.findUnique({
      where: { id: restaurant.id },
      include: { hours: { orderBy: { dayOfWeek: "asc" } } },
    });

    return NextResponse.json(fullRestaurant);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
