'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, getStatusConfig, DAYS_OF_WEEK, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { CheckCircle2, Clock, UtensilsCrossed, ChefHat, Package, Truck, XCircle, MessageCircle, ArrowLeft, Loader2, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress?: string | null;
  deliveryNotes?: string | null;
  orderNotes?: string | null;
  paymentMethod: string;
  paymentStatus?: string;
  paymentReference?: string | null;
  createdAt: string;
  customer: { name: string; phone: string };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string | null;
    extras: { name: string; price: number }[];
    menuItem: { image: string | null; slug: string };
  }[];
  statusHistory: {
    status: string;
    createdAt: string;
  }[];
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PREPARING: ChefHat,
  READY: UtensilsCrossed,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Package,
  CANCELLED: XCircle,
  PAYMENT_CONFIRMED: ShieldCheck,
};

// Payment status configuration
const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  PAID: { label: 'Payment Verified', icon: ShieldCheck, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20' },
  PENDING: { label: 'Payment Pending', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' },
  UNPAID: { label: 'Payment Pending', icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  FAILED: { label: 'Payment Failed', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20' },
};

function PaymentStatusIndicator({ paymentStatus, paymentMethod, paymentReference }: {
  paymentStatus?: string;
  paymentMethod: string;
  paymentReference?: string | null;
}) {
  const status = paymentStatus || 'UNPAID';
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.UNPAID;
  const Icon = config.icon;
  const isOnlinePayment = ['MTN_MOMO', 'VODAFONE_CASH', 'AIRTELTIGO_MONEY', 'PAYSTACK'].includes(paymentMethod);

  // Don't show indicator for cash payments
  if (!isOnlinePayment && (paymentMethod === 'CASH_ON_DELIVERY' || paymentMethod === 'PAY_ON_PICKUP')) {
    return (
      <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cash Payment</p>
          <p className="text-xs text-muted-foreground">
            {paymentMethod === 'CASH_ON_DELIVERY' ? 'Pay when your order arrives' : 'Pay when you pick up'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${config.bgColor} flex items-center gap-3 border`}>
      <Icon className={`h-5 w-5 ${config.color}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        {paymentReference && (
          <p className="text-xs text-muted-foreground">Ref: {paymentReference}</p>
        )}
        {status === 'PENDING' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete payment to confirm your order
          </p>
        )}
        {status === 'FAILED' && (
          <p className="text-xs text-red-500 mt-0.5">
            Please try placing your order again
          </p>
        )}
      </div>
      {status === 'PAID' && (
        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          Verified
        </Badge>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentParam = searchParams.get('payment');

  useEffect(() => {
    fetch(`/api/order/${params.id}?token=${params.id}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <XCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground mb-4">Please check the link and try again</p>
        <Button asChild><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const whatsappLink = generateWhatsAppLink({
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      extras: i.extras.map((e) => e.name),
      price: (i.price + i.extras.reduce((s, e) => s + e.price, 0)) * i.quantity,
    })),
    total: order.total,
    type: order.type as 'DELIVERY' | 'PICKUP',
    deliveryAddress: order.deliveryAddress || undefined,
    orderNotes: order.orderNotes || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Order Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
        <Badge className={`mt-2 ${statusConfig.color}`}>
          {statusConfig.label}
        </Badge>
        {order.status === 'DELIVERED' && (
          <div className="mt-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-medium text-green-600">Your order has been delivered!</p>
            <p className="text-sm text-muted-foreground">Thank you for ordering from DidiPa</p>
          </div>
        )}

        {/* Payment success banner from URL param */}
        {paymentParam === 'success' && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Payment completed successfully!</span>
          </div>
        )}
        {paymentParam === 'pending' && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Payment is being processed...</span>
          </div>
        )}
        {paymentParam === 'failed' && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Payment failed. Please try again.</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Payment Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            <PaymentStatusIndicator
              paymentStatus={order.paymentStatus}
              paymentMethod={order.paymentMethod}
              paymentReference={order.paymentReference}
            />
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {order.statusHistory
                .filter((entry) => entry.status !== 'PAYMENT_CONFIRMED')
                .map((entry, idx, filtered) => {
                  const Icon = STATUS_ICONS[entry.status] || Clock;
                  const sc = getStatusConfig(entry.status);
                  const isLast = idx === filtered.length - 1;
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isLast ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className={`font-medium text-sm ${isLast ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {sc.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => {
              const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
              const itemTotal = (item.price + extrasTotal) * item.quantity;
              return (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    {item.extras.length > 0 && (
                      <p className="text-xs text-muted-foreground">+{item.extras.map((e) => e.name).join(', ')}</p>
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(itemTotal)}</span>
                </div>
              );
            })}
            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            {order.deliveryAddress && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Deliver to: {order.deliveryAddress}</p>
              </div>
            )}
            {order.orderNotes && (
              <p className="text-xs text-muted-foreground italic">Note: {order.orderNotes}</p>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Button */}
        <Button size="lg" variant="outline" className="w-full gap-2" asChild>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Continue on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
