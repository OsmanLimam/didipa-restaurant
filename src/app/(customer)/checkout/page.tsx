'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, PAYMENT_METHODS } from '@/lib/constants';
import { Loader2, UtensilsCrossed, Minus, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + deliveryFee;

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      orderType: 'DELIVERY',
      deliveryAddress: '',
      deliveryNotes: '',
      orderNotes: '',
      paymentMethod: 'CASH_ON_DELIVERY',
    },
  });

  const orderType = form.watch('orderType');
  const paymentMethod = form.watch('paymentMethod');

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const cartItems = items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        extras: item.extras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
        specialInstructions: item.specialInstructions,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items: cartItems }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to place order');
        setIsSubmitting(false);
        return;
      }

      const result = await res.json();
      clearCart();
      router.push(`/order/${result.order?.orderToken || result.orderToken}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Nothing to checkout</h1>
        <p className="text-muted-foreground mb-4">Add items to your cart first</p>
        <Button asChild><Link href="/menu">Browse Menu</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    {...form.register('customerName')}
                    className="mt-1"
                    placeholder="Kwame Asante"
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    {...form.register('customerPhone')}
                    className="mt-1"
                    placeholder="0241234567"
                  />
                  {form.formState.errors.customerPhone && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.customerPhone.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...form.register('customerEmail')}
                  className="mt-1"
                  placeholder="kwame@example.com"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={orderType}
                onValueChange={(v) => form.setValue('orderType', v as 'DELIVERY' | 'PICKUP')}
                className="grid sm:grid-cols-2 gap-4"
              >
                {[
                  { value: 'DELIVERY', label: 'Delivery', desc: 'We deliver to your location' },
                  { value: 'PICKUP', label: 'Pickup', desc: 'Pick up from our restaurant' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      orderType === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <RadioGroupItem value={opt.value} />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Address (conditional) */}
          {orderType === 'DELIVERY' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deliveryAddress">Address *</Label>
                  <Input
                    id="deliveryAddress"
                    {...form.register('deliveryAddress')}
                    className="mt-1"
                    placeholder="e.g., House 12, Ring Road Central, Accra"
                  />
                  {form.formState.errors.deliveryAddress && (
                    <p className="text-xs text-red-500 mt-1">{form.formState.errors.deliveryAddress.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                  <Textarea
                    id="deliveryNotes"
                    {...form.register('deliveryNotes')}
                    className="mt-1"
                    placeholder="e.g., Gate code, landmark..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={form.watch('paymentMethod')}
                  onValueChange={(v) => form.setValue('paymentMethod', v as any)}
                  className="mt-2 space-y-2"
                >
                  {PAYMENT_METHODS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentMethod === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <RadioGroupItem value={opt.value} />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{opt.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          {opt.value === 'MTN_MOMO' && <p className="text-xs text-muted-foreground">Pay with MTN Mobile Money</p>}
                          {opt.value === 'VODAFONE_CASH' && <p className="text-xs text-muted-foreground">Pay with Vodafone Cash</p>}
                          {opt.value === 'AIRTELTIGO_MONEY' && <p className="text-xs text-muted-foreground">Pay with AirtelTigo Money</p>}
                          {opt.value === 'PAYSTACK' && <p className="text-xs text-muted-foreground">Card or Mobile Money via Paystack</p>}
                          {opt.value === 'CASH_ON_DELIVERY' && <p className="text-xs text-muted-foreground">Pay when your order arrives</p>}
                          {opt.value === 'PAY_ON_PICKUP' && <p className="text-xs text-muted-foreground">Pay when you pick up</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="orderNotes">Order Notes</Label>
                <Textarea
                  id="orderNotes"
                  {...form.register('orderNotes')}
                  className="mt-1"
                  placeholder="Any special requests for the kitchen..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const extrasTotal = item.extras.reduce((sum, e) => sum + e.price, 0);
                const itemTotal = (item.price + extrasTotal) * item.quantity;
                return (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                      {item.extras.length > 0 && (
                        <span className="text-xs block">+{item.extras.map((e) => e.name).join(', ')}</span>
                      )}
                    </span>
                    <span className="font-medium">{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>Place Order — {formatPrice(total)}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
