import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const restaurant = await db.restaurant.findFirst({
      include: {
        hours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant info" },
      { status: 500 }
    );
  }
}
