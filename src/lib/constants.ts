// Order status configuration
export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { value: 'PREPARING', label: 'Preparing', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { value: 'READY', label: 'Ready', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery' },
  { value: 'PAY_ON_PICKUP', label: 'Pay on Pickup' },
] as const;

export const ORDER_TYPES = [
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PICKUP', label: 'Pickup' },
] as const;

export const CEDI_SYMBOL = 'GH₵';

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidStatusTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getStatusConfig(status: string) {
  return ORDER_STATUSES.find(s => s.value === status) ?? ORDER_STATUSES[0];
}

export function formatPrice(price: number): string {
  return `${CEDI_SYMBOL} ${price.toFixed(2)}`;
}

export function formatPriceShort(price: number): string {
  return `${CEDI_SYMBOL}${price.toFixed(2)}`;
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  DELIVERY: 'Delivery',
  PICKUP: 'Pickup',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  PAY_ON_PICKUP: 'Pay on Pickup',
};

export function generateOrderNumber(existingCount: number): string {
  return `MK-${1001 + existingCount}`;
}
