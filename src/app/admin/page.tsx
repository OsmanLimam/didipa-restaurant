'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { formatPriceShort } from '@/lib/constants';
import { getStatusConfig } from '@/lib/order-utils';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardData {
  todayRevenue: number;
  todayCount: number;
  pendingOrders: number;
  completedToday: number;
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    type: string;
    createdAt: string;
    customer: { name: string };
  }[];
  popularItems: {
    name: string;
    _sum: { quantity: number | null };
    _count: number;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    dailyRevenue: Record<string, number>;
    dailyOrders: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);

    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setAnalyticsData({ dailyRevenue: d.dailyRevenue, dailyOrders: d.dailyOrders }))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Revenue",
      value: formatPriceShort(data.todayRevenue),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Today's Orders",
      value: data.todayCount,
      icon: ShoppingBag,
      color: "text-primary",
    },
    {
      title: "Pending Orders",
      value: data.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Completed Today",
      value: data.completedToday,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  ];

  // Prepare chart data
  const revenueChartData = analyticsData
    ? Object.entries(analyticsData.dailyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric' }),
          revenue,
        }))
    : [];

  const ordersChartData = analyticsData
    ? Object.entries(analyticsData.dailyOrders)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric' }),
          orders: count,
        }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₵${v}`} />
                  <Tooltip formatter={(value: number) => formatPriceShort(value)} />
                  <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No revenue data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#d97706" strokeWidth={2} dot={{ fill: '#d97706' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No order data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.slice(0, 8).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}>
                    <div className="flex items-center justify-between text-sm py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{order.orderNumber}</span>
                        <span className="text-muted-foreground">
                          {order.customer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {formatPriceShort(order.total)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={statusConfig.color}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.popularItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {item._sum.quantity || 0} sold
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatPriceShort(data.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{data.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-xl font-bold">{formatPriceShort(data.avgOrderValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
