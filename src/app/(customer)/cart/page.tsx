'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/constants';
import { UtensilsCrossed, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Explore our menu and add some delicious Ghanaian dishes!
        </p>
        <Button size="lg" asChild>
          <Link href="/menu">
            <UtensilsCrossed className="mr-2 h-5 w-5" />
            Browse Menu
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear All
        </Button>
      </div>

      {/* Cart Items with AnimatePresence for removal animations */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3 mb-6">
          {items.map((item) => {
            const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
            const itemTotal = (item.price + extrasTotal) * item.quantity;

            return (
              <motion.div
                key={item.menuItemId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  y: { duration: 0.3 },
                  x: { duration: 0.3 },
                }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <UtensilsCrossed className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{item.name}</p>
                            {item.extras.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                +{item.extras.map((e) => e.name).join(', ')}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                            onClick={() => removeItem(item.menuItemId)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3, color: '#d97706' }}
                              animate={{ scale: 1, color: 'inherit' }}
                              transition={{ duration: 0.25 }}
                              className="text-sm font-bold w-6 text-center"
                            >
                              {item.quantity}
                            </motion.span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <motion.p
                            key={itemTotal}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="font-bold text-sm"
                          >
                            {formatPrice(itemTotal)}
                          </motion.p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryFee)}</span>
          </div>
          {deliveryFee === 0 && subtotal > 0 && (
            <p className="text-xs text-green-600">Free delivery on orders over {formatPrice(100)}!</p>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          <Button size="lg" className="w-full mt-2 gap-2" asChild>
            <Link href="/checkout">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
