import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      where: { isAvailable: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        extras: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
