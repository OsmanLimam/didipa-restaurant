import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations";
import { calculateSubtotal, calculateDeliveryFeeFromSubtotal, calculateTotal, validateCartItemPrices } from "@/lib/calculations";
import { generateOrderNumber, generateOrderToken } from "@/lib/order-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, ...checkoutData } = body;

    // Validate checkout data
    const validated = checkoutSchema.parse(checkoutData);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate all cart item prices against DB
    const cartItems = items.map((item: { menuItemId: string; quantity: number; extras: { id: string; name: string; price: number }[] }) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      extras: item.extras || [],
    }));

    const isValid = await validateCartItemPrices(cartItems);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid cart items. Some items may have changed." },
        { status: 400 }
      );
    }

    // Calculate prices server-side
    const subtotal = await calculateSubtotal(cartItems);
    const deliveryFee = await calculateDeliveryFeeFromSubtotal(subtotal, validated.orderType);
    const total = calculateTotal(subtotal, deliveryFee, 0);

    // Check minimum order
    const restaurant = await db.restaurant.findFirst();
    if (restaurant && subtotal < restaurant.minimumOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is GH₵${restaurant.minimumOrder}` },
        { status: 400 }
      );
    }

    // Create or find customer
    let customer = await db.customer.findFirst({
      where: { phone: validated.customerPhone },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: validated.customerName,
          phone: validated.customerPhone,
          email: validated.customerEmail || null,
        },
      });
    } else {
      await db.customer.update({
        where: { id: customer.id },
        data: {
          name: validated.customerName,
          email: validated.customerEmail || customer.email,
        },
      });
    }

    // Generate order number and token
    const orderNumber = await generateOrderNumber();
    const orderToken = generateOrderToken();

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer!.id,
          type: validated.orderType,
          status: "PENDING",
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          deliveryAddress: validated.deliveryAddress || null,
          deliveryNotes: validated.deliveryNotes || null,
          orderNotes: validated.orderNotes || null,
          paymentMethod: validated.paymentMethod,
          orderToken,
        },
      });

      // Create order items
      for (const item of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) continue;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || null,
          },
        });

        // Create order item extras
        if (item.extras && item.extras.length > 0) {
          for (const extra of item.extras) {
            await tx.orderItemExtra.create({
              data: {
                name: extra.name,
                price: extra.price,
                orderItemId: orderItem.id,
              },
            });
          }
        }
      }

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          changedBy: "SYSTEM",
        },
      });

      return newOrder;
    });

    // Fetch the complete order with items
    const completeOrder = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            extras: true,
            menuItem: {
              select: { image: true },
            },
          },
        },
        customer: true,
        statusHistory: true,
      },
    });

    return NextResponse.json({ order: completeOrder, orderToken }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid checkout data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
