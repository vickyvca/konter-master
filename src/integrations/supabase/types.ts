export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_session_events: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          branch_id: string
          closed_at: string | null
          closing_cash: number | null
          difference: number | null
          expected_cash: number | null
          id: string
          notes: string | null
          opened_at: string | null
          opening_cash: number | null
          session_date: string
          status: string | null
          user_id: string
        }
        Insert: {
          branch_id: string
          closed_at?: string | null
          closing_cash?: number | null
          difference?: number | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_cash?: number | null
          session_date?: string
          status?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string
          closed_at?: string | null
          closing_cash?: number | null
          difference?: number | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_cash?: number | null
          session_date?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      coa_accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number | null
          branch_id: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          balance?: number | null
          branch_id: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number | null
          branch_id?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coa_accounts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coa_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "coa_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          branch_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          points: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          branch_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          points?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          branch_id: string
          doc_type: string
          id: string
          last_number: number | null
          year_month: string
        }
        Insert: {
          branch_id: string
          doc_type: string
          id?: string
          last_number?: number | null
          year_month: string
        }
        Update: {
          branch_id?: string
          doc_type?: string
          id?: string
          last_number?: number | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_sequences_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          branch_id: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          entry_date: string
          entry_number: string
          id: string
          is_posted: boolean | null
          journal_type: Database["public"]["Enums"]["journal_type"]
          reference_id: string | null
          reference_type: string | null
          total_credit: number | null
          total_debit: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_date?: string
          entry_number: string
          id?: string
          is_posted?: boolean | null
          journal_type: Database["public"]["Enums"]["journal_type"]
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number | null
          total_debit?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entry_date?: string
          entry_number?: string
          id?: string
          is_posted?: boolean | null
          journal_type?: Database["public"]["Enums"]["journal_type"]
          reference_id?: string | null
          reference_type?: string | null
          total_credit?: number | null
          total_debit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          entry_id: string
          id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "coa_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_notifications: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          message_content: string
          message_type: string
          recipient_phone: string
          reference_id: string | null
          reference_type: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          message_content: string
          message_type: string
          recipient_phone: string
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          message_content?: string
          message_type?: string
          recipient_phone?: string
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outbox_notifications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          avg_cost: number | null
          barcode: string | null
          buy_price: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          product_id: string
          sell_price: number | null
          sku: string
        }
        Insert: {
          avg_cost?: number | null
          barcode?: string | null
          buy_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          product_id: string
          sell_price?: number | null
          sku: string
        }
        Update: {
          avg_cost?: number | null
          barcode?: string | null
          buy_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          product_id?: string
          sell_price?: number | null
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_cost: number | null
          barcode: string | null
          branch_id: string
          brand: string | null
          buy_price: number | null
          category: string
          created_at: string | null
          description: string | null
          has_variants: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock: number | null
          name: string
          sell_price: number | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          avg_cost?: number | null
          barcode?: string | null
          branch_id: string
          brand?: string | null
          buy_price?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          sell_price?: number | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          avg_cost?: number | null
          barcode?: string | null
          branch_id?: string
          brand?: string | null
          buy_price?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          sell_price?: number | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          branch_id: string
          change_amount: number | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          session_id: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
        }
        Insert: {
          branch_id: string
          change_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          session_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Update: {
          branch_id?: string
          change_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          session_id?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_items: {
        Row: {
          cost_price: number | null
          created_at: string | null
          discount_amount: number | null
          id: string
          invoice_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          invoice_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          invoice_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_return_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          quantity: number
          return_id: string
          sales_item_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          quantity: number
          return_id: string
          sales_item_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          quantity?: number
          return_id?: string
          sales_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "sales_returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_return_items_sales_item_id_fkey"
            columns: ["sales_item_id"]
            isOneToOne: false
            referencedRelation: "sales_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_returns: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          refund_method: Database["public"]["Enums"]["payment_method"] | null
          return_number: string
          total_amount: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          refund_method?: Database["public"]["Enums"]["payment_method"] | null
          return_number: string
          total_amount?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          refund_method?: Database["public"]["Enums"]["payment_method"] | null
          return_number?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_returns_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_returns_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      service_attachments: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string | null
          file_type: string | null
          file_url: string
          id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: string
          reference: string | null
          ticket_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: string
          reference?: string | null
          ticket_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_type?: string
          reference?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_payments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_ticket_items: {
        Row: {
          cost_price: number | null
          created_at: string | null
          description: string
          id: string
          item_type: string
          product_id: string | null
          quantity: number | null
          subtotal: number
          ticket_id: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          description: string
          id?: string
          item_type: string
          product_id?: string | null
          quantity?: number | null
          subtotal: number
          ticket_id: string
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          description?: string
          id?: string
          item_type?: string
          product_id?: string | null
          quantity?: number | null
          subtotal?: number
          ticket_id?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_ticket_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_ticket_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tickets: {
        Row: {
          branch_id: string
          complaint: string
          completed_at: string | null
          created_at: string | null
          customer_id: string | null
          device_brand: string | null
          device_color: string | null
          device_imei: string | null
          device_model: string | null
          diagnosis: string | null
          dp_amount: number | null
          estimated_cost: number | null
          final_cost: number | null
          id: string
          notes: string | null
          paid_amount: number | null
          picked_up_at: string | null
          received_at: string | null
          received_by: string | null
          status: Database["public"]["Enums"]["service_status"] | null
          technician_id: string | null
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          complaint: string
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_brand?: string | null
          device_color?: string | null
          device_imei?: string | null
          device_model?: string | null
          diagnosis?: string | null
          dp_amount?: number | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          picked_up_at?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          technician_id?: string | null
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          complaint?: string
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_brand?: string | null
          device_color?: string | null
          device_imei?: string | null
          device_model?: string | null
          diagnosis?: string | null
          dp_amount?: number | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          picked_up_at?: string | null
          received_at?: string | null
          received_by?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          technician_id?: string | null
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_balances: {
        Row: {
          branch_id: string
          id: string
          location_id: string
          product_id: string
          quantity: number | null
          reserved_qty: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          branch_id: string
          id?: string
          location_id: string
          product_id: string
          quantity?: number | null
          reserved_qty?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          branch_id?: string
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number | null
          reserved_qty?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movement_items: {
        Row: {
          created_at: string | null
          id: string
          movement_id: string
          notes: string | null
          product_id: string
          quantity: number
          unit_cost: number | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_id: string
          notes?: string | null
          product_id: string
          quantity: number
          unit_cost?: number | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          unit_cost?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movement_items_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          from_location_id: string | null
          id: string
          movement_number: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          reference_id: string | null
          reference_type: string | null
          to_location_id: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          from_location_id?: string | null
          id?: string
          movement_number: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          from_location_id?: string | null
          id?: string
          movement_number?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          to_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          branch_id: string
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          branch_id: string
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_document_number: {
        Args: { _branch_id: string; _doc_type: string }
        Returns: string
      }
      get_user_branch_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      app_role: "owner" | "admin" | "kasir" | "teknisi" | "gudang"
      journal_type:
        | "sale"
        | "purchase"
        | "service"
        | "return"
        | "cash_event"
        | "adjustment"
      payment_method: "cash" | "transfer" | "qris" | "split"
      service_status:
        | "DITERIMA"
        | "DIAGNOSA"
        | "MENUNGGU_SPAREPART"
        | "PROSES"
        | "SELESAI"
        | "DIAMBIL"
        | "BATAL"
      stock_movement_type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      app_role: ["owner", "admin", "kasir", "teknisi", "gudang"],
      journal_type: [
        "sale",
        "purchase",
        "service",
        "return",
        "cash_event",
        "adjustment",
      ],
      payment_method: ["cash", "transfer", "qris", "split"],
      service_status: [
        "DITERIMA",
        "DIAGNOSA",
        "MENUNGGU_SPAREPART",
        "PROSES",
        "SELESAI",
        "DIAMBIL",
        "BATAL",
      ],
      stock_movement_type: ["IN", "OUT", "ADJUSTMENT", "TRANSFER"],
    },
  },
} as const
