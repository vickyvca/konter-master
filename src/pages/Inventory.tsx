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
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ArrowRightLeft,
  Loader2,
  Filter
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  buy_price: number;
  sell_price: number;
}

interface StockBalance {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  product: Product;
  location: { name: string; code: string };
}

interface StockMovement {
  id: string;
  movement_number: string;
  movement_type: string;
  notes: string | null;
  created_at: string;
  from_location: { name: string } | null;
  to_location: { name: string } | null;
}

interface Location {
  id: string;
  name: string;
  code: string;
}

type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export default function Inventory() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockBalances, setStockBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (profile?.branch_id) {
      fetchData();
    }
  }, [profile?.branch_id]);

  const fetchData = async () => {
    try {
      const [productsRes, stockRes, movementsRes, locationsRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, sku, category, buy_price, sell_price')
          .eq('branch_id', profile!.branch_id)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('stock_balances')
          .select('*, product:products(id, name, sku, category, buy_price, sell_price), location:inventory_locations(name, code)')
          .eq('branch_id', profile!.branch_id),
        supabase
          .from('stock_movements')
          .select('*, from_location:inventory_locations!stock_movements_from_location_id_fkey(name), to_location:inventory_locations!stock_movements_to_location_id_fkey(name)')
          .eq('branch_id', profile!.branch_id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('inventory_locations')
          .select('id, name, code')
          .eq('branch_id', profile!.branch_id)
          .eq('is_active', true),
      ]);

      setProducts(productsRes.data || []);
      setStockBalances(stockRes.data as StockBalance[] || []);
      setMovements(movementsRes.data as StockMovement[] || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stockBalances.filter(sb => 
    sb.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sb.product?.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownCircle className="h-4 w-4 text-success" />;
      case 'OUT': return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
      case 'ADJUSTMENT': return <RefreshCw className="h-4 w-4 text-warning" />;
      case 'TRANSFER': return <ArrowRightLeft className="h-4 w-4 text-info" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const variants: Record<string, string> = {
      'IN': 'bg-success/10 text-success',
      'OUT': 'bg-destructive/10 text-destructive',
      'ADJUSTMENT': 'bg-warning/10 text-warning',
      'TRANSFER': 'bg-info/10 text-info',
    };
    return variants[type] || '';
  };

  const handleCreateMovement = async () => {
    if (!selectedProduct || !quantity || !selectedLocation) {
      toast.error('Lengkapi semua field');
      return;
    }

    if (movementType === 'TRANSFER' && !toLocation) {
      toast.error('Pilih lokasi tujuan');
      return;
    }

    setProcessing(true);

    try {
      // Generate movement number
      const { data: movementNumber, error: rpcError } = await supabase
        .rpc('generate_document_number', {
          _branch_id: profile!.branch_id,
          _doc_type: 'STK'
        });

      if (rpcError) throw rpcError;

      // Create movement
      const { data: movement, error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          branch_id: profile!.branch_id!,
          movement_number: movementNumber,
          movement_type: movementType,
          from_location_id: movementType === 'OUT' || movementType === 'TRANSFER' ? selectedLocation : null,
          to_location_id: movementType === 'IN' || movementType === 'TRANSFER' ? (movementType === 'TRANSFER' ? toLocation : selectedLocation) : null,
          notes: notes || null,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (movementError) throw movementError;

      // Create movement item
      const { error: itemError } = await supabase
        .from('stock_movement_items')
        .insert({
          movement_id: movement.id,
          product_id: selectedProduct,
          quantity: Number(quantity),
        });

      if (itemError) throw itemError;

      // Update stock balance
      const locationId = movementType === 'IN' || movementType === 'ADJUSTMENT' ? selectedLocation : 
                         movementType === 'TRANSFER' ? toLocation : selectedLocation;
      
      const qtyChange = movementType === 'IN' || movementType === 'TRANSFER' ? Number(quantity) : 
                        movementType === 'OUT' ? -Number(quantity) : Number(quantity);

      // Check if balance exists
      const { data: existingBalance } = await supabase
        .from('stock_balances')
        .select('id, quantity')
        .eq('product_id', selectedProduct)
        .eq('location_id', locationId)
        .eq('branch_id', profile!.branch_id)
        .maybeSingle();

      if (existingBalance) {
        await supabase
          .from('stock_balances')
          .update({ quantity: existingBalance.quantity + qtyChange })
          .eq('id', existingBalance.id);
      } else {
        await supabase
          .from('stock_balances')
          .insert({
            branch_id: profile!.branch_id!,
            product_id: selectedProduct,
            location_id: locationId,
            quantity: qtyChange,
          });
      }

      // For transfers, also update source location
      if (movementType === 'TRANSFER') {
        const { data: sourceBalance } = await supabase
          .from('stock_balances')
          .select('id, quantity')
          .eq('product_id', selectedProduct)
          .eq('location_id', selectedLocation)
          .eq('branch_id', profile!.branch_id)
          .maybeSingle();

        if (sourceBalance) {
          await supabase
            .from('stock_balances')
            .update({ quantity: sourceBalance.quantity - Number(quantity) })
            .eq('id', sourceBalance.id);
        }
      }

      toast.success('Pergerakan stok berhasil dicatat');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating movement:', error);
      toast.error('Gagal mencatat pergerakan stok');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setMovementType('IN');
    setSelectedProduct('');
    setSelectedLocation('');
    setToLocation('');
    setQuantity('');
    setNotes('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventori</h1>
            <p className="text-muted-foreground">Kelola stok dan pergerakan barang</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Pergerakan Stok
          </Button>
        </div>

        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stock">Stok Produk</TabsTrigger>
            <TabsTrigger value="movements">Riwayat Pergerakan</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-2" />
                <p>Tidak ada data stok</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStock.map((stock) => (
                  <Card key={stock.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{stock.product?.name}</p>
                          <p className="text-sm text-muted-foreground">{stock.product?.sku}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {stock.location?.name || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Stok</p>
                          <p className={`text-2xl font-bold ${stock.quantity < 5 ? 'text-destructive' : 'text-foreground'}`}>
                            {stock.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Nilai</p>
                          <p className="font-semibold text-primary">
                            {formatCurrency((stock.product?.buy_price || 0) * stock.quantity)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ArrowRightLeft className="h-12 w-12 mb-2" />
                <p>Belum ada pergerakan stok</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {movements.map((movement) => (
                      <div key={movement.id} className="p-4 flex items-center gap-4">
                        {getMovementIcon(movement.movement_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{movement.movement_number}</p>
                            <Badge className={getMovementBadge(movement.movement_type)}>
                              {movement.movement_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {movement.from_location?.name && `Dari: ${movement.from_location.name}`}
                            {movement.from_location?.name && movement.to_location?.name && ' → '}
                            {movement.to_location?.name && `Ke: ${movement.to_location.name}`}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(movement.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pergerakan Stok</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Jenis Pergerakan</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'] as MovementType[]).map((type) => (
                  <Button
                    key={type}
                    variant={movementType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMovementType(type)}
                    className="text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Produk</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{movementType === 'TRANSFER' ? 'Lokasi Asal' : 'Lokasi'}</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {movementType === 'TRANSFER' && (
              <div>
                <Label>Lokasi Tujuan</Label>
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih lokasi tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(l => l.id !== selectedLocation).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="mt-1"
              />
            </div>

            <Button 
              className="w-full" 
              disabled={processing}
              onClick={handleCreateMovement}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
