-- Create missing table
CREATE TABLE public.cash_session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_ticket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_notifications ENABLE ROW LEVEL SECURITY;

-- BRANCHES POLICIES
CREATE POLICY "Owner can view all branches" ON public.branches
    FOR SELECT USING (public.is_owner(auth.uid()));

CREATE POLICY "Users can view their branch" ON public.branches
    FOR SELECT USING (id = public.get_user_branch_id(auth.uid()));

CREATE POLICY "Admin can manage their branch" ON public.branches
    FOR ALL USING (
        id = public.get_user_branch_id(auth.uid()) 
        AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
    );

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can view branch profiles" ON public.profiles
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Owner can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_owner(auth.uid()));

-- USER ROLES POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage branch user roles" ON public.user_roles
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner')
    );

-- INVENTORY LOCATIONS POLICIES
CREATE POLICY "Users can view branch locations" ON public.inventory_locations
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin Gudang can manage locations" ON public.inventory_locations
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
    );

-- PRODUCTS POLICIES
CREATE POLICY "Users can view branch products" ON public.products
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin Gudang can manage products" ON public.products
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
    );

-- PRODUCT VARIANTS POLICIES
CREATE POLICY "Users can view variants" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND (p.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Admin Gudang can manage variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id 
            AND p.branch_id = public.get_user_branch_id(auth.uid())
            AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
        )
    );

-- STOCK BALANCES POLICIES
CREATE POLICY "Users can view branch stock" ON public.stock_balances
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin Gudang can manage stock" ON public.stock_balances
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
    );

-- STOCK MOVEMENTS POLICIES
CREATE POLICY "Users can view branch movements" ON public.stock_movements
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin Gudang can manage movements" ON public.stock_movements
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
    );

CREATE POLICY "Users can view movement items" ON public.stock_movement_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stock_movements m 
            WHERE m.id = movement_id 
            AND (m.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Admin Gudang can manage movement items" ON public.stock_movement_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.stock_movements m 
            WHERE m.id = movement_id 
            AND m.branch_id = public.get_user_branch_id(auth.uid())
            AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gudang'))
        )
    );

-- SUPPLIERS POLICIES
CREATE POLICY "Users can view branch suppliers" ON public.suppliers
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin can manage suppliers" ON public.suppliers
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

-- CUSTOMERS POLICIES
CREATE POLICY "Users can view branch customers" ON public.customers
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Staff can manage customers" ON public.customers
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
    );

-- CASH SESSIONS POLICIES
CREATE POLICY "Users can view branch sessions" ON public.cash_sessions
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Kasir can manage own sessions" ON public.cash_sessions
    FOR ALL USING (
        user_id = auth.uid()
        OR (branch_id = public.get_user_branch_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
    );

CREATE POLICY "Users can view session events" ON public.cash_session_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cash_sessions s 
            WHERE s.id = session_id 
            AND (s.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Kasir can manage session events" ON public.cash_session_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cash_sessions s 
            WHERE s.id = session_id 
            AND (s.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
        )
    );

-- SALES POLICIES
CREATE POLICY "Users can view branch sales" ON public.sales_invoices
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Kasir can create sales" ON public.sales_invoices
    FOR INSERT WITH CHECK (
        branch_id = public.get_user_branch_id(auth.uid())
        AND (public.has_role(auth.uid(), 'kasir') OR public.has_role(auth.uid(), 'admin'))
    );

CREATE POLICY "Admin can manage sales" ON public.sales_invoices
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can view sales items" ON public.sales_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sales_invoices i 
            WHERE i.id = invoice_id 
            AND (i.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Kasir can manage sales items" ON public.sales_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales_invoices i 
            WHERE i.id = invoice_id 
            AND i.branch_id = public.get_user_branch_id(auth.uid())
            AND (public.has_role(auth.uid(), 'kasir') OR public.has_role(auth.uid(), 'admin'))
        )
    );

CREATE POLICY "Users can view sales payments" ON public.sales_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sales_invoices i 
            WHERE i.id = invoice_id 
            AND (i.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Kasir can manage payments" ON public.sales_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales_invoices i 
            WHERE i.id = invoice_id 
            AND i.branch_id = public.get_user_branch_id(auth.uid())
        )
    );

-- SALES RETURNS POLICIES
CREATE POLICY "Users can view returns" ON public.sales_returns
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin can manage returns" ON public.sales_returns
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can view return items" ON public.sales_return_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sales_returns r 
            WHERE r.id = return_id 
            AND (r.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Admin can manage return items" ON public.sales_return_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sales_returns r 
            WHERE r.id = return_id 
            AND r.branch_id = public.get_user_branch_id(auth.uid())
            AND public.has_role(auth.uid(), 'admin')
        )
    );

-- SERVICE TICKETS POLICIES
CREATE POLICY "Users can view branch tickets" ON public.service_tickets
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Staff can create tickets" ON public.service_tickets
    FOR INSERT WITH CHECK (
        branch_id = public.get_user_branch_id(auth.uid())
    );

CREATE POLICY "Teknisi can update assigned tickets" ON public.service_tickets
    FOR UPDATE USING (
        (technician_id = auth.uid() OR received_by = auth.uid())
        OR (branch_id = public.get_user_branch_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'))
    );

CREATE POLICY "Admin can manage all tickets" ON public.service_tickets
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can view ticket items" ON public.service_ticket_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND (t.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Staff can manage ticket items" ON public.service_ticket_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND t.branch_id = public.get_user_branch_id(auth.uid())
        )
    );

CREATE POLICY "Users can view service payments" ON public.service_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND (t.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Staff can manage service payments" ON public.service_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND t.branch_id = public.get_user_branch_id(auth.uid())
        )
    );

CREATE POLICY "Users can view attachments" ON public.service_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND (t.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Staff can manage attachments" ON public.service_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.service_tickets t 
            WHERE t.id = ticket_id 
            AND t.branch_id = public.get_user_branch_id(auth.uid())
        )
    );

-- COA POLICIES
CREATE POLICY "Users can view branch COA" ON public.coa_accounts
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin can manage COA" ON public.coa_accounts
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

-- JOURNAL POLICIES
CREATE POLICY "Users can view branch journals" ON public.journal_entries
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin can manage journals" ON public.journal_entries
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can view journal lines" ON public.journal_lines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.journal_entries e 
            WHERE e.id = entry_id 
            AND (e.branch_id = public.get_user_branch_id(auth.uid()) OR public.is_owner(auth.uid()))
        )
    );

CREATE POLICY "Admin can manage journal lines" ON public.journal_lines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.journal_entries e 
            WHERE e.id = entry_id 
            AND e.branch_id = public.get_user_branch_id(auth.uid())
            AND public.has_role(auth.uid(), 'admin')
        )
    );

-- SETTINGS POLICIES
CREATE POLICY "Users can view branch settings" ON public.settings
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "Admin can manage settings" ON public.settings
    FOR ALL USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

-- DOCUMENT SEQUENCES POLICIES
CREATE POLICY "Users can view sequences" ON public.document_sequences
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        OR public.is_owner(auth.uid())
    );

CREATE POLICY "System can manage sequences" ON public.document_sequences
    FOR ALL USING (true);

-- OUTBOX NOTIFICATIONS POLICIES
CREATE POLICY "Admin can view notifications" ON public.outbox_notifications
    FOR SELECT USING (
        branch_id = public.get_user_branch_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "System can manage notifications" ON public.outbox_notifications
    FOR ALL USING (true);