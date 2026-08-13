'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice, PAYMENT_METHODS } from '@/lib/constants';
import { initializePaystackPopup, generatePaymentReference, getPaystackChannelsForMethod, getMoMoNetwork, isOnlinePaymentMethod, isMoMoPaymentMethod } from '@/lib/paystack';
import { Loader2, UtensilsCrossed, Minus, Plus, ArrowLeft, Phone, CreditCard, AlertCircle } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

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
      momoPhone: '',
    },
  });

  const orderType = form.watch('orderType');
  const paymentMethod = form.watch('paymentMethod');

  // Check for error params
  const paymentError = searchParams.get('error');

  // Show Paystack payment popup
  const handlePaystackPayment = async (orderId: string, orderToken: string, email: string, orderTotal: number) => {
    const reference = generatePaymentReference('DP');

    try {
      // Save payment reference to order
      await fetch('/api/checkout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentReference: reference }),
      });
    } catch {
      // Non-critical - continue with payment
    }

    setIsPaymentProcessing(true);
    toast.info('Opening payment gateway...', { duration: 2000 });

    try {
      await initializePaystackPopup({
        email,
        amount: orderTotal,
        reference,
        channels: getPaystackChannelsForMethod(paymentMethod),
        metadata: {
          orderId,
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          ],
        },
        onSuccess: async (response) => {
          toast.success('Payment successful! Verifying...', { duration: 2000 });

          try {
            // Verify payment on the server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: response.reference, orderId }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              toast.success('Payment verified! Redirecting...', { duration: 2000 });
              clearCart();
              router.push(`/order/${orderToken}?payment=success`);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setIsPaymentProcessing(false);
              setIsSubmitting(false);
            }
          } catch {
            toast.error('Could not verify payment. Your order has been placed.');
            clearCart();
            router.push(`/order/${orderToken}?payment=pending`);
          }
        },
        onClose: () => {
          setIsPaymentProcessing(false);
          setIsSubmitting(false);
          toast.info('Payment window closed. You can retry payment from your order page.', {
            duration: 5000,
          });
        },
      });
    } catch (error) {
      setIsPaymentProcessing(false);
      setIsSubmitting(false);
      toast.error(error instanceof Error ? error.message : 'Failed to open payment gateway');
    }
  };

  // Handle Mobile Money charge (MTN, Vodafone, AirtelTigo)
  const handleMoMoPayment = async (
    orderId: string,
    orderToken: string,
    email: string,
    orderTotal: number,
    momoPhone: string
  ) => {
    const network = getMoMoNetwork(paymentMethod);
    if (!network) {
      toast.error('Invalid mobile money network');
      setIsSubmitting(false);
      return;
    }

    setIsPaymentProcessing(true);
    toast.info('Sending payment request to your phone...', { duration: 3000 });

    try {
      const chargeRes = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          phone: momoPhone,
          network,
          email,
          amount: orderTotal,
        }),
      });

      const chargeData = await chargeRes.json();

      if (!chargeRes.ok) {
        toast.error(chargeData.error || 'Mobile Money payment failed');
        setIsPaymentProcessing(false);
        setIsSubmitting(false);
        return;
      }

      toast.success('Payment prompt sent! Please authorize on your phone.', {
        duration: 10000,
      });

      // Poll for payment verification
      const reference = chargeData.reference;
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts x 2s = 60s timeout

      const pollVerification = async () => {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference, orderId }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            toast.success('Payment confirmed!', { duration: 2000 });
            clearCart();
            router.push(`/order/${orderToken}?payment=success`);
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollVerification, 2000);
          } else {
            toast.info('Payment is still processing. Check your order status for updates.', {
              duration: 5000,
            });
            clearCart();
            router.push(`/order/${orderToken}?payment=pending`);
          }
        } catch {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollVerification, 2000);
          } else {
            clearCart();
            router.push(`/order/${orderToken}?payment=pending`);
          }
        }
      };

      // Start polling after 5 second delay
      setTimeout(pollVerification, 5000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Mobile Money payment failed');
      setIsPaymentProcessing(false);
      setIsSubmitting(false);
    }
  };

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

      // Create the order first
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
      const orderId = result.order?.id;
      const orderToken = result.order?.orderToken || result.orderToken;
      const orderTotal = result.order?.total || total;

      // Handle payment based on method
      if (data.paymentMethod === 'PAYSTACK') {
        // Paystack card/MoMo popup
        if (!data.customerEmail) {
          toast.error('Email is required for online payments');
          setIsSubmitting(false);
          return;
        }
        await handlePaystackPayment(orderId, orderToken, data.customerEmail, orderTotal);
      } else if (isMoMoPaymentMethod(data.paymentMethod)) {
        // Mobile Money charge
        if (!data.customerEmail) {
          toast.error('Email is required for Mobile Money payments');
          setIsSubmitting(false);
          return;
        }
        if (!data.momoPhone) {
          toast.error('Phone number is required for Mobile Money');
          setIsSubmitting(false);
          return;
        }
        await handleMoMoPayment(orderId, orderToken, data.customerEmail, orderTotal, data.momoPhone);
      } else {
        // Cash on delivery or pay on pickup - no online payment needed
        clearCart();
        router.push(`/order/${orderToken}`);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isProcessing = isSubmitting || isPaymentProcessing;

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

  // Check if current payment method requires email
  const requiresEmail = isOnlinePaymentMethod(paymentMethod);
  // Check if current payment method is MoMo (needs phone)
  const isMoMo = isMoMoPaymentMethod(paymentMethod);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {paymentError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Payment error: {paymentError === 'no_reference' ? 'No payment reference received' : paymentError === 'verification_failed' ? 'Payment verification failed' : 'Payment failed'}</span>
        </div>
      )}

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
                <Label htmlFor="customerEmail">
                  Email {requiresEmail ? '*' : '(optional)'}
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...form.register('customerEmail')}
                  className="mt-1"
                  placeholder="kwame@example.com"
                />
                {requiresEmail && !form.watch('customerEmail') && (
                  <p className="text-xs text-muted-foreground mt-1">Required for online payment confirmation</p>
                )}
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
                          {opt.value === 'PAYSTACK' && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CreditCard className="h-3 w-3" /> Card or Mobile Money via Paystack
                            </p>
                          )}
                          {opt.value === 'CASH_ON_DELIVERY' && <p className="text-xs text-muted-foreground">Pay when your order arrives</p>}
                          {opt.value === 'PAY_ON_PICKUP' && <p className="text-xs text-muted-foreground">Pay when you pick up</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* MoMo Phone Number Field */}
              {isMoMo && (
                <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Mobile Money Phone Number</span>
                  </div>
                  <Input
                    {...form.register('momoPhone')}
                    placeholder="e.g., 0241234567"
                    type="tel"
                  />
                  {form.formState.errors.momoPhone && (
                    <p className="text-xs text-red-500">{form.formState.errors.momoPhone.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {paymentMethod === 'MTN_MOMO' && 'Enter your MTN Mobile Money number. You\'ll receive a payment prompt on this phone.'}
                    {paymentMethod === 'VODAFONE_CASH' && 'Enter your Vodafone Cash number. You\'ll receive a payment prompt on this phone.'}
                    {paymentMethod === 'AIRTELTIGO_MONEY' && 'Enter your AirtelTigo Money number. You\'ll receive a payment prompt on this phone.'}
                  </p>
                </div>
              )}

              {/* Paystack info */}
              {paymentMethod === 'PAYSTACK' && (
                <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>Secure Payment via Paystack</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll be redirected to a secure Paystack payment page where you can pay with your
                    debit/credit card or Mobile Money. Your payment details are encrypted and secure.
                  </p>
                </div>
              )}

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
                disabled={isProcessing}
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing Payment...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    {isOnlinePaymentMethod(paymentMethod) ? `Pay ${formatPrice(total)}` : `Place Order — ${formatPrice(total)}`}
                  </>
                )}
              </Button>

              {isOnlinePaymentMethod(paymentMethod) && (
                <p className="text-xs text-center text-muted-foreground">
                  Secured by <span className="font-medium">Paystack</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
