import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  Wrench, 
  Package, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  todaySales: number;
  todayTransactions: number;
  activeServices: number;
  lowStockCount: number;
  monthRevenue: number;
  recentSales: any[];
  recentServices: any[];
}

export default function Dashboard() {
  const { profile, roles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    todaySales: 0,
    todayTransactions: 0,
    activeServices: 0,
    lowStockCount: 0,
    monthRevenue: 0,
    recentSales: [],
    recentServices: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [profile?.branch_id]);

  const fetchDashboardData = async () => {
    if (!profile?.branch_id) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      // Fetch today's sales
      const { data: todaySalesData } = await supabase
        .from('sales_invoices')
        .select('total_amount')
        .eq('branch_id', profile.branch_id)
        .gte('created_at', today)
        .eq('status', 'completed');

      const todaySales = todaySalesData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
      const todayTransactions = todaySalesData?.length || 0;

      // Fetch active services
      const { data: servicesData } = await supabase
        .from('service_tickets')
        .select('id')
        .eq('branch_id', profile.branch_id)
        .not('status', 'in', '("SELESAI","DIAMBIL","BATAL")');

      const activeServices = servicesData?.length || 0;

      // Fetch monthly revenue
      const { data: monthSalesData } = await supabase
        .from('sales_invoices')
        .select('total_amount')
        .eq('branch_id', profile.branch_id)
        .gte('created_at', monthStart)
        .eq('status', 'completed');

      const monthRevenue = monthSalesData?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;

      // Fetch recent sales
      const { data: recentSales } = await supabase
        .from('sales_invoices')
        .select('*, customer:customers(name)')
        .eq('branch_id', profile.branch_id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent services
      const { data: recentServices } = await supabase
        .from('service_tickets')
        .select('*, customer:customers(name)')
        .eq('branch_id', profile.branch_id)
        .order('created_at', { ascending: false })
        .limit(5);

      setData({
        todaySales,
        todayTransactions,
        activeServices,
        lowStockCount: 0, // Would need a more complex query
        monthRevenue,
        recentSales: recentSales || [],
        recentServices: recentServices || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DITERIMA': 'bg-info/10 text-info',
      'DIAGNOSA': 'bg-warning/10 text-warning',
      'MENUNGGU_SPAREPART': 'bg-warning/10 text-warning',
      'PROSES': 'bg-primary/10 text-primary',
      'SELESAI': 'bg-success/10 text-success',
      'DIAMBIL': 'bg-muted text-muted-foreground',
      'BATAL': 'bg-destructive/10 text-destructive',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang, {profile?.full_name || 'User'}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Penjualan Hari Ini
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(data.todaySales)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.todayTransactions} transaksi
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Service Aktif
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {data.activeServices}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dalam proses
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stok Menipis
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {data.lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Produk perlu restock
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Omzet Bulan Ini
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(data.monthRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total pendapatan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Sales */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Penjualan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentSales.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  Belum ada penjualan hari ini
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{sale.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {sale.customer?.name || 'Umum'} • {formatDate(sale.created_at)}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(sale.total_amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-warning" />
                Service Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentServices.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  Belum ada service hari ini
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{service.ticket_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.device_brand} {service.device_model}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusLabel(service.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
