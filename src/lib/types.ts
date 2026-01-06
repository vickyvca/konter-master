// Application Types for Konter HP

export type AppRole = 'owner' | 'admin' | 'kasir' | 'teknisi' | 'gudang';

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'split';

export type ServiceStatus = 
  | 'DITERIMA' 
  | 'DIAGNOSA' 
  | 'MENUNGGU_SPAREPART' 
  | 'PROSES' 
  | 'SELESAI' 
  | 'DIAMBIL' 
  | 'BATAL';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type JournalType = 'sale' | 'purchase' | 'service' | 'return' | 'cash_event' | 'adjustment';

export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface InventoryLocation {
  id: string;
  branch_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  branch_id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  buy_price: number;
  sell_price: number;
  avg_cost: number;
  min_stock: number;
  is_active: boolean;
  has_variants: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  name: string;
  buy_price: number;
  sell_price: number;
  avg_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface StockBalance {
  id: string;
  branch_id: string;
  location_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  reserved_qty: number;
  updated_at: string;
  // Joined
  product?: Product;
  location?: InventoryLocation;
}

export interface StockMovement {
  id: string;
  branch_id: string;
  movement_number: string;
  movement_type: StockMovementType;
  from_location_id?: string;
  to_location_id?: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  // Joined
  items?: StockMovementItem[];
  from_location?: InventoryLocation;
  to_location?: InventoryLocation;
}

export interface StockMovementItem {
  id: string;
  movement_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_cost: number;
  notes?: string;
  created_at: string;
  // Joined
  product?: Product;
}

export interface Supplier {
  id: string;
  branch_id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  branch_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface CashSession {
  id: string;
  branch_id: string;
  user_id: string;
  session_date: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  difference?: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  notes?: string;
}

export interface SalesInvoice {
  id: string;
  branch_id: string;
  invoice_number: string;
  customer_id?: string;
  session_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'voided';
  notes?: string;
  created_by?: string;
  created_at: string;
  // Joined
  items?: SalesItem[];
  customer?: Customer;
}

export interface SalesItem {
  id: string;
  invoice_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
  // Joined
  product?: Product;
}

export interface ServiceTicket {
  id: string;
  branch_id: string;
  ticket_number: string;
  customer_id?: string;
  device_brand?: string;
  device_model?: string;
  device_imei?: string;
  device_color?: string;
  complaint: string;
  diagnosis?: string;
  estimated_cost: number;
  final_cost: number;
  dp_amount: number;
  paid_amount: number;
  status: ServiceStatus;
  technician_id?: string;
  received_by?: string;
  received_at: string;
  completed_at?: string;
  picked_up_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  items?: ServiceTicketItem[];
  payments?: ServicePayment[];
}

export interface ServiceTicketItem {
  id: string;
  ticket_id: string;
  item_type: 'sparepart' | 'jasa';
  product_id?: string;
  variant_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  subtotal: number;
  created_at: string;
  // Joined
  product?: Product;
}

export interface ServicePayment {
  id: string;
  ticket_id: string;
  payment_type: 'dp' | 'pelunasan';
  payment_method: PaymentMethod;
  amount: number;
  reference?: string;
  created_by?: string;
  created_at: string;
}

export interface CoaAccount {
  id: string;
  branch_id: string;
  code: string;
  name: string;
  account_type: AccountType;
  parent_id?: string;
  is_active: boolean;
  balance: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  branch_id: string;
  entry_number: string;
  entry_date: string;
  journal_type: JournalType;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  created_by?: string;
  created_at: string;
  // Joined
  lines?: JournalLine[];
}

export interface JournalLine {
  id: string;
  entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
  created_at: string;
  // Joined
  account?: CoaAccount;
}

// Cart types for POS
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customer?: Customer;
}

// Dashboard stats
export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  activeServices: number;
  lowStockItems: number;
  monthlyRevenue: number;
  monthlyProfit: number;
}

// Report types
export interface RevenueReport {
  date: string;
  sales_revenue: number;
  service_revenue: number;
  total_revenue: number;
  cogs: number;
  gross_profit: number;
}
