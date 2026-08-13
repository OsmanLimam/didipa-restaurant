'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, getStatusConfig, DAYS_OF_WEEK } from '@/lib/constants';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { CheckCircle2, Clock, UtensilsCrossed, ChefHat, Package, Truck, XCircle, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
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
};

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <p className="text-sm text-muted-foreground">Thank you for ordering from Mama&apos;s Kitchen</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {order.statusHistory.map((entry, idx) => {
                const Icon = STATUS_ICONS[entry.status] || Clock;
                const sc = getStatusConfig(entry.status);
                const isLast = idx === order.statusHistory.length - 1;
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
