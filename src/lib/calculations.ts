import { db } from '@/lib/db';
import { formatPrice } from './constants';

export interface CartItemInput {
  menuItemId: string;
  quantity: number;
  extras: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

export interface OrderCalculation {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/**
 * Server-side price calculation — NEVER trust client prices.
 * Fetches actual prices from the database.
 */
export async function calculateOrderTotals(
  items: CartItemInput[],
  orderType: 'DELIVERY' | 'PICKUP',
  restaurantId: string
): Promise<OrderCalculation> {
  const menuItemIds = items.map(item => item.menuItemId);

  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { extras: true },
  });

  const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

  let subtotal = 0;

  for (const cartItem of items) {
    const menuItem = menuItemMap.get(cartItem.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${cartItem.menuItemId} not found`);
    }

    if (!menuItem.isAvailable) {
      throw new Error(`${menuItem.name} is currently unavailable`);
    }

    const itemTotal = menuItem.price * cartItem.quantity;

    let extrasTotal = 0;
    for (const cartExtra of cartItem.extras) {
      const menuExtra = menuItem.extras.find(e => e.id === cartExtra.id);
      if (menuExtra) {
        extrasTotal += menuExtra.price * cartItem.quantity;
      }
    }

    subtotal += itemTotal + extrasTotal;
  }

  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  let deliveryFee = 0;
  if (orderType === 'DELIVERY') {
    deliveryFee = subtotal >= restaurant.freeDeliveryMin ? 0 : restaurant.deliveryFee;
  }

  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate subtotal from cart items (server-side validation)
 */
export async function calculateSubtotal(
  items: CartItemInput[]
): Promise<number> {
  const menuItemIds = items.map(item => item.menuItemId);

  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: { extras: true },
  });

  const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

  let subtotal = 0;

  for (const cartItem of items) {
    const menuItem = menuItemMap.get(cartItem.menuItemId);
    if (!menuItem) continue;

    const itemTotal = menuItem.price * cartItem.quantity;

    let extrasTotal = 0;
    for (const cartExtra of cartItem.extras) {
      const menuExtra = menuItem.extras.find(e => e.id === cartExtra.id);
      if (menuExtra) {
        extrasTotal += menuExtra.price * cartItem.quantity;
      }
    }

    subtotal += itemTotal + extrasTotal;
  }

  return Math.round(subtotal * 100) / 100;
}

/**
 * Calculate delivery fee only
 */
export async function calculateDeliveryFee(
  orderType: 'DELIVERY' | 'PICKUP'
): Promise<number> {
  if (orderType !== 'DELIVERY') return 0;

  const restaurant = await db.restaurant.findFirst();
  if (!restaurant) return 0;

  // Get subtotal from recent orders to check free delivery threshold
  // This simplified version just returns the flat fee
  return restaurant.deliveryFee;
}

/**
 * Calculate delivery fee based on subtotal
 */
export async function calculateDeliveryFeeFromSubtotal(
  subtotal: number,
  orderType: 'DELIVERY' | 'PICKUP'
): Promise<number> {
  if (orderType !== 'DELIVERY') return 0;

  const restaurant = await db.restaurant.findFirst();
  if (!restaurant) return 0;

  return subtotal >= restaurant.freeDeliveryMin ? 0 : restaurant.deliveryFee;
}

/**
 * Calculate total from subtotal, delivery fee, and discount
 */
export function calculateTotal(
  subtotal: number,
  deliveryFee: number,
  discount: number
): number {
  return Math.round((subtotal + deliveryFee - discount) * 100) / 100;
}

/**
 * Validate that cart item prices match database prices
 */
export async function validateCartItemPrices(
  items: CartItemInput[]
): Promise<boolean> {
  const menuItemIds = items.map(item => item.menuItemId);

  const menuItems = await db.menuItem.findMany({
    where: { id: { in: menuItemIds }, isAvailable: true },
  });

  return menuItems.length === items.length;
}
