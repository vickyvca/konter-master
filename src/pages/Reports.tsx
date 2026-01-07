import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wrench,
  Package,
  Calendar,
  Loader2,
  BarChart3
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportData {
  salesRevenue: number;
  salesCount: number;
  serviceRevenue: number;
  serviceCount: number;
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailySales: { date: string; amount: number }[];
}

export default function Reports() {
  const { profile, isAdmin, isOwner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<ReportData>({
    salesRevenue: 0,
    salesCount: 0,
    serviceRevenue: 0,
    serviceCount: 0,
    totalRevenue: 0,
    cogs: 0,
    grossProfit: 0,
    topProducts: [],
    dailySales: [],
  });

  useEffect(() => {
    if (profile?.branch_id) {
      fetchReportData();
    }
  }, [profile?.branch_id, period]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      start: startDate.toISOString(),
      end: now.toISOString(),
    };
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Fetch sales data
      const { data: salesData } = await supabase
        .from('sales_invoices')
        .select('total_amount, created_at')
        .eq('branch_id', profile!.branch_id)
        .eq('status', 'completed')
        .gte('created_at', start)
        .lte('created_at', end);

      const salesRevenue = salesData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
      const salesCount = salesData?.length || 0;

      // Fetch service payments
      const { data: serviceData } = await supabase
        .from('service_tickets')
        .select('paid_amount, created_at')
        .eq('branch_id', profile!.branch_id)
        .in('status', ['SELESAI', 'DIAMBIL'])
        .gte('created_at', start)
        .lte('created_at', end);

      const serviceRevenue = serviceData?.reduce((sum, s) => sum + Number(s.paid_amount || 0), 0) || 0;
      const serviceCount = serviceData?.length || 0;

      // Fetch sales items for COGS and top products
      const { data: salesItems } = await supabase
        .from('sales_items')
        .select('product_name, quantity, subtotal, cost_price, invoice:sales_invoices!inner(created_at, status, branch_id)')
        .eq('invoice.branch_id', profile!.branch_id)
        .eq('invoice.status', 'completed')
        .gte('invoice.created_at', start)
        .lte('invoice.created_at', end);

      const cogs = salesItems?.reduce((sum, item) => sum + (Number(item.cost_price || 0) * item.quantity), 0) || 0;

      // Calculate top products
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      salesItems?.forEach(item => {
        const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
        productMap.set(item.product_name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + Number(item.subtotal),
        });
      });

      const topProducts = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate daily sales
      const dailyMap = new Map<string, number>();
      salesData?.forEach(sale => {
        const date = new Date(sale.created_at).toLocaleDateString('id-ID');
        dailyMap.set(date, (dailyMap.get(date) || 0) + Number(sale.total_amount));
      });

      const dailySales = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .slice(-7);

      const totalRevenue = salesRevenue + serviceRevenue;
      const grossProfit = totalRevenue - cogs;

      setData({
        salesRevenue,
        salesCount,
        serviceRevenue,
        serviceCount,
        totalRevenue,
        cogs,
        grossProfit,
        topProducts,
        dailySales,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = data.totalRevenue > 0 ? (data.grossProfit / data.totalRevenue) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
            <p className="text-muted-foreground">Ringkasan keuangan dan penjualan</p>
          </div>
          <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">7 Hari</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Revenue Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Penjualan + Service
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pendapatan Penjualan
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(data.salesRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.salesCount} transaksi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pendapatan Service
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(data.serviceRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.serviceCount} tiket selesai
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Laba Kotor
                  </CardTitle>
                  {data.grossProfit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${data.grossProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(data.grossProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margin: {profitMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Profit & Loss Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Laporan Laba Rugi Sederhana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Pendapatan Penjualan</span>
                    <span>{formatCurrency(data.salesRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Pendapatan Service</span>
                    <span>{formatCurrency(data.serviceRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b bg-muted/50 px-2 rounded">
                    <span className="font-semibold">Total Pendapatan</span>
                    <span className="font-semibold">{formatCurrency(data.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b text-destructive">
                    <span className="font-medium">Harga Pokok Penjualan (HPP)</span>
                    <span>({formatCurrency(data.cogs)})</span>
                  </div>
                  <div className="flex justify-between py-3 bg-primary/10 px-2 rounded">
                    <span className="font-bold text-lg">Laba Kotor</span>
                    <span className={`font-bold text-lg ${data.grossProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(data.grossProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada data penjualan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} unit terjual</p>
                        </div>
                        <p className="font-semibold text-primary">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Penjualan Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.dailySales.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Belum ada data penjualan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.dailySales.map((day) => (
                      <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-muted-foreground">{day.date}</span>
                        <span className="font-semibold">{formatCurrency(day.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
