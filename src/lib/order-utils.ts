import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function generateOrderNumber(): Promise<string> {
  const lastOrder = await db.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let nextNum = 1001;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.orderNumber.replace("MK-", ""), 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  return `MK-${nextNum}`;
}

export function generateOrderToken(): string {
  return uuidv4();
}

export const ORDER_STATUSES = [
  { value: "PENDING", label: "Order Received", color: "bg-yellow-100 text-yellow-800", dotColor: "bg-yellow-500" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-800", dotColor: "bg-blue-500" },
  { value: "PREPARING", label: "Preparing", color: "bg-orange-100 text-orange-800", dotColor: "bg-orange-500" },
  { value: "READY", label: "Ready", color: "bg-green-100 text-green-800", dotColor: "bg-green-500" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "bg-purple-100 text-purple-800", dotColor: "bg-purple-500" },
  { value: "DELIVERED", label: "Delivered", color: "bg-emerald-100 text-emerald-800", dotColor: "bg-emerald-500" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800", dotColor: "bg-red-500" },
] as const;

export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidStatusTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function getStatusConfig(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status) || {
    value: status,
    label: status,
    color: "bg-gray-100 text-gray-800",
    dotColor: "bg-gray-500",
  };
}
