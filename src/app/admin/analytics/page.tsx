'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPriceShort, ORDER_STATUSES } from '@/lib/constants';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#d97706', '#ea580c', '#16a34a', '#8b5cf6', '#0891b2', '#dc2626', '#ca8a04'];

interface AnalyticsData {
  dailyRevenue: Record<string, number>;
  dailyOrders: Record<string, number>;
  statusCounts: Record<string, number>;
  popularItems: { name: string; _sum: { quantity: number | null }; _count: number }[];
  categoryPerformance: { category: string; totalQuantity: number; totalRevenue: number }[];
  typeCounts: { type: string; _count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-16">Failed to load analytics</div>;

  // Prepare chart data
  const revenueData = Object.entries(data.dailyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric' }),
      revenue,
    }));

  const ordersData = Object.entries(data.dailyOrders)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric' }),
      orders: count,
    }));

  const statusData = Object.entries(data.statusCounts).map(([status, count]) => ({
    name: ORDER_STATUSES.find((s) => s.value === status)?.label || status,
    value: count,
  }));

  const categoryData = data.categoryPerformance
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `₵${v}`} />
                  <Tooltip formatter={(value: number) => formatPriceShort(value)} />
                  <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Orders Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#d97706" strokeWidth={2} dot={{ fill: '#d97706' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tickFormatter={(v) => `₵${v}`} />
                  <YAxis dataKey="category" type="category" fontSize={12} width={80} />
                  <Tooltip formatter={(value: number) => formatPriceShort(value)} />
                  <Bar dataKey="totalRevenue" fill="#ea580c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popular Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.popularItems.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item._sum.quantity || 0} sold ({item._count} orders)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
