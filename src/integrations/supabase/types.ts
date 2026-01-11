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
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          metadata: Json | null
          reminder_minutes: number | null
          service_request_id: string | null
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          metadata?: Json | null
          reminder_minutes?: number | null
          service_request_id?: string | null
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          metadata?: Json | null
          reminder_minutes?: number | null
          service_request_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          created_by: string
          follow_up_date: string | null
          id: string
          is_pinned: boolean | null
          note_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          created_by: string
          follow_up_date?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          created_by?: string
          follow_up_date?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      concierge_fees: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string
          fee_type: string | null
          id: string
          invoiced_at: string | null
          paid_at: string | null
          service_request_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description: string
          fee_type?: string | null
          id?: string
          invoiced_at?: string | null
          paid_at?: string | null
          service_request_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string
          fee_type?: string | null
          id?: string
          invoiced_at?: string | null
          paid_at?: string | null
          service_request_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concierge_fees_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          read_at: string | null
          sender_id: string
          sender_role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
          sender_role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "concierge_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string
          ended_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          metadata: Json | null
          started_at: string | null
          summary: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          channel?: string
          ended_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          ended_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          metadata?: Json | null
          started_at?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          credits: number
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          service_request_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          service_request_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          service_request_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_service_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          match_score: number | null
          service_id: string
          service_title: string
          traveler_archetype: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          match_score?: number | null
          service_id: string
          service_title: string
          traveler_archetype?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          match_score?: number | null
          service_id?: string
          service_title?: string
          traveler_archetype?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          data: Json | null
          email: string
          error_message: string | null
          id: string
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
          template: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          email: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          email?: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template?: string
          user_id?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          campaign: string | null
          created_at: string
          id: string
          landing_page: string | null
          medium: string | null
          metadata: Json | null
          referrer: string | null
          session_id: string
          source: string | null
          stage: string
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          id?: string
          landing_page?: string | null
          medium?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id: string
          source?: string | null
          stage: string
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string
          id?: string
          landing_page?: string | null
          medium?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string
          source?: string | null
          stage?: string
          user_id?: string | null
        }
        Relationships: []
      }
      launch_signups: {
        Row: {
          country_code: string | null
          created_at: string | null
          email: string | null
          id: string
          notification_preference: string | null
          notification_sent_at: string | null
          phone: string | null
          source: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notification_preference?: string | null
          notification_sent_at?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notification_preference?: string | null
          notification_sent_at?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      login_alerts: {
        Row: {
          alert_type: string
          created_at: string
          device_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "login_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      login_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          first_seen_at: string
          id: string
          ip_address: string | null
          is_trusted: boolean | null
          last_login_at: string
          location: string | null
          login_count: number | null
          os: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_login_at?: string
          location?: string | null
          login_count?: number | null
          os?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          first_seen_at?: string
          id?: string
          ip_address?: string | null
          is_trusted?: boolean | null
          last_login_at?: string
          location?: string | null
          login_count?: number | null
          os?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          alert_types: string[]
          created_at: string
          daily_digest_enabled: boolean
          digest_time: string
          email_enabled: boolean
          id: string
          phone_number: string | null
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_types?: string[]
          created_at?: string
          daily_digest_enabled?: boolean
          digest_time?: string
          email_enabled?: boolean
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_types?: string[]
          created_at?: string
          daily_digest_enabled?: boolean
          digest_time?: string
          email_enabled?: boolean
          id?: string
          phone_number?: string | null
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          description: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      outreach_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      partner_commissions: {
        Row: {
          booking_amount: number
          client_id: string
          commission_amount: number
          commission_rate: number | null
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          payout_error: string | null
          service_request_id: string | null
          service_title: string
          status: string | null
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          booking_amount: number
          client_id: string
          commission_amount: number
          commission_rate?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          payout_error?: string | null
          service_request_id?: string | null
          service_title: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          booking_amount?: number
          client_id?: string
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          payout_error?: string | null
          service_request_id?: string | null
          service_title?: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_messages: {
        Row: {
          attachments: string[] | null
          created_at: string
          id: string
          message: string
          read: boolean
          recipient_id: string
          request_id: string | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          recipient_id: string
          request_id?: string | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          recipient_id?: string
          request_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_outreach_logs: {
        Row: {
          content: string | null
          created_at: string
          id: string
          outreach_type: string
          prospect_id: string
          response_at: string | null
          response_notes: string | null
          response_received: boolean | null
          sent_at: string
          sent_by: string | null
          subject: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          outreach_type: string
          prospect_id: string
          response_at?: string | null
          response_notes?: string | null
          response_received?: boolean | null
          sent_at?: string
          sent_by?: string | null
          subject?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          outreach_type?: string
          prospect_id?: string
          response_at?: string | null
          response_notes?: string | null
          response_received?: boolean | null
          sent_at?: string
          sent_by?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_outreach_logs_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "partner_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_prospects: {
        Row: {
          assigned_to: string | null
          category: string
          company_name: string
          contact_name: string | null
          converted_partner_id: string | null
          coverage_regions: string[] | null
          created_at: string
          description: string | null
          email: string | null
          follow_up_date: string | null
          id: string
          last_contacted_at: string | null
          metadata: Json | null
          notes: string | null
          phone: string | null
          priority: string | null
          source: string | null
          status: string
          subcategory: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          company_name: string
          contact_name?: string | null
          converted_partner_id?: string | null
          coverage_regions?: string[] | null
          created_at?: string
          description?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          company_name?: string
          contact_name?: string | null
          converted_partner_id?: string | null
          coverage_regions?: string[] | null
          created_at?: string
          description?: string | null
          email?: string | null
          follow_up_date?: string | null
          id?: string
          last_contacted_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partner_services: {
        Row: {
          availability_notes: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          currency: string | null
          description: string | null
          highlights: string[] | null
          id: string
          images: string[] | null
          is_active: boolean
          max_price: number | null
          min_price: number | null
          partner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          availability_notes?: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string | null
          description?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_price?: number | null
          min_price?: number | null
          partner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          availability_notes?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          currency?: string | null
          description?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_price?: number | null
          min_price?: number | null
          partner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_services_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          categories: Database["public"]["Enums"]["service_category"][]
          company_name: string
          contact_name: string
          created_at: string
          description: string | null
          email: string
          id: string
          logo_url: string | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["partner_status"]
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          updated_at: string
          user_id: string
          verification_documents: string[] | null
          website: string | null
        }
        Insert: {
          categories?: Database["public"]["Enums"]["service_category"][]
          company_name: string
          contact_name: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string
          user_id: string
          verification_documents?: string[] | null
          website?: string | null
        }
        Update: {
          categories?: Database["public"]["Enums"]["service_category"][]
          company_name?: string
          contact_name?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          applied_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          referral_id: string | null
          reward_type: string
          reward_value: number | null
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          reward_type: string
          reward_value?: number | null
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          reward_type?: string
          reward_value?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          clicked_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_id: string
          reward_amount: number | null
          reward_type: string | null
          rewarded_at: string | null
          signed_up_at: string | null
          status: string
          subscribed_at: string | null
          updated_at: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          reward_type?: string | null
          rewarded_at?: string | null
          signed_up_at?: string | null
          status?: string
          subscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          reward_type?: string | null
          rewarded_at?: string | null
          signed_up_at?: string | null
          status?: string
          subscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      secure_messages: {
        Row: {
          attachments: string[] | null
          conversation_type: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      sent_notifications: {
        Row: {
          channel: string
          content: string
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_request_updates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_visible_to_client: boolean | null
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
          service_request_id: string
          title: string
          update_type: string
          updated_by: string | null
          updated_by_role: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_visible_to_client?: boolean | null
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          service_request_id: string
          title: string
          update_type: string
          updated_by?: string | null
          updated_by_role?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_visible_to_client?: boolean | null
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          service_request_id?: string
          title?: string
          update_type?: string
          updated_by?: string | null
          updated_by_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_request_updates_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at: string
          description: string
          id: string
          internal_notes: string | null
          partner_id: string | null
          partner_response: string | null
          preferred_date: string | null
          requirements: Json | null
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at?: string
          description: string
          id?: string
          internal_notes?: string | null
          partner_id?: string | null
          partner_response?: string | null
          preferred_date?: string | null
          requirements?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["service_category"]
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          internal_notes?: string | null
          partner_id?: string | null
          partner_response?: string | null
          preferred_date?: string | null
          requirements?: Json | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "partner_services"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_dna_profile: {
        Row: {
          accommodation_tier: string | null
          activity_preferences: Json | null
          budget_comfort_zone: Json | null
          created_at: string | null
          cuisine_affinities: string[] | null
          id: string
          last_computed_at: string | null
          onboarding_completed: boolean | null
          pace_preference: string | null
          seasonal_patterns: Json | null
          special_requirements: string[] | null
          traveler_archetype: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accommodation_tier?: string | null
          activity_preferences?: Json | null
          budget_comfort_zone?: Json | null
          created_at?: string | null
          cuisine_affinities?: string[] | null
          id?: string
          last_computed_at?: string | null
          onboarding_completed?: boolean | null
          pace_preference?: string | null
          seasonal_patterns?: Json | null
          special_requirements?: string[] | null
          traveler_archetype?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accommodation_tier?: string | null
          activity_preferences?: Json | null
          budget_comfort_zone?: Json | null
          created_at?: string | null
          cuisine_affinities?: string[] | null
          id?: string
          last_computed_at?: string | null
          onboarding_completed?: boolean | null
          pace_preference?: string | null
          seasonal_patterns?: Json | null
          special_requirements?: string[] | null
          traveler_archetype?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trial_applications: {
        Row: {
          annual_income_range: string | null
          company: string | null
          converted_at: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interests: string[] | null
          phone: string | null
          reason: string | null
          referral_source: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_income_range?: string | null
          company?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interests?: string[] | null
          phone?: string | null
          reason?: string | null
          referral_source?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_income_range?: string | null
          company?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interests?: string[] | null
          phone?: string | null
          reason?: string | null
          referral_source?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_events: {
        Row: {
          created_at: string
          element_class: string | null
          element_id: string | null
          element_text: string | null
          event_type: string
          id: string
          ip_country: string | null
          metadata: Json | null
          page_path: string
          referrer: string | null
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_type: string
          id?: string
          ip_country?: string | null
          metadata?: Json | null
          page_path: string
          referrer?: string | null
          scroll_depth?: number | null
          session_id: string
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_type?: string
          id?: string
          ip_country?: string | null
          metadata?: Json | null
          page_path?: string
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_allocation_at: string | null
          monthly_allocation: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_allocation_at?: string | null
          monthly_allocation?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_allocation_at?: string | null
          monthly_allocation?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string | null
          id: string
          preference_key: string
          preference_value: Json
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preference_key: string
          preference_value: Json
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preference_key?: string
          preference_value?: Json
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wearable_connections: {
        Row: {
          access_token: string
          created_at: string
          device_name: string | null
          expires_at: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          device_name?: string | null
          expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          device_name?: string | null
          expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_data: {
        Row: {
          created_at: string
          date: string
          hrv_avg: number | null
          id: string
          provider: string
          raw_data: Json | null
          readiness_score: number | null
          recovery_score: number | null
          resting_hr: number | null
          sleep_hours: number | null
          sleep_score: number | null
          strain_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hrv_avg?: number | null
          id?: string
          provider: string
          raw_data?: Json | null
          readiness_score?: number | null
          recovery_score?: number | null
          resting_hr?: number | null
          sleep_hours?: number | null
          sleep_score?: number | null
          strain_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hrv_avg?: number | null
          id?: string
          provider?: string
          raw_data?: Json | null
          readiness_score?: number | null
          recovery_score?: number | null
          resting_hr?: number | null
          sleep_hours?: number | null
          sleep_score?: number | null
          strain_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      funnel_summary: {
        Row: {
          campaign: string | null
          converted_count: number | null
          first_event_date: string | null
          landing_count: number | null
          last_event_date: string | null
          medium: string | null
          onboarding_completed_count: number | null
          onboarding_started_count: number | null
          signup_completed_count: number | null
          signup_started_count: number | null
          source: string | null
          trial_started_count: number | null
        }
        Relationships: []
      }
      page_heatmap_data: {
        Row: {
          click_count: number | null
          element_class: string | null
          element_id: string | null
          hour: string | null
          page_path: string | null
        }
        Relationships: []
      }
      session_summary: {
        Row: {
          max_scroll_depth: number | null
          pages_visited: number | null
          referrer: string | null
          session_end: string | null
          session_id: string | null
          session_start: string | null
          total_events: number | null
          total_time: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_launch_signup_rate_limit: {
        Args: { p_email: string; p_phone: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      has_active_trial: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner" | "member"
      partner_status: "pending" | "approved" | "suspended" | "rejected"
      request_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_category:
        | "private_aviation"
        | "yacht_charter"
        | "real_estate"
        | "collectibles"
        | "events_access"
        | "security"
        | "dining"
        | "travel"
        | "wellness"
        | "shopping"
        | "chauffeur"
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
      app_role: ["admin", "partner", "member"],
      partner_status: ["pending", "approved", "suspended", "rejected"],
      request_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      service_category: [
        "private_aviation",
        "yacht_charter",
        "real_estate",
        "collectibles",
        "events_access",
        "security",
        "dining",
        "travel",
        "wellness",
        "shopping",
        "chauffeur",
      ],
    },
  },
} as const
