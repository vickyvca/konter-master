import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Wrench,
  Phone,
  User,
  ChevronRight,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SERVICE_STATUSES = [
  { value: 'DITERIMA', label: 'Diterima', color: 'bg-info/10 text-info' },
  { value: 'DIAGNOSA', label: 'Diagnosa', color: 'bg-warning/10 text-warning' },
  { value: 'MENUNGGU_SPAREPART', label: 'Menunggu Sparepart', color: 'bg-warning/10 text-warning' },
  { value: 'PROSES', label: 'Proses', color: 'bg-primary/10 text-primary' },
  { value: 'SELESAI', label: 'Selesai', color: 'bg-success/10 text-success' },
  { value: 'DIAMBIL', label: 'Diambil', color: 'bg-muted text-muted-foreground' },
  { value: 'BATAL', label: 'Batal', color: 'bg-destructive/10 text-destructive' },
];

interface ServiceTicket {
  id: string;
  ticket_number: string;
  device_brand: string | null;
  device_model: string | null;
  device_imei: string | null;
  device_color: string | null;
  complaint: string;
  diagnosis: string | null;
  status: string;
  estimated_cost: number | null;
  final_cost: number | null;
  dp_amount: number | null;
  paid_amount: number | null;
  created_at: string;
  updated_at: string | null;
  customer: { id: string; name: string; phone: string | null } | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

export default function Service() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceImei, setDeviceImei] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [complaint, setComplaint] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [dpAmount, setDpAmount] = useState('');

  useEffect(() => {
    if (profile?.branch_id) {
      fetchData();
    }
  }, [profile?.branch_id]);

  const fetchData = async () => {
    try {
      const [ticketsRes, customersRes] = await Promise.all([
        supabase
          .from('service_tickets')
          .select('*, customer:customers(id, name, phone)')
          .eq('branch_id', profile!.branch_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customers')
          .select('id, name, phone')
          .eq('branch_id', profile!.branch_id)
          .order('name'),
      ]);

      setTickets(ticketsRes.data as ServiceTicket[] || []);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.device_brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.device_model?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    return SERVICE_STATUSES.find(s => s.value === status)?.color || '';
  };

  const getStatusLabel = (status: string) => {
    return SERVICE_STATUSES.find(s => s.value === status)?.label || status;
  };

  const handleCreateTicket = async () => {
    if (!complaint || !deviceBrand) {
      toast.error('Lengkapi data perangkat dan keluhan');
      return;
    }

    setProcessing(true);

    try {
      // Generate ticket number
      const { data: ticketNumber, error: rpcError } = await supabase
        .rpc('generate_document_number', {
          _branch_id: profile!.branch_id,
          _doc_type: 'SRV'
        });

      if (rpcError) throw rpcError;

      // Create ticket
      const { error: ticketError } = await supabase
        .from('service_tickets')
        .insert({
          branch_id: profile!.branch_id!,
          ticket_number: ticketNumber,
          customer_id: customerId || null,
          device_brand: deviceBrand,
          device_model: deviceModel || null,
          device_imei: deviceImei || null,
          device_color: deviceColor || null,
          complaint: complaint,
          estimated_cost: estimatedCost ? Number(estimatedCost) : null,
          dp_amount: dpAmount ? Number(dpAmount) : null,
          paid_amount: dpAmount ? Number(dpAmount) : 0,
          status: 'DITERIMA',
          received_by: profile!.id,
          received_at: new Date().toISOString(),
        });

      if (ticketError) throw ticketError;

      toast.success(`Tiket berhasil dibuat: ${ticketNumber}`);
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Gagal membuat tiket');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'SELESAI') {
        updateData.completed_at = new Date().toISOString();
      } else if (newStatus === 'DIAMBIL') {
        updateData.picked_up_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Status berhasil diupdate');
      fetchData();
      
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengupdate status');
    }
  };

  const resetForm = () => {
    setCustomerId('');
    setDeviceBrand('');
    setDeviceModel('');
    setDeviceImei('');
    setDeviceColor('');
    setComplaint('');
    setEstimatedCost('');
    setDpAmount('');
  };

  const openDetail = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
  };

  const activeCount = tickets.filter(t => !['SELESAI', 'DIAMBIL', 'BATAL'].includes(t.status)).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service</h1>
            <p className="text-muted-foreground">{activeCount} tiket aktif</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tiket Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari tiket, customer, atau device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {SERVICE_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Wrench className="h-12 w-12 mb-2" />
            <p>Tidak ada tiket service</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => openDetail(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{ticket.ticket_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ticket.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusStyle(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{ticket.device_brand} {ticket.device_model}</span>
                    </div>
                    {ticket.customer && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{ticket.customer.name}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {ticket.complaint}
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Estimasi</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(ticket.estimated_cost)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tiket Service Baru</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Customer (opsional)</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tanpa customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone && `(${customer.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand Perangkat *</Label>
                <Input
                  value={deviceBrand}
                  onChange={(e) => setDeviceBrand(e.target.value)}
                  placeholder="Contoh: Samsung"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="Contoh: Galaxy A52"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IMEI (opsional)</Label>
                <Input
                  value={deviceImei}
                  onChange={(e) => setDeviceImei(e.target.value)}
                  placeholder="IMEI"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Warna</Label>
                <Input
                  value={deviceColor}
                  onChange={(e) => setDeviceColor(e.target.value)}
                  placeholder="Contoh: Hitam"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Keluhan / Kerusakan *</Label>
              <Textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Jelaskan keluhan atau kerusakan perangkat..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimasi Biaya</Label>
                <Input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Uang Muka (DP)</Label>
                <Input
                  type="number"
                  value={dpAmount}
                  onChange={(e) => setDpAmount(e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={processing}
              onClick={handleCreateTicket}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat tiket...
                </>
              ) : (
                'Buat Tiket'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className={getStatusStyle(selectedTicket.status)}>
                  {getStatusLabel(selectedTicket.status)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedTicket.created_at)}
                </p>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Perangkat</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Brand:</strong> {selectedTicket.device_brand}</p>
                  <p><strong>Model:</strong> {selectedTicket.device_model || '-'}</p>
                  <p><strong>IMEI:</strong> {selectedTicket.device_imei || '-'}</p>
                  <p><strong>Warna:</strong> {selectedTicket.device_color || '-'}</p>
                </CardContent>
              </Card>

              {selectedTicket.customer && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Customer</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Nama:</strong> {selectedTicket.customer.name}</p>
                    <p><strong>Telepon:</strong> {selectedTicket.customer.phone || '-'}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Keluhan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>{selectedTicket.complaint}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Biaya</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Estimasi:</span>
                    <span>{formatCurrency(selectedTicket.estimated_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DP:</span>
                    <span>{formatCurrency(selectedTicket.dp_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Terbayar:</span>
                    <span className="text-primary">{formatCurrency(selectedTicket.paid_amount)}</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label>Update Status</Label>
                <Select 
                  value={selectedTicket.status} 
                  onValueChange={(val) => handleUpdateStatus(selectedTicket.id, val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
