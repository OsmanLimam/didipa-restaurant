"use client";

import { useCartStore } from "@/stores/cart-store";
import { formatPriceShort } from "@/lib/constants";

interface CartSummaryProps {
  deliveryFee?: number;
  showDelivery?: boolean;
}

export function CartSummary({ deliveryFee = 0, showDelivery = false }: CartSummaryProps) {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const total = subtotal + (showDelivery ? deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex justify-between text-sm">
            <span className="truncate mr-2">
              {item.quantity}x {item.name}
            </span>
            <span className="font-medium shrink-0">
              {formatPriceShort((item.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">{formatPriceShort(subtotal)}</span>
        </div>
        {showDelivery && (
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span className="font-medium">{formatPriceShort(deliveryFee)}</span>
          </div>
        )}
      </div>
      <div className="border-t pt-2 flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-primary">{formatPriceShort(total)}</span>
      </div>
    </div>
  );
}
