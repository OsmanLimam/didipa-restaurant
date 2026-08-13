import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      include: {
        category: true,
        extras: true,
      },
      orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, isPopular, isAvailable, preparationTime, ingredients, image, extras } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const menuItem = await db.menuItem.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        image: image || null,
        isPopular: isPopular || false,
        isAvailable: isAvailable !== false,
        preparationTime: preparationTime || null,
        ingredients: ingredients || null,
        categoryId,
      },
    });

    // Create extras if provided
    if (extras && Array.isArray(extras)) {
      for (const extra of extras) {
        await db.menuItemExtra.create({
          data: {
            name: extra.name,
            price: extra.price,
            menuItemId: menuItem.id,
          },
        });
      }
    }

    const fullItem = await db.menuItem.findUnique({
      where: { id: menuItem.id },
      include: { category: true, extras: true },
    });

    return NextResponse.json(fullItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
