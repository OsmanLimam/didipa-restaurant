"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatPriceShort, ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getStatusConfig, VALID_TRANSITIONS } from "@/lib/order-utils";
import { toast } from "sonner";

interface OrderDetail {
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
  customer: { name: string; phone: string; email?: string | null };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string | null;
    extras: { name: string; price: number }[];
    menuItem: { name: string; image: string | null };
  }[];
  statusHistory: {
    status: string;
    changedBy?: string | null;
    createdAt: string;
  }[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch (error) {
        console.error(error);
      }
      if (!cancelled) setIsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update status");
        setUpdating(false);
        return;
      }
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrder();
    } catch (error) {
      toast.error("Failed to update status");
    }
    setUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-16">Order not found</div>;
  }

  const statusConfig = getStatusConfig(order.status);
  const validNextStatuses = VALID_TRANSITIONS[order.status] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.name}
                      </p>
                      {item.extras.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          + {item.extras.map((e) => e.name).join(", ")}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground italic">
                          {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="font-medium">
                      {formatPriceShort(
                        (item.price +
                          item.extras.reduce((s, e) => s + e.price, 0)) *
                          item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPriceShort(order.subtotal)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatPriceShort(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPriceShort(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.statusHistory.map((h, idx) => {
                  const sc = getStatusConfig(h.status);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-sm py-1"
                    >
                      <div className={`h-2 w-2 rounded-full ${sc.dotColor}`} />
                      <span className="font-medium">{sc.label}</span>
                      <span className="text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString("en-GH", {
                          timeZone: "Africa/Accra",
                        })}
                      </span>
                      {h.changedBy && (
                        <span className="text-xs text-muted-foreground">
                          by {h.changedBy}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {validNextStatuses.length > 0 ? (
                validNextStatuses.map((status) => {
                  const sc = getStatusConfig(status);
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => updateStatus(status)}
                      disabled={updating}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${sc.dotColor}`}
                      />
                      {sc.label}
                    </Button>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No further status changes allowed
                </p>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                {order.customer.name}
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {order.customer.phone}
              </p>
              {order.customer.email && (
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {order.customer.email}
                </p>
              )}
              <Separator className="my-2" />
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                {ORDER_TYPE_LABELS[order.type as keyof typeof ORDER_TYPE_LABELS]}
              </p>
              <p>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
              </p>
              {order.deliveryAddress && (
                <p>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  {order.deliveryAddress}
                </p>
              )}
              {order.orderNotes && (
                <p>
                  <span className="text-muted-foreground">Notes:</span>{" "}
                  {order.orderNotes}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
