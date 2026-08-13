import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.isPopular !== undefined) updateData.isPopular = body.isPopular;
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;
    if (body.preparationTime !== undefined) updateData.preparationTime = body.preparationTime;
    if (body.ingredients !== undefined) updateData.ingredients = body.ingredients;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;

    if (body.name) {
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const menuItem = await db.menuItem.update({
      where: { id },
      data: updateData,
      include: { category: true, extras: true },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.menuItemExtra.deleteMany({ where: { menuItemId: id } });
    await db.menuItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
