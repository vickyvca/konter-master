import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sell_price: number;
  barcode: string | null;
  image_url: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
}

type PaymentMethod = 'cash' | 'transfer' | 'qris';

export default function POS() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (profile?.branch_id) {
      fetchProducts();
    }
  }, [profile?.branch_id]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, category, sell_price, barcode, image_url')
        .eq('branch_id', profile!.branch_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode?.includes(searchQuery)
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.sell_price - item.discount }
            : item
        );
      }
      return [...prev, { 
        product, 
        quantity: 1, 
        discount: 0, 
        subtotal: product.sell_price 
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { 
          ...item, 
          quantity: newQty, 
          subtotal: newQty * item.product.sell_price - item.discount 
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discountAmount;
  const change = paymentMethod === 'cash' ? Math.max(0, Number(paidAmount) - total) : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    if (paymentMethod === 'cash' && Number(paidAmount) < total) {
      toast.error('Jumlah pembayaran kurang');
      return;
    }

    setProcessing(true);

    try {
      // Generate invoice number
      const { data: invoiceNumber, error: rpcError } = await supabase
        .rpc('generate_document_number', {
          _branch_id: profile!.branch_id,
          _doc_type: 'INV'
        });

      if (rpcError) throw rpcError;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('sales_invoices')
        .insert({
          branch_id: profile!.branch_id!,
          invoice_number: invoiceNumber,
          subtotal: subtotal,
          discount_amount: discountAmount,
          total_amount: total,
          paid_amount: paymentMethod === 'cash' ? Number(paidAmount) : total,
          change_amount: change,
          payment_method: paymentMethod,
          status: 'completed',
          created_by: profile!.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const items = cart.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.sell_price,
        discount_amount: item.discount,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('sales_payments')
        .insert({
          invoice_id: invoice.id,
          payment_method: paymentMethod,
          amount: paymentMethod === 'cash' ? Number(paidAmount) : total,
        });

      if (paymentError) throw paymentError;

      toast.success(`Transaksi berhasil! ${invoiceNumber}`);
      clearCart();
      setCheckoutOpen(false);
      setPaidAmount('');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Gagal memproses transaksi');
    } finally {
      setProcessing(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2" />
                <p>Tidak ada produk ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <p className="text-primary font-semibold mt-1">{formatCurrency(product.sell_price)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <Card className="w-full lg:w-96 flex flex-col min-h-[400px] lg:min-h-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto pb-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mb-2" />
                <p className="text-sm">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.product.sell_price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-sm">{formatCurrency(item.subtotal)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t mt-auto">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diskon</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              Bayar
            </Button>
          </div>
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('transfer')}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Transfer</span>
                </Button>
                <Button
                  variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('qris')}
                  className="flex flex-col gap-1 h-auto py-3"
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">QRIS</span>
                </Button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Jumlah Bayar</p>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                    className="text-right text-lg"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setPaidAmount(amount.toString())}
                    >
                      {(amount / 1000)}K
                    </Button>
                  ))}
                </div>

                <div className="flex justify-between py-2 border-t">
                  <span className="font-medium">Kembalian</span>
                  <span className="font-bold text-lg text-success">{formatCurrency(change)}</span>
                </div>
              </>
            )}

            <Button 
              className="w-full" 
              size="lg"
              disabled={processing || (paymentMethod === 'cash' && Number(paidAmount) < total)}
              onClick={handleCheckout}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Selesaikan Transaksi'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
