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
      ab_test_assignments: {
        Row: {
          converted: boolean
          created_at: string
          id: string
          session_id: string
          test_id: string
          user_id: string | null
          variant_id: string
        }
        Insert: {
          converted?: boolean
          created_at?: string
          id?: string
          session_id: string
          test_id: string
          user_id?: string | null
          variant_id: string
        }
        Update: {
          converted?: boolean
          created_at?: string
          id?: string
          session_id?: string
          test_id?: string
          user_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          conversions: number
          created_at: string
          id: string
          impressions: number
          name: string
          test_id: string
          traffic_percentage: number
        }
        Insert: {
          conversions?: number
          created_at?: string
          id?: string
          impressions?: number
          name: string
          test_id: string
          traffic_percentage?: number
        }
        Update: {
          conversions?: number
          created_at?: string
          id?: string
          impressions?: number
          name?: string
          test_id?: string
          traffic_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
          winner_variant_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
          winner_variant_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          winner_variant_id?: string | null
        }
        Relationships: []
      }
      ai_conversation_memory: {
        Row: {
          confidence: number | null
          conversation_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          key: string
          memory_type: string
          source: string | null
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          confidence?: number | null
          conversation_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key: string
          memory_type: string
          source?: string | null
          updated_at?: string
          user_id: string
          value: Json
        }
        Update: {
          confidence?: number | null
          conversation_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key?: string
          memory_type?: string
          source?: string | null
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_memory_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_notes: string | null
          action_taken: boolean | null
          category: string
          created_at: string | null
          data: Json | null
          description: string
          expires_at: string | null
          generated_by: string | null
          id: string
          insight_type: string
          is_actionable: boolean | null
          is_read: boolean | null
          severity: string | null
          title: string
        }
        Insert: {
          action_notes?: string | null
          action_taken?: boolean | null
          category: string
          created_at?: string | null
          data?: Json | null
          description: string
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          insight_type: string
          is_actionable?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          title: string
        }
        Update: {
          action_notes?: string | null
          action_taken?: boolean | null
          category?: string
          created_at?: string | null
          data?: Json | null
          description?: string
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          insight_type?: string
          is_actionable?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "ai_specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_query_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          query_text: string
          query_type: string
          response_text: string | null
          response_time_ms: number | null
          specialist_id: string | null
          status: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          query_text: string
          query_type: string
          response_text?: string | null
          response_time_ms?: number | null
          specialist_id?: string | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          query_text?: string
          query_type?: string
          response_text?: string | null
          response_time_ms?: number | null
          specialist_id?: string | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_query_logs_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "ai_specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_specialists: {
        Row: {
          avg_response_time_ms: number | null
          capabilities: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model: string
          name: string
          specializations: string[] | null
          success_rate: number | null
          system_prompt: string | null
          total_queries: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          capabilities?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string
          name: string
          specializations?: string[] | null
          success_rate?: number | null
          system_prompt?: string | null
          total_queries?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time_ms?: number | null
          capabilities?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string
          name?: string
          specializations?: string[] | null
          success_rate?: number | null
          system_prompt?: string | null
          total_queries?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      attribution_events: {
        Row: {
          campaign: string | null
          channel: string | null
          content: string | null
          created_at: string | null
          event_value: number | null
          id: string
          medium: string | null
          page_path: string | null
          session_id: string
          source: string | null
          touchpoint_type: string
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          channel?: string | null
          content?: string | null
          created_at?: string | null
          event_value?: number | null
          id?: string
          medium?: string | null
          page_path?: string | null
          session_id: string
          source?: string | null
          touchpoint_type: string
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          channel?: string | null
          content?: string | null
          created_at?: string | null
          event_value?: number | null
          id?: string
          medium?: string | null
          page_path?: string | null
          session_id?: string
          source?: string | null
          touchpoint_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auction_bids: {
        Row: {
          amount: number
          auction_id: string
          created_at: string
          id: string
          is_auto_bid: boolean | null
          max_auto_bid: number | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          auction_id: string
          created_at?: string
          id?: string
          is_auto_bid?: boolean | null
          max_auto_bid?: number | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          auction_id?: string
          created_at?: string
          id?: string
          is_auto_bid?: boolean | null
          max_auto_bid?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      auction_consignments: {
        Row: {
          auction_id: string | null
          authenticity_documents: string[] | null
          category_id: string | null
          condition_report: string | null
          created_at: string
          description: string
          estimated_value_max: number | null
          estimated_value_min: number | null
          id: string
          images: string[] | null
          provenance: string | null
          reserve_price_request: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string | null
          submitter_id: string
          submitter_type: string
          title: string
          updated_at: string
        }
        Insert: {
          auction_id?: string | null
          authenticity_documents?: string[] | null
          category_id?: string | null
          condition_report?: string | null
          created_at?: string
          description: string
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          id?: string
          images?: string[] | null
          provenance?: string | null
          reserve_price_request?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
          submitter_id: string
          submitter_type: string
          title: string
          updated_at?: string
        }
        Update: {
          auction_id?: string | null
          authenticity_documents?: string[] | null
          category_id?: string | null
          condition_report?: string | null
          created_at?: string
          description?: string
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          id?: string
          images?: string[] | null
          provenance?: string | null
          reserve_price_request?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
          submitter_id?: string
          submitter_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_consignments_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_consignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "auction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_watchlist: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_watchlist_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          approval_status: string | null
          authenticity_verified: boolean | null
          buy_now_price: number | null
          buyer_premium_percent: number | null
          category: string
          condition_report: string | null
          created_at: string
          created_by: string | null
          currency: string
          current_bid: number | null
          description: string | null
          ends_at: string
          featured: boolean | null
          id: string
          images: string[] | null
          provenance: string | null
          rejection_reason: string | null
          reserve_met: boolean | null
          reserve_price: number | null
          seller_commission_percent: number | null
          specifications: Json | null
          starting_price: number
          starts_at: string
          status: string
          submitted_by: string | null
          submitted_by_type: string | null
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          approval_status?: string | null
          authenticity_verified?: boolean | null
          buy_now_price?: number | null
          buyer_premium_percent?: number | null
          category?: string
          condition_report?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          current_bid?: number | null
          description?: string | null
          ends_at: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          provenance?: string | null
          rejection_reason?: string | null
          reserve_met?: boolean | null
          reserve_price?: number | null
          seller_commission_percent?: number | null
          specifications?: Json | null
          starting_price?: number
          starts_at?: string
          status?: string
          submitted_by?: string | null
          submitted_by_type?: string | null
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          approval_status?: string | null
          authenticity_verified?: boolean | null
          buy_now_price?: number | null
          buyer_premium_percent?: number | null
          category?: string
          condition_report?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          current_bid?: number | null
          description?: string | null
          ends_at?: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          provenance?: string | null
          rejection_reason?: string | null
          reserve_met?: boolean | null
          reserve_price?: number | null
          seller_commission_percent?: number | null
          specifications?: Json | null
          starting_price?: number
          starts_at?: string
          status?: string
          submitted_by?: string | null
          submitted_by_type?: string | null
          title?: string
          updated_at?: string
          winner_id?: string | null
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
      backlink_opportunities: {
        Row: {
          category: string
          contacted_at: string | null
          created_at: string
          domain_authority: number | null
          id: string
          name: string
          notes: string | null
          priority: string | null
          status: string | null
          type: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          contacted_at?: string | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          name: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          contacted_at?: string | null
          created_at?: string
          domain_authority?: number | null
          id?: string
          name?: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      backup_verification_logs: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          status: string
          verification_type: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          status?: string
          verification_type: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          status?: string
          verification_type?: string
          verified_at?: string
        }
        Relationships: []
      }
      behavioral_triggers: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
          trigger_data: Json | null
          trigger_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          trigger_data?: Json | null
          trigger_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bid_revisions: {
        Row: {
          bid_id: string
          created_at: string
          id: string
          new_amount: number
          new_message: string | null
          new_timeline: string | null
          previous_amount: number
          previous_message: string | null
          previous_timeline: string | null
          revision_number: number
          revision_reason: string | null
        }
        Insert: {
          bid_id: string
          created_at?: string
          id?: string
          new_amount: number
          new_message?: string | null
          new_timeline?: string | null
          previous_amount: number
          previous_message?: string | null
          previous_timeline?: string | null
          revision_number?: number
          revision_reason?: string | null
        }
        Update: {
          bid_id?: string
          created_at?: string
          id?: string
          new_amount?: number
          new_message?: string | null
          new_timeline?: string | null
          previous_amount?: number
          previous_message?: string | null
          previous_timeline?: string | null
          revision_number?: number
          revision_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_revisions_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "service_request_bids"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          keywords: string[] | null
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      boardroom_participants: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          role: string
          session_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          session_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string
          session_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "boardroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          host_id: string
          id: string
          is_recording_enabled: boolean | null
          is_waiting_room_enabled: boolean | null
          max_participants: number | null
          metadata: Json | null
          participant_emails: string[] | null
          room_code: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_id: string
          id?: string
          is_recording_enabled?: boolean | null
          is_waiting_room_enabled?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          participant_emails?: string[] | null
          room_code?: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_id?: string
          id?: string
          is_recording_enabled?: boolean | null
          is_waiting_room_enabled?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          participant_emails?: string[] | null
          room_code?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
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
      campaign_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          campaign_id: string
          campaign_name: string | null
          current_value: number | null
          id: string
          message: string | null
          threshold: number | null
          triggered_at: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          campaign_id: string
          campaign_name?: string | null
          current_value?: number | null
          id?: string
          message?: string | null
          threshold?: number | null
          triggered_at?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          campaign_id?: string
          campaign_name?: string | null
          current_value?: number | null
          id?: string
          message?: string | null
          threshold?: number | null
          triggered_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          auto_renew: boolean | null
          certificate_type: string | null
          created_at: string
          domain: string | null
          expires_at: string
          fingerprint_sha256: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          last_checked_at: string | null
          metadata: Json | null
          name: string
          renewal_reminder_days: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          certificate_type?: string | null
          created_at?: string
          domain?: string | null
          expires_at: string
          fingerprint_sha256?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          last_checked_at?: string | null
          metadata?: Json | null
          name: string
          renewal_reminder_days?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          certificate_type?: string | null
          created_at?: string
          domain?: string | null
          expires_at?: string
          fingerprint_sha256?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          last_checked_at?: string | null
          metadata?: Json | null
          name?: string
          renewal_reminder_days?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          updated_at?: string
        }
        Relationships: []
      }
      circle_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      circle_connections: {
        Row: {
          ai_match_reasons: Json | null
          ai_match_score: number | null
          connected_at: string | null
          created_at: string
          id: string
          introduction_note: string | null
          recipient_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          ai_match_reasons?: Json | null
          ai_match_score?: number | null
          connected_at?: string | null
          created_at?: string
          id?: string
          introduction_note?: string | null
          recipient_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          ai_match_reasons?: Json | null
          ai_match_score?: number | null
          connected_at?: string | null
          created_at?: string
          id?: string
          introduction_note?: string | null
          recipient_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      circle_introductions: {
        Row: {
          common_interests: string[] | null
          created_at: string
          id: string
          match_reasons: Json | null
          match_score: number
          status: string | null
          suggested_member_id: string
          suggested_talking_points: Json | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          common_interests?: string[] | null
          created_at?: string
          id?: string
          match_reasons?: Json | null
          match_score: number
          status?: string | null
          suggested_member_id: string
          suggested_talking_points?: Json | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          common_interests?: string[] | null
          created_at?: string
          id?: string
          match_reasons?: Json | null
          match_score?: number
          status?: string | null
          suggested_member_id?: string
          suggested_talking_points?: Json | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      circle_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_encrypted: boolean | null
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "circle_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_opportunities: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          currency: string | null
          description: string | null
          expires_at: string | null
          filled_slots: number | null
          id: string
          images: string[] | null
          location: string | null
          max_contribution: number | null
          min_contribution: number | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          requirements: Json | null
          status: Database["public"]["Enums"]["opportunity_status"]
          target_date: string | null
          title: string
          total_slots: number | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          filled_slots?: number | null
          id?: string
          images?: string[] | null
          location?: string | null
          max_contribution?: number | null
          min_contribution?: number | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          requirements?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          target_date?: string | null
          title: string
          total_slots?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          filled_slots?: number | null
          id?: string
          images?: string[] | null
          location?: string | null
          max_contribution?: number | null
          min_contribution?: number | null
          opportunity_type?: Database["public"]["Enums"]["opportunity_type"]
          requirements?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          target_date?: string | null
          title?: string
          total_slots?: number | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      circle_opportunity_interests: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          contribution_amount: number | null
          created_at: string
          id: string
          interest_level: string | null
          message: string | null
          opportunity_id: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          contribution_amount?: number | null
          created_at?: string
          id?: string
          interest_level?: string | null
          message?: string | null
          opportunity_id: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          contribution_amount?: number | null
          created_at?: string
          id?: string
          interest_level?: string | null
          message?: string | null
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_opportunity_interests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "circle_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_profiles: {
        Row: {
          assets: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          interests: string[] | null
          is_discoverable: boolean | null
          location: string | null
          net_worth_tier: string | null
          privacy_level: string | null
          title: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          assets?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          interests?: string[] | null
          is_discoverable?: boolean | null
          location?: string | null
          net_worth_tier?: string | null
          privacy_level?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          assets?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[] | null
          is_discoverable?: boolean | null
          location?: string | null
          net_worth_tier?: string | null
          privacy_level?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_size: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          owner_id: string | null
          slug: string
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_size?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_size?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_followers: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_followers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          is_verified: boolean | null
          joined_at: string | null
          role: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          is_verified?: boolean | null
          joined_at?: string | null
          role?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          is_verified?: boolean | null
          joined_at?: string | null
          role?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      concierge_requests: {
        Row: {
          budget_range: string | null
          category: string
          created_at: string
          description: string
          guest_email: string | null
          guest_name: string | null
          id: string
          internal_notes: string | null
          location: string | null
          preferred_date: string | null
          priority: string
          responded_at: string | null
          response: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          category?: string
          created_at?: string
          description: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          internal_notes?: string | null
          location?: string | null
          preferred_date?: string | null
          priority?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          category?: string
          created_at?: string
          description?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          internal_notes?: string | null
          location?: string | null
          preferred_date?: string | null
          priority?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_automation_logs: {
        Row: {
          automation_type: string
          contact_id: string | null
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          automation_type: string
          contact_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Update: {
          automation_type?: string
          contact_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_automation_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          admin_notified: boolean | null
          assigned_to: string | null
          auto_response_sent: boolean | null
          created_at: string
          email: string
          id: string
          lead_score: number | null
          message: string
          name: string
          notes: string | null
          phone: string | null
          processed_at: string | null
          source: string | null
          status: string
          updated_at: string
          webhook_sent: boolean | null
        }
        Insert: {
          admin_notified?: boolean | null
          assigned_to?: string | null
          auto_response_sent?: boolean | null
          created_at?: string
          email: string
          id?: string
          lead_score?: number | null
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          webhook_sent?: boolean | null
        }
        Update: {
          admin_notified?: boolean | null
          assigned_to?: string | null
          auto_response_sent?: boolean | null
          created_at?: string
          email?: string
          id?: string
          lead_score?: number | null
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          webhook_sent?: boolean | null
        }
        Relationships: []
      }
      content_gaps: {
        Row: {
          assigned_to: string | null
          competitor_coverage: Json | null
          content_type: string | null
          created_at: string | null
          difficulty_score: number | null
          id: string
          keyword: string
          priority: string | null
          search_volume: number | null
          status: string | null
          target_page: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          competitor_coverage?: Json | null
          content_type?: string | null
          created_at?: string | null
          difficulty_score?: number | null
          id?: string
          keyword: string
          priority?: string | null
          search_volume?: number | null
          status?: string | null
          target_page?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          competitor_coverage?: Json | null
          content_type?: string | null
          created_at?: string | null
          difficulty_score?: number | null
          id?: string
          keyword?: string
          priority?: string | null
          search_volume?: number | null
          status?: string | null
          target_page?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          action_taken: string | null
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
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
      currency_rates_cache: {
        Row: {
          base_currency: string
          expires_at: string
          fetched_at: string
          id: string
          rates: Json
        }
        Insert: {
          base_currency: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rates?: Json
        }
        Update: {
          base_currency?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          rates?: Json
        }
        Relationships: []
      }
      db_schema_cache: {
        Row: {
          id: string
          last_analyzed_at: string | null
          row_count: number | null
          sample_data: Json | null
          schema_json: Json
          table_name: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_analyzed_at?: string | null
          row_count?: number | null
          sample_data?: Json | null
          schema_json: Json
          table_name: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_analyzed_at?: string | null
          row_count?: number | null
          sample_data?: Json | null
          schema_json?: Json
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      discovery_logs: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          kind: string
          metadata: Json | null
          partners_found: number | null
          source: string | null
          users_found: number | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          kind: string
          metadata?: Json | null
          partners_found?: number | null
          source?: string | null
          users_found?: number | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          kind?: string
          metadata?: Json | null
          partners_found?: number | null
          source?: string | null
          users_found?: number | null
        }
        Relationships: []
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
      edge_function_metrics: {
        Row: {
          created_at: string
          function_name: string
          id: string
          invoked_at: string
          is_cold_start: boolean | null
          metadata: Json | null
          response_time_ms: number
          status: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          invoked_at?: string
          is_cold_start?: boolean | null
          metadata?: Json | null
          response_time_ms: number
          status?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          invoked_at?: string
          is_cold_start?: boolean | null
          metadata?: Json | null
          response_time_ms?: number
          status?: string
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
      encryption_keys: {
        Row: {
          algorithm: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_identifier: string
          key_version: number
          metadata: Json | null
          next_rotation_at: string | null
          rotated_at: string | null
          rotation_interval_days: number | null
          status: Database["public"]["Enums"]["encryption_key_status"]
        }
        Insert: {
          algorithm?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_identifier: string
          key_version?: number
          metadata?: Json | null
          next_rotation_at?: string | null
          rotated_at?: string | null
          rotation_interval_days?: number | null
          status?: Database["public"]["Enums"]["encryption_key_status"]
        }
        Update: {
          algorithm?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_identifier?: string
          key_version?: number
          metadata?: Json | null
          next_rotation_at?: string | null
          rotated_at?: string | null
          rotation_interval_days?: number | null
          status?: Database["public"]["Enums"]["encryption_key_status"]
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          function_name: string | null
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type: string
          function_name?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          function_name?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exit_intent_conversions: {
        Row: {
          action: string
          created_at: string
          email: string | null
          id: string
          offer_type: string
          page_path: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          email?: string | null
          id?: string
          offer_type: string
          page_path: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          email?: string | null
          id?: string
          offer_type?: string
          page_path?: string
          session_id?: string
          user_id?: string | null
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
      health_events: {
        Row: {
          component: string
          created_at: string
          details: Json | null
          duration_ms: number | null
          event_type: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          component: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          event_type: string
          id?: string
          status: string
          user_id?: string | null
        }
        Update: {
          component?: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          event_type?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hotel_availability: {
        Row: {
          amenities: string[] | null
          availability_status: string | null
          available_from: string
          available_to: string
          commission_rate: number | null
          created_at: string
          currency: string | null
          id: string
          images: string[] | null
          last_synced_at: string | null
          location: string | null
          max_guests: number | null
          metadata: Json | null
          min_nights: number | null
          partner_id: string
          property_code: string | null
          property_name: string
          rate_per_night: number
          room_description: string | null
          room_type: string
          special_offers: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          availability_status?: string | null
          available_from: string
          available_to: string
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          images?: string[] | null
          last_synced_at?: string | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          min_nights?: number | null
          partner_id: string
          property_code?: string | null
          property_name: string
          rate_per_night: number
          room_description?: string | null
          room_type: string
          special_offers?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          availability_status?: string | null
          available_from?: string
          available_to?: string
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          images?: string[] | null
          last_synced_at?: string | null
          location?: string | null
          max_guests?: number | null
          metadata?: Json | null
          min_nights?: number | null
          partner_id?: string
          property_code?: string | null
          property_name?: string
          rate_per_night?: number
          room_description?: string | null
          room_type?: string
          special_offers?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_availability_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_bookings: {
        Row: {
          availability_id: string | null
          booking_status: string | null
          check_in: string
          check_out: string
          client_id: string
          confirmation_number: string | null
          created_at: string
          currency: string | null
          guest_details: Json | null
          guests: number | null
          id: string
          partner_id: string
          partner_response: Json | null
          property_name: string
          rate_per_night: number | null
          room_type: string
          service_request_id: string | null
          special_requests: string | null
          total_amount: number | null
          total_nights: number | null
          updated_at: string
        }
        Insert: {
          availability_id?: string | null
          booking_status?: string | null
          check_in: string
          check_out: string
          client_id: string
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          guest_details?: Json | null
          guests?: number | null
          id?: string
          partner_id: string
          partner_response?: Json | null
          property_name: string
          rate_per_night?: number | null
          room_type: string
          service_request_id?: string | null
          special_requests?: string | null
          total_amount?: number | null
          total_nights?: number | null
          updated_at?: string
        }
        Update: {
          availability_id?: string | null
          booking_status?: string | null
          check_in?: string
          check_out?: string
          client_id?: string
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          guest_details?: Json | null
          guests?: number | null
          id?: string
          partner_id?: string
          partner_response?: Json | null
          property_name?: string
          rate_per_night?: number | null
          room_type?: string
          service_request_id?: string | null
          special_requests?: string | null
          total_amount?: number | null
          total_nights?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "hotel_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_bookings_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      house_partner_bids: {
        Row: {
          bid_amount: number
          created_at: string | null
          currency: string | null
          estimated_timeline: string | null
          house_partner_id: string
          id: string
          notes: string | null
          service_request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_amount: number
          created_at?: string | null
          currency?: string | null
          estimated_timeline?: string | null
          house_partner_id: string
          id?: string
          notes?: string | null
          service_request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_amount?: number
          created_at?: string | null
          currency?: string | null
          estimated_timeline?: string | null
          house_partner_id?: string
          id?: string
          notes?: string | null
          service_request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "house_partner_bids_house_partner_id_fkey"
            columns: ["house_partner_id"]
            isOneToOne: false
            referencedRelation: "house_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "house_partner_bids_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      house_partner_services: {
        Row: {
          amount: number | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          house_partner_id: string
          id: string
          notes: string | null
          rating: number | null
          service_description: string
          service_request_id: string | null
          status: string
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          house_partner_id: string
          id?: string
          notes?: string | null
          rating?: number | null
          service_description: string
          service_request_id?: string | null
          status?: string
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          house_partner_id?: string
          id?: string
          notes?: string | null
          rating?: number | null
          service_description?: string
          service_request_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_partner_services_house_partner_id_fkey"
            columns: ["house_partner_id"]
            isOneToOne: false
            referencedRelation: "house_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "house_partner_services_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      house_partners: {
        Row: {
          category: string
          company_name: string | null
          contact_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          metadata: Json | null
          name: string
          phone: string | null
          pricing_tier: string | null
          rating: number | null
          service_regions: string[] | null
          subcategories: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          company_name?: string | null
          contact_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          metadata?: Json | null
          name: string
          phone?: string | null
          pricing_tier?: string | null
          rating?: number | null
          service_regions?: string[] | null
          subcategories?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          company_name?: string | null
          contact_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          pricing_tier?: string | null
          rating?: number | null
          service_regions?: string[] | null
          subcategories?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          invited_by: string | null
          invited_email: string | null
          joined_at: string | null
          permissions: Json
          role: Database["public"]["Enums"]["household_role"]
          spending_limit: number | null
          status: Database["public"]["Enums"]["household_member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          joined_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["household_role"]
          spending_limit?: number | null
          status?: Database["public"]["Enums"]["household_member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          joined_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["household_role"]
          spending_limit?: number | null
          status?: Database["public"]["Enums"]["household_member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          credit_pool_enabled: boolean
          id: string
          name: string
          primary_member_id: string
          subscription_id: string | null
          total_pool_credits: number
          type: Database["public"]["Enums"]["household_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_pool_enabled?: boolean
          id?: string
          name: string
          primary_member_id: string
          subscription_id?: string | null
          total_pool_credits?: number
          type?: Database["public"]["Enums"]["household_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_pool_enabled?: boolean
          id?: string
          name?: string
          primary_member_id?: string
          subscription_id?: string | null
          total_pool_credits?: number
          type?: Database["public"]["Enums"]["household_type"]
          updated_at?: string
        }
        Relationships: []
      }
      impact_investments: {
        Row: {
          amount: number
          carbon_offset_tons: number | null
          created_at: string
          currency: string | null
          id: string
          investment_date: string | null
          notes: string | null
          people_impacted: number | null
          project_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          carbon_offset_tons?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          investment_date?: string | null
          notes?: string | null
          people_impacted?: number | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          carbon_offset_tons?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          investment_date?: string | null
          notes?: string | null
          people_impacted?: number | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "impact_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_projects: {
        Row: {
          carbon_offset_tons: number | null
          category: string
          created_at: string
          current_amount: number | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          partner_name: string | null
          people_helped: number | null
          region: string
          start_date: string | null
          status: string | null
          target_amount: number | null
          title: string
          updated_at: string
        }
        Insert: {
          carbon_offset_tons?: number | null
          category: string
          created_at?: string
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          partner_name?: string | null
          people_helped?: number | null
          region: string
          start_date?: string | null
          status?: string | null
          target_amount?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          carbon_offset_tons?: number | null
          category?: string
          created_at?: string
          current_amount?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          partner_name?: string | null
          people_helped?: number | null
          region?: string
          start_date?: string | null
          status?: string | null
          target_amount?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_services: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_services?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_services?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ip_login_attempts: {
        Row: {
          attempt_type: string
          created_at: string
          email: string | null
          id: string
          ip_address: string
          user_agent: string | null
        }
        Insert: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address: string
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          notes: string | null
          portfolio_url: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_email: string | null
          application_url: string | null
          applications_count: number | null
          benefits: string[] | null
          company_id: string
          created_at: string | null
          description: string
          experience_level: string | null
          expires_at: string | null
          id: string
          is_featured: boolean | null
          is_remote: boolean | null
          job_type: string | null
          location: string | null
          posted_by: string | null
          requirements: string | null
          responsibilities: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_period: string | null
          skills: string[] | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          application_email?: string | null
          application_url?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          company_id: string
          created_at?: string | null
          description: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          skills?: string[] | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          application_email?: string | null
          application_url?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          company_id?: string
          created_at?: string | null
          description?: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          skills?: string[] | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      key_rotation_history: {
        Row: {
          affected_records: number | null
          error_message: string | null
          id: string
          key_id: string | null
          new_version: number
          old_version: number
          rotated_at: string
          rotated_by: string | null
          rotation_reason: string | null
          success: boolean
        }
        Insert: {
          affected_records?: number | null
          error_message?: string | null
          id?: string
          key_id?: string | null
          new_version: number
          old_version: number
          rotated_at?: string
          rotated_by?: string | null
          rotation_reason?: string | null
          success?: boolean
        }
        Update: {
          affected_records?: number | null
          error_message?: string | null
          id?: string
          key_id?: string | null
          new_version?: number
          old_version?: number
          rotated_at?: string
          rotated_by?: string | null
          rotation_reason?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "key_rotation_history_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
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
      lead_scores: {
        Row: {
          admin_notified: boolean | null
          created_at: string
          email: string | null
          id: string
          is_vip: boolean | null
          last_activity_at: string
          orla_engaged: boolean | null
          score: number
          session_id: string | null
          signals: Json | null
          tier: string
          updated_at: string
          user_id: string | null
          vip_detected_at: string | null
        }
        Insert: {
          admin_notified?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          is_vip?: boolean | null
          last_activity_at?: string
          orla_engaged?: boolean | null
          score?: number
          session_id?: string | null
          signals?: Json | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          vip_detected_at?: string | null
        }
        Update: {
          admin_notified?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          is_vip?: boolean | null
          last_activity_at?: string
          orla_engaged?: boolean | null
          score?: number
          session_id?: string | null
          signals?: Json | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          vip_detected_at?: string | null
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          last_scraped_at: string | null
          leads_found: number | null
          metadata: Json | null
          name: string
          source_type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          leads_found?: number | null
          metadata?: Json | null
          name: string
          source_type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          leads_found?: number | null
          metadata?: Json | null
          name?: string
          source_type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      lifestyle_opportunities: {
        Row: {
          auto_book_enabled: boolean | null
          available_from: string | null
          available_until: string | null
          booking_reference: string | null
          category: string
          created_at: string | null
          currency: string | null
          description: string
          estimated_cost: number | null
          expires_at: string | null
          external_data: Json | null
          id: string
          images: Json | null
          location: string | null
          match_reasons: Json
          match_score: number
          member_response: string | null
          opportunity_type: string
          priority: number | null
          responded_at: string | null
          status: string | null
          suggested_dates: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_book_enabled?: boolean | null
          available_from?: string | null
          available_until?: string | null
          booking_reference?: string | null
          category: string
          created_at?: string | null
          currency?: string | null
          description: string
          estimated_cost?: number | null
          expires_at?: string | null
          external_data?: Json | null
          id?: string
          images?: Json | null
          location?: string | null
          match_reasons: Json
          match_score: number
          member_response?: string | null
          opportunity_type: string
          priority?: number | null
          responded_at?: string | null
          status?: string | null
          suggested_dates?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_book_enabled?: boolean | null
          available_from?: string | null
          available_until?: string | null
          booking_reference?: string | null
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          estimated_cost?: number | null
          expires_at?: string | null
          external_data?: Json | null
          id?: string
          images?: Json | null
          location?: string | null
          match_reasons?: Json
          match_score?: number
          member_response?: string | null
          opportunity_type?: string
          priority?: number | null
          responded_at?: string | null
          status?: string | null
          suggested_dates?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      local_seo_markets: {
        Row: {
          citations_count: number | null
          city: string
          country: string
          created_at: string | null
          gbp_claimed: boolean | null
          id: string
          landing_page_url: string | null
          local_keywords: Json | null
          priority: number | null
          region: string | null
          schema_implemented: boolean | null
          updated_at: string | null
        }
        Insert: {
          citations_count?: number | null
          city: string
          country: string
          created_at?: string | null
          gbp_claimed?: boolean | null
          id?: string
          landing_page_url?: string | null
          local_keywords?: Json | null
          priority?: number | null
          region?: string | null
          schema_implemented?: boolean | null
          updated_at?: string | null
        }
        Update: {
          citations_count?: number | null
          city?: string
          country?: string
          created_at?: string | null
          gbp_claimed?: boolean | null
          id?: string
          landing_page_url?: string | null
          local_keywords?: Json | null
          priority?: number | null
          region?: string | null
          schema_implemented?: boolean | null
          updated_at?: string | null
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
      marketing_strategies: {
        Row: {
          category: string
          channels: string[] | null
          created_at: string | null
          description: string | null
          estimated_hours_weekly: number | null
          estimated_monthly_budget: number | null
          expected_results: string | null
          expected_roi: string | null
          id: string
          name: string
          priority: number | null
          status: Database["public"]["Enums"]["strategy_status"] | null
          target_cpa: number | null
          type: Database["public"]["Enums"]["strategy_type"]
          updated_at: string | null
        }
        Insert: {
          category: string
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_hours_weekly?: number | null
          estimated_monthly_budget?: number | null
          expected_results?: string | null
          expected_roi?: string | null
          id?: string
          name: string
          priority?: number | null
          status?: Database["public"]["Enums"]["strategy_status"] | null
          target_cpa?: number | null
          type: Database["public"]["Enums"]["strategy_type"]
          updated_at?: string | null
        }
        Update: {
          category?: string
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_hours_weekly?: number | null
          estimated_monthly_budget?: number | null
          expected_results?: string | null
          expected_roi?: string | null
          id?: string
          name?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["strategy_status"] | null
          target_cpa?: number | null
          type?: Database["public"]["Enums"]["strategy_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      member_important_dates: {
        Row: {
          associated_person: string | null
          created_at: string | null
          date_type: string
          date_value: string
          description: string | null
          id: string
          preferences: Json | null
          recurring: boolean | null
          reminder_days: number | null
          title: string
          user_id: string
        }
        Insert: {
          associated_person?: string | null
          created_at?: string | null
          date_type: string
          date_value: string
          description?: string | null
          id?: string
          preferences?: Json | null
          recurring?: boolean | null
          reminder_days?: number | null
          title: string
          user_id: string
        }
        Update: {
          associated_person?: string | null
          created_at?: string | null
          date_type?: string
          date_value?: string
          description?: string | null
          id?: string
          preferences?: Json | null
          recurring?: boolean | null
          reminder_days?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      member_preference_dna: {
        Row: {
          adventure_score: number | null
          avoided_categories: Json | null
          confidence_score: number | null
          created_at: string | null
          currency: string | null
          data_points_analyzed: number | null
          id: string
          last_learning_at: string | null
          luxury_threshold: number | null
          preferred_booking_lead_days: number | null
          preferred_cuisines: Json | null
          preferred_destinations: Json | null
          preferred_experiences: Json | null
          preferred_travel_months: Json | null
          privacy_preference: number | null
          social_preference: number | null
          spontaneity_score: number | null
          typical_spend_per_experience: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adventure_score?: number | null
          avoided_categories?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_points_analyzed?: number | null
          id?: string
          last_learning_at?: string | null
          luxury_threshold?: number | null
          preferred_booking_lead_days?: number | null
          preferred_cuisines?: Json | null
          preferred_destinations?: Json | null
          preferred_experiences?: Json | null
          preferred_travel_months?: Json | null
          privacy_preference?: number | null
          social_preference?: number | null
          spontaneity_score?: number | null
          typical_spend_per_experience?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adventure_score?: number | null
          avoided_categories?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          currency?: string | null
          data_points_analyzed?: number | null
          id?: string
          last_learning_at?: string | null
          luxury_threshold?: number | null
          preferred_booking_lead_days?: number | null
          preferred_cuisines?: Json | null
          preferred_destinations?: Json | null
          preferred_experiences?: Json | null
          preferred_travel_months?: Json | null
          privacy_preference?: number | null
          social_preference?: number | null
          spontaneity_score?: number | null
          typical_spend_per_experience?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      member_sites: {
        Row: {
          analytics_enabled: boolean | null
          branding: Json | null
          content: Json | null
          created_at: string
          custom_domain: string | null
          id: string
          name: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["site_status"]
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          branding?: Json | null
          content?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          name: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["site_status"]
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          branding?: Json | null
          content?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          name?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["site_status"]
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      network_partnerships: {
        Row: {
          conversions_from_referrals: number | null
          created_at: string | null
          engagement_notes: string | null
          id: string
          last_contact_at: string | null
          network_name: string
          network_type: string | null
          next_followup_at: string | null
          partnership_status:
            | Database["public"]["Enums"]["partnership_status"]
            | null
          playbook_url: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          referrals_received: number | null
          updated_at: string | null
        }
        Insert: {
          conversions_from_referrals?: number | null
          created_at?: string | null
          engagement_notes?: string | null
          id?: string
          last_contact_at?: string | null
          network_name: string
          network_type?: string | null
          next_followup_at?: string | null
          partnership_status?:
            | Database["public"]["Enums"]["partnership_status"]
            | null
          playbook_url?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          referrals_received?: number | null
          updated_at?: string | null
        }
        Update: {
          conversions_from_referrals?: number | null
          created_at?: string | null
          engagement_notes?: string | null
          id?: string
          last_contact_at?: string | null
          network_name?: string
          network_type?: string | null
          next_followup_at?: string | null
          partnership_status?:
            | Database["public"]["Enums"]["partnership_status"]
            | null
          playbook_url?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          referrals_received?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          attempts: number
          created_at: string
          delivery_confirmed_at: string | null
          delivery_method: string | null
          error_message: string | null
          event_summary: Json
          id: string
          last_attempt_at: string | null
          max_attempts: number
          next_retry_at: string | null
          partner_id: string | null
          partner_ref: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivery_confirmed_at?: string | null
          delivery_method?: string | null
          error_message?: string | null
          event_summary: Json
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          partner_id?: string | null
          partner_ref: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          delivery_confirmed_at?: string | null
          delivery_method?: string | null
          error_message?: string | null
          event_summary?: Json
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          partner_id?: string | null
          partner_ref?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
      outreach_campaigns: {
        Row: {
          auto_follow_up: boolean | null
          category: string
          converted_count: number
          created_at: string
          created_by: string | null
          daily_limit: number | null
          id: string
          name: string
          opened_count: number
          replied_count: number
          sent_count: number
          sequence_steps: number
          start_date: string | null
          status: string
          target_count: number
          target_keywords: string | null
          updated_at: string
        }
        Insert: {
          auto_follow_up?: boolean | null
          category: string
          converted_count?: number
          created_at?: string
          created_by?: string | null
          daily_limit?: number | null
          id?: string
          name: string
          opened_count?: number
          replied_count?: number
          sent_count?: number
          sequence_steps?: number
          start_date?: string | null
          status?: string
          target_count?: number
          target_keywords?: string | null
          updated_at?: string
        }
        Update: {
          auto_follow_up?: boolean | null
          category?: string
          converted_count?: number
          created_at?: string
          created_by?: string | null
          daily_limit?: number | null
          id?: string
          name?: string
          opened_count?: number
          replied_count?: number
          sent_count?: number
          sequence_steps?: number
          start_date?: string | null
          status?: string
          target_count?: number
          target_keywords?: string | null
          updated_at?: string
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
      partner_applications: {
        Row: {
          categories: string[] | null
          category: string
          company_name: string
          contact_name: string
          coverage_regions: string[] | null
          created_at: string
          description: string | null
          email: string
          experience_years: number | null
          id: string
          notable_clients: string | null
          notes: string | null
          phone: string | null
          regions: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          categories?: string[] | null
          category: string
          company_name: string
          contact_name: string
          coverage_regions?: string[] | null
          created_at?: string
          description?: string | null
          email: string
          experience_years?: number | null
          id?: string
          notable_clients?: string | null
          notes?: string | null
          phone?: string | null
          regions?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          categories?: string[] | null
          category?: string
          company_name?: string
          contact_name?: string
          coverage_regions?: string[] | null
          created_at?: string
          description?: string | null
          email?: string
          experience_years?: number | null
          id?: string
          notable_clients?: string | null
          notes?: string | null
          phone?: string | null
          regions?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
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
          delivered_at: string | null
          delivery_method: string | null
          delivery_status: string | null
          email_clicked_at: string | null
          email_opened_at: string | null
          email_sent_at: string | null
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
          delivered_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
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
          delivered_at?: string | null
          delivery_method?: string | null
          delivery_status?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
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
      partner_performance_scores: {
        Row: {
          breakdown: Json | null
          created_at: string
          id: string
          partner_id: string
          period_end: string
          period_start: string
          sample_size: number | null
          score: number
          score_type: string
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          partner_id: string
          period_end: string
          period_start: string
          sample_size?: number | null
          score: number
          score_type: string
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          partner_id?: string
          period_end?: string
          period_start?: string
          sample_size?: number | null
          score?: number
          score_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_performance_scores_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_pms_integrations: {
        Row: {
          api_endpoint: string | null
          created_at: string
          credentials_encrypted: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          partner_id: string
          property_code: string
          provider: string
          sync_error: string | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          partner_id: string
          property_code: string
          provider?: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          partner_id?: string
          property_code?: string
          provider?: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_pms_integrations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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
      partner_recommendations: {
        Row: {
          created_at: string
          id: string
          match_reasons: string[] | null
          match_score: number
          notified_at: string | null
          partner_id: string
          responded_at: string | null
          service_request_id: string
          status: Database["public"]["Enums"]["recommendation_status"] | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_reasons?: string[] | null
          match_score: number
          notified_at?: string | null
          partner_id: string
          responded_at?: string | null
          service_request_id: string
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_reasons?: string[] | null
          match_score?: number
          notified_at?: string | null
          partner_id?: string
          responded_at?: string | null
          service_request_id?: string
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_recommendations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_recommendations_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
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
      partner_waitlist: {
        Row: {
          category_preferences: string[] | null
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          interest_type: string
          message: string | null
        }
        Insert: {
          category_preferences?: string[] | null
          company_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          interest_type: string
          message?: string | null
        }
        Update: {
          category_preferences?: string[] | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interest_type?: string
          message?: string | null
        }
        Relationships: []
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
          max_budget: number | null
          min_budget: number | null
          notes: string | null
          phone: string | null
          rating: number | null
          response_rate: number | null
          service_regions: string[] | null
          status: Database["public"]["Enums"]["partner_status"]
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          total_bookings: number | null
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
          max_budget?: number | null
          min_budget?: number | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          response_rate?: number | null
          service_regions?: string[] | null
          status?: Database["public"]["Enums"]["partner_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          total_bookings?: number | null
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
          max_budget?: number | null
          min_budget?: number | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          response_rate?: number | null
          service_regions?: string[] | null
          status?: Database["public"]["Enums"]["partner_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      passkey_credentials: {
        Row: {
          backed_up: boolean | null
          counter: number
          created_at: string | null
          credential_id: string
          device_name: string | null
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string | null
          credential_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string | null
          credential_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          session_id: string | null
          user_id: string | null
          value_ms: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          session_id?: string | null
          user_id?: string | null
          value_ms: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          session_id?: string | null
          user_id?: string | null
          value_ms?: number
        }
        Relationships: []
      }
      pms_sync_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          integration_id: string
          request_payload: Json | null
          response_payload: Json | null
          rooms_synced: number | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          integration_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          rooms_synced?: number | null
          status: string
          sync_type: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          integration_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          rooms_synced?: number | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pms_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "partner_pms_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number | null
          company_id: string | null
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          shares_count: number | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          company_id?: string | null
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          shares_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          company_id?: string | null
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          shares_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      potential_partners: {
        Row: {
          category: string
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          discovered_at: string | null
          id: string
          last_verified_at: string | null
          metadata: Json | null
          score: number | null
          source: string | null
          status: string | null
          subcategory: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          category: string
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json | null
          score?: number | null
          source?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          category?: string
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          id?: string
          last_verified_at?: string | null
          metadata?: Json | null
          score?: number | null
          source?: string | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      potential_users: {
        Row: {
          company: string | null
          created_at: string | null
          discovered_at: string | null
          email: string | null
          estimated_net_worth: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          linkedin_url: string | null
          metadata: Json | null
          phone: string | null
          score: number | null
          source: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          discovered_at?: string | null
          email?: string | null
          estimated_net_worth?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          metadata?: Json | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          discovered_at?: string | null
          email?: string | null
          estimated_net_worth?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          linkedin_url?: string | null
          metadata?: Json | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preference_signals: {
        Row: {
          category: string
          created_at: string | null
          id: string
          processed: boolean | null
          sentiment_score: number | null
          signal_data: Json
          signal_type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          processed?: boolean | null
          sentiment_score?: number | null
          signal_data: Json
          signal_type: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          processed?: boolean | null
          sentiment_score?: number | null
          signal_data?: Json
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_values: Json | null
          previous_values: Json | null
          pricing_rule_id: string | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          pricing_rule_id?: string | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          pricing_rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_history_pricing_rule_id_fkey"
            columns: ["pricing_rule_id"]
            isOneToOne: false
            referencedRelation: "pricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_credits: number
          budget_multipliers: Json | null
          category: string
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          partner_price_tiers: Json | null
          priority_multipliers: Json | null
          time_multipliers: Json | null
          updated_at: string
        }
        Insert: {
          base_credits?: number
          budget_multipliers?: Json | null
          category: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          partner_price_tiers?: Json | null
          priority_multipliers?: Json | null
          time_multipliers?: Json | null
          updated_at?: string
        }
        Update: {
          base_credits?: number
          budget_multipliers?: Json | null
          category?: string
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          partner_price_tiers?: Json | null
          priority_multipliers?: Json | null
          time_multipliers?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      prismatic_api_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          integration_id: string | null
          ip_address: string | null
          method: string
          request_payload: Json | null
          response_status: number
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: string | null
          method: string
          request_payload?: Json | null
          response_status: number
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: string | null
          method?: string
          request_payload?: Json | null
          response_status?: number
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prismatic_api_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "prismatic_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      prismatic_integrations: {
        Row: {
          api_key_hash: string
          created_at: string
          id: string
          integration_id: string
          is_active: boolean
          last_used_at: string | null
          metadata: Json | null
          name: string
          rate_limit_per_minute: number
          scopes: string[]
          updated_at: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          id?: string
          integration_id: string
          is_active?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          rate_limit_per_minute?: number
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          id?: string
          integration_id?: string
          is_active?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          rate_limit_per_minute?: number
          scopes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      proactive_notification_queue: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          sent_at: string | null
          status: string | null
          title: string
          trigger_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          trigger_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          trigger_at?: string
          user_id?: string
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
      publication_health_logs: {
        Row: {
          checks: Json
          created_at: string
          domain: string
          id: string
          overall_status: string
          recommendations: Json | null
          triggered_by: string | null
        }
        Insert: {
          checks?: Json
          created_at?: string
          domain: string
          id?: string
          overall_status: string
          recommendations?: Json | null
          triggered_by?: string | null
        }
        Update: {
          checks?: Json
          created_at?: string
          domain?: string
          id?: string
          overall_status?: string
          recommendations?: Json | null
          triggered_by?: string | null
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
      referral_shares: {
        Row: {
          channel: string
          created_at: string
          id: string
          page_path: string | null
          referral_code: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          page_path?: string | null
          referral_code?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          page_path?: string | null
          referral_code?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_mcp_tasks: {
        Row: {
          config: Json | null
          created_at: string
          cron_expression: string
          id: string
          is_active: boolean | null
          last_result: Json | null
          last_run_at: string | null
          next_run_at: string | null
          task_name: string
          task_type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          cron_expression: string
          id?: string
          is_active?: boolean | null
          last_result?: Json | null
          last_run_at?: string | null
          next_run_at?: string | null
          task_name: string
          task_type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          cron_expression?: string
          id?: string
          is_active?: boolean | null
          last_result?: Json | null
          last_run_at?: string | null
          next_run_at?: string | null
          task_name?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_scrape_jobs: {
        Row: {
          created_at: string
          extraction_schema: Json | null
          extraction_type: string | null
          id: string
          is_active: boolean | null
          last_result: Json | null
          last_run_at: string | null
          next_run_at: string
          run_count: number | null
          schedule_type: string
          updated_at: string
          url: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          extraction_schema?: Json | null
          extraction_type?: string | null
          id?: string
          is_active?: boolean | null
          last_result?: Json | null
          last_run_at?: string | null
          next_run_at: string
          run_count?: number | null
          schedule_type: string
          updated_at?: string
          url: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          extraction_schema?: Json | null
          extraction_type?: string | null
          id?: string
          is_active?: boolean | null
          last_result?: Json | null
          last_run_at?: string | null
          next_run_at?: string
          run_count?: number | null
          schedule_type?: string
          updated_at?: string
          url?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      scrape_results: {
        Row: {
          created_at: string
          extracted_data: Json | null
          extraction_type: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          raw_data: Json | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_data?: Json | null
          extraction_type?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          raw_data?: Json | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_data?: Json | null
          extraction_type?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          raw_data?: Json | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scheduled_scrape_jobs"
            referencedColumns: ["id"]
          },
        ]
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
      security_audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          severity: string
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          severity?: string
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          severity?: string
          user_agent?: string | null
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
      service_bookings: {
        Row: {
          accessibility_needs: string | null
          base_price: number | null
          booking_details: Json | null
          booking_status: string | null
          category: string
          client_id: string
          confirmation_number: string | null
          created_at: string
          currency: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          dietary_requirements: string[] | null
          duration_hours: number | null
          end_datetime: string | null
          extras_price: number | null
          guest_details: Json | null
          guests: number | null
          id: string
          inventory_id: string | null
          location: string | null
          partner_id: string
          partner_response: Json | null
          service_request_id: string | null
          special_requests: string | null
          start_datetime: string
          title: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          accessibility_needs?: string | null
          base_price?: number | null
          booking_details?: Json | null
          booking_status?: string | null
          category: string
          client_id: string
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          dietary_requirements?: string[] | null
          duration_hours?: number | null
          end_datetime?: string | null
          extras_price?: number | null
          guest_details?: Json | null
          guests?: number | null
          id?: string
          inventory_id?: string | null
          location?: string | null
          partner_id: string
          partner_response?: Json | null
          service_request_id?: string | null
          special_requests?: string | null
          start_datetime: string
          title: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          accessibility_needs?: string | null
          base_price?: number | null
          booking_details?: Json | null
          booking_status?: string | null
          category?: string
          client_id?: string
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          dietary_requirements?: string[] | null
          duration_hours?: number | null
          end_datetime?: string | null
          extras_price?: number | null
          guest_details?: Json | null
          guests?: number | null
          id?: string
          inventory_id?: string | null
          location?: string | null
          partner_id?: string
          partner_response?: Json | null
          service_request_id?: string | null
          special_requests?: string | null
          start_datetime?: string
          title?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "service_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_inventory: {
        Row: {
          amenities: string[] | null
          availability_status: string | null
          available_from: string | null
          available_to: string | null
          base_price: number | null
          cancellation_policy: string | null
          category: string
          commission_rate: number | null
          created_at: string
          currency: string | null
          deposit_required: number | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_always_available: boolean | null
          last_synced_at: string | null
          lead_time_hours: number | null
          location: string | null
          max_duration_hours: number | null
          max_guests: number | null
          metadata: Json | null
          min_duration_hours: number | null
          min_guests: number | null
          min_spend: number | null
          partner_id: string
          partner_service_id: string | null
          price_unit: string | null
          priority_rank: number | null
          special_conditions: string | null
          special_offers: string | null
          specifications: Json | null
          subcategory: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          availability_status?: string | null
          available_from?: string | null
          available_to?: string | null
          base_price?: number | null
          cancellation_policy?: string | null
          category: string
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          deposit_required?: number | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_always_available?: boolean | null
          last_synced_at?: string | null
          lead_time_hours?: number | null
          location?: string | null
          max_duration_hours?: number | null
          max_guests?: number | null
          metadata?: Json | null
          min_duration_hours?: number | null
          min_guests?: number | null
          min_spend?: number | null
          partner_id: string
          partner_service_id?: string | null
          price_unit?: string | null
          priority_rank?: number | null
          special_conditions?: string | null
          special_offers?: string | null
          specifications?: Json | null
          subcategory?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          availability_status?: string | null
          available_from?: string | null
          available_to?: string | null
          base_price?: number | null
          cancellation_policy?: string | null
          category?: string
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          deposit_required?: number | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_always_available?: boolean | null
          last_synced_at?: string | null
          lead_time_hours?: number | null
          location?: string | null
          max_duration_hours?: number | null
          max_guests?: number | null
          metadata?: Json | null
          min_duration_hours?: number | null
          min_guests?: number | null
          min_spend?: number | null
          partner_id?: string
          partner_service_id?: string | null
          price_unit?: string | null
          priority_rank?: number | null
          special_conditions?: string | null
          special_offers?: string | null
          specifications?: Json | null
          subcategory?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_inventory_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_inventory_partner_service_id_fkey"
            columns: ["partner_service_id"]
            isOneToOne: false
            referencedRelation: "partner_services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_bids: {
        Row: {
          attachments: string[] | null
          bid_amount: number
          bid_message: string
          created_at: string
          currency: string | null
          estimated_duration: string | null
          id: string
          is_recommended: boolean | null
          partner_id: string
          proposed_timeline: string | null
          response_notes: string | null
          revision_count: number
          service_request_id: string
          status: Database["public"]["Enums"]["bid_status"] | null
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          bid_amount: number
          bid_message: string
          created_at?: string
          currency?: string | null
          estimated_duration?: string | null
          id?: string
          is_recommended?: boolean | null
          partner_id: string
          proposed_timeline?: string | null
          response_notes?: string | null
          revision_count?: number
          service_request_id: string
          status?: Database["public"]["Enums"]["bid_status"] | null
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          bid_amount?: number
          bid_message?: string
          created_at?: string
          currency?: string | null
          estimated_duration?: string | null
          id?: string
          is_recommended?: boolean | null
          partner_id?: string
          proposed_timeline?: string | null
          response_notes?: string | null
          revision_count?: number
          service_request_id?: string
          status?: Database["public"]["Enums"]["bid_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_bids_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_request_bids_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
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
          allow_revisions: boolean
          auto_recommend_partners: boolean | null
          bidding_deadline: string | null
          bidding_enabled: boolean | null
          blind_bidding: boolean | null
          budget_max: number | null
          budget_min: number | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at: string
          description: string
          id: string
          internal_notes: string | null
          max_bids_allowed: number | null
          max_revisions: number
          min_bids_required: number | null
          partner_id: string | null
          partner_response: string | null
          preferred_date: string | null
          requirements: Json | null
          selected_bid_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          tracking_link: string | null
          tracking_link_added_at: string | null
          tracking_link_expires_at: string | null
          tracking_link_label: string | null
          updated_at: string
          winning_bid_id: string | null
        }
        Insert: {
          allow_revisions?: boolean
          auto_recommend_partners?: boolean | null
          bidding_deadline?: string | null
          bidding_enabled?: boolean | null
          blind_bidding?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at?: string
          description: string
          id?: string
          internal_notes?: string | null
          max_bids_allowed?: number | null
          max_revisions?: number
          min_bids_required?: number | null
          partner_id?: string | null
          partner_response?: string | null
          preferred_date?: string | null
          requirements?: Json | null
          selected_bid_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          tracking_link?: string | null
          tracking_link_added_at?: string | null
          tracking_link_expires_at?: string | null
          tracking_link_label?: string | null
          updated_at?: string
          winning_bid_id?: string | null
        }
        Update: {
          allow_revisions?: boolean
          auto_recommend_partners?: boolean | null
          bidding_deadline?: string | null
          bidding_enabled?: boolean | null
          blind_bidding?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["service_category"]
          client_id?: string
          created_at?: string
          description?: string
          id?: string
          internal_notes?: string | null
          max_bids_allowed?: number | null
          max_revisions?: number
          min_bids_required?: number | null
          partner_id?: string | null
          partner_response?: string | null
          preferred_date?: string | null
          requirements?: Json | null
          selected_bid_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          tracking_link?: string | null
          tracking_link_added_at?: string | null
          tracking_link_expires_at?: string | null
          tracking_link_label?: string | null
          updated_at?: string
          winning_bid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_winning_bid"
            columns: ["winning_bid_id"]
            isOneToOne: false
            referencedRelation: "service_request_bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_selected_bid_id_fkey"
            columns: ["selected_bid_id"]
            isOneToOne: false
            referencedRelation: "house_partner_bids"
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
      site_generation_credits: {
        Row: {
          created_at: string
          credit_type: string
          id: string
          site_id: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_type: string
          id?: string
          site_id?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          credit_type?: string
          id?: string
          site_id?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_generation_credits_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "member_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_templates: {
        Row: {
          category: string
          created_at: string
          default_blocks: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          min_tier: string
          name: string
          preview_image: string | null
        }
        Insert: {
          category: string
          created_at?: string
          default_blocks?: Json | null
          description?: string | null
          id: string
          is_active?: boolean | null
          min_tier?: string
          name: string
          preview_image?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          default_blocks?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_tier?: string
          name?: string
          preview_image?: string | null
        }
        Relationships: []
      }
      sms_conversations: {
        Row: {
          channel: string
          created_at: string
          direction: string
          id: string
          in_reply_to: string | null
          message: string
          metadata: Json | null
          phone_number: string
          twilio_message_sid: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          direction: string
          id?: string
          in_reply_to?: string | null
          message: string
          metadata?: Json | null
          phone_number: string
          twilio_message_sid?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          in_reply_to?: string | null
          message?: string
          metadata?: Json | null
          phone_number?: string
          twilio_message_sid?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_conversations_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "sms_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token_encrypted: string | null
          account_id: string | null
          account_name: string
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url: string | null
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id?: string | null
          account_name: string
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string | null
          account_name?: string
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_ad_accounts: {
        Row: {
          access_token_encrypted: string | null
          account_id: string
          account_name: string | null
          account_status: string | null
          created_at: string
          id: string
          metadata: Json | null
          permissions: Json | null
          platform: string
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id: string
          account_name?: string | null
          account_status?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          permissions?: Json | null
          platform: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string
          account_name?: string | null
          account_status?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          permissions?: Json | null
          platform?: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      social_ad_budgets: {
        Row: {
          alert_threshold: number | null
          budget_amount: number
          campaign_id: string | null
          created_at: string
          currency: string
          daily_limit: number | null
          end_date: string | null
          id: string
          platform: string
          spent_amount: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          alert_threshold?: number | null
          budget_amount?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          daily_limit?: number | null
          end_date?: string | null
          id?: string
          platform: string
          spent_amount?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          alert_threshold?: number | null
          budget_amount?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          daily_limit?: number | null
          end_date?: string | null
          id?: string
          platform?: string
          spent_amount?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_ad_budgets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "social_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      social_ad_metrics: {
        Row: {
          budget_id: string | null
          clicks: number | null
          conversions: number | null
          cpa: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          platform: string
          revenue: number | null
          roas: number | null
          spend: number | null
        }
        Insert: {
          budget_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          platform: string
          revenue?: number | null
          roas?: number | null
          spend?: number | null
        }
        Update: {
          budget_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpa?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          platform?: string
          revenue?: number | null
          roas?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_ad_metrics_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "social_ad_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_ad_transactions: {
        Row: {
          amount: number
          budget_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          platform_transaction_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          budget_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          platform_transaction_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          platform_transaction_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_ad_transactions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "social_ad_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_advertising_posts: {
        Row: {
          account_id: string | null
          campaign_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          engagement_metrics: Json | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_post_id: string | null
          platform_url: string | null
          published_at: string | null
          retry_count: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["social_post_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          campaign_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          engagement_metrics?: Json | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_post_id?: string | null
          platform_url?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          campaign_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          engagement_metrics?: Json | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: Database["public"]["Enums"]["social_platform"]
          platform_post_id?: string | null
          platform_url?: string | null
          published_at?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["social_post_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_advertising_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_advertising_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "social_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      social_campaigns: {
        Row: {
          budget_cents: number | null
          campaign_type: string | null
          content_templates: Json | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["social_campaign_status"] | null
          target_audience: Json | null
          target_platforms:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at: string | null
        }
        Insert: {
          budget_cents?: number | null
          campaign_type?: string | null
          content_templates?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["social_campaign_status"] | null
          target_audience?: Json | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at?: string | null
        }
        Update: {
          budget_cents?: number | null
          campaign_type?: string | null
          content_templates?: Json | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["social_campaign_status"] | null
          target_audience?: Json | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_content_library: {
        Row: {
          category: string | null
          content_template: string
          created_at: string | null
          created_by: string | null
          hashtag_sets: string[] | null
          id: string
          media_urls: string[] | null
          performance_score: number | null
          platform: Database["public"]["Enums"]["social_platform"] | null
          target_audience: string[] | null
          times_used: number | null
          title: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content_template: string
          created_at?: string | null
          created_by?: string | null
          hashtag_sets?: string[] | null
          id?: string
          media_urls?: string[] | null
          performance_score?: number | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          target_audience?: string[] | null
          times_used?: number | null
          title: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content_template?: string
          created_at?: string | null
          created_by?: string | null
          hashtag_sets?: string[] | null
          id?: string
          media_urls?: string[] | null
          performance_score?: number | null
          platform?: Database["public"]["Enums"]["social_platform"] | null
          target_audience?: string[] | null
          times_used?: number | null
          title?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_post_analytics: {
        Row: {
          clicks: number | null
          comments: number | null
          demographics: Json | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          metadata: Json | null
          post_id: string
          reach: number | null
          recorded_at: string | null
          shares: number | null
        }
        Insert: {
          clicks?: number | null
          comments?: number | null
          demographics?: Json | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metadata?: Json | null
          post_id: string
          reach?: number | null
          recorded_at?: string | null
          shares?: number | null
        }
        Update: {
          clicks?: number | null
          comments?: number | null
          demographics?: Json | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          metadata?: Json | null
          post_id?: string
          reach?: number | null
          recorded_at?: string | null
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_advertising_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          campaign: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          platforms: string[]
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          platforms?: string[]
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          platforms?: string[]
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      surprise_me_requests: {
        Row: {
          created_at: string
          credits_spent: number
          estimated_value_max: number | null
          estimated_value_min: number | null
          experience_description: string | null
          experience_title: string | null
          fulfilled_at: string | null
          id: string
          metadata: Json | null
          package_id: string
          package_name: string
          partner_id: string | null
          revealed_at: string | null
          status: string
          updated_at: string
          user_feedback: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          created_at?: string
          credits_spent: number
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          experience_description?: string | null
          experience_title?: string | null
          fulfilled_at?: string | null
          id?: string
          metadata?: Json | null
          package_id: string
          package_name: string
          partner_id?: string | null
          revealed_at?: string | null
          status?: string
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          created_at?: string
          credits_spent?: number
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          experience_description?: string | null
          experience_title?: string | null
          fulfilled_at?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string
          package_name?: string
          partner_id?: string | null
          revealed_at?: string | null
          status?: string
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "surprise_me_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          member_since: string | null
          quote: string
          status: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          member_since?: string | null
          quote: string
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          member_since?: string | null
          quote?: string
          status?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
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
      uptime_checks: {
        Row: {
          checked_at: string
          created_at: string
          endpoint_name: string
          endpoint_url: string
          error_message: string | null
          id: string
          response_time_ms: number | null
          status: string
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          created_at?: string
          endpoint_name: string
          endpoint_url: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          created_at?: string
          endpoint_name?: string
          endpoint_url?: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
          status_code?: number | null
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
      user_connections: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
          status?: string | null
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
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
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
      user_surprise_preferences: {
        Row: {
          accessibility_needs: string | null
          budget_comfort_level: string | null
          created_at: string
          dietary_restrictions: string[] | null
          excluded_categories: string[] | null
          id: string
          notes: string | null
          preferred_categories: string[] | null
          preferred_days: string[] | null
          surprise_frequency: string | null
          travel_radius_km: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_needs?: string | null
          budget_comfort_level?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          excluded_categories?: string[] | null
          id?: string
          notes?: string | null
          preferred_categories?: string[] | null
          preferred_days?: string[] | null
          surprise_frequency?: string | null
          travel_radius_km?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_needs?: string | null
          budget_comfort_level?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          excluded_categories?: string[] | null
          id?: string
          notes?: string | null
          preferred_categories?: string[] | null
          preferred_days?: string[] | null
          surprise_frequency?: string | null
          travel_radius_km?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_alerts: {
        Row: {
          alert_type: string
          created_at: string
          email: string | null
          id: string
          lead_score_id: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number
          session_id: string
          signals: Json | null
          status: string
          tier: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          email?: string | null
          id?: string
          lead_score_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score: number
          session_id: string
          signals?: Json | null
          status?: string
          tier: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          email?: string | null
          id?: string
          lead_score_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          session_id?: string
          signals?: Json | null
          status?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_alerts_lead_score_id_fkey"
            columns: ["lead_score_id"]
            isOneToOne: false
            referencedRelation: "lead_scores"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_logs: {
        Row: {
          id: string
          ip_address: string | null
          path: string
          referrer: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          visit_date: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          path: string
          referrer?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          visit_date?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          path?: string
          referrer?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          visit_date?: string
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
      webhook_endpoints: {
        Row: {
          created_at: string
          endpoint_type: string
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          endpoint_type: string
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          endpoint_type?: string
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          updated_at?: string
          url?: string
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
      funnel_summary_admin: {
        Row: {
          campaign: string | null
          count: number | null
          medium: string | null
          source: string | null
          stage: string | null
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
      partner_message_delivery_stats: {
        Row: {
          avg_delivery_seconds: number | null
          date: string | null
          delivered_count: number | null
          delivery_method: string | null
          delivery_status: string | null
          message_count: number | null
          opened_count: number | null
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
      admin_get_all_profiles: {
        Args: never
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      anonymize_ip: { Args: { ip: string }; Returns: string }
      check_budget_alert: { Args: { p_budget_id: string }; Returns: Json }
      check_ip_rate_limit: {
        Args: {
          p_ip_address: string
          p_lockout_minutes?: number
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: {
          attempts_in_window: number
          cooldown_seconds: number
          is_limited: boolean
          lockout_until: string
        }[]
      }
      check_launch_signup_rate_limit: {
        Args: { p_email: string; p_phone: string }
        Returns: boolean
      }
      check_prismatic_rate_limit: {
        Args: { p_integration_id: string; p_limit?: number }
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
      cleanup_old_behavior_events: { Args: never; Returns: number }
      cleanup_old_funnel_events: { Args: never; Returns: number }
      cleanup_old_visitor_logs: { Args: never; Returns: number }
      get_expiring_certificates: {
        Args: { days_threshold?: number }
        Returns: {
          auto_renew: boolean | null
          certificate_type: string | null
          created_at: string
          domain: string | null
          expires_at: string
          fingerprint_sha256: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          last_checked_at: string | null
          metadata: Json | null
          name: string
          renewal_reminder_days: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "certificates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_funnel_summary: {
        Args: never
        Returns: {
          campaign: string
          count: number
          medium: string
          source: string
          stage: string
        }[]
      }
      get_keys_due_for_rotation: {
        Args: never
        Returns: {
          algorithm: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_identifier: string
          key_version: number
          metadata: Json | null
          next_rotation_at: string | null
          rotated_at: string | null
          rotation_interval_days: number | null
          status: Database["public"]["Enums"]["encryption_key_status"]
        }[]
        SetofOptions: {
          from: "*"
          to: "encryption_keys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_active_trial: { Args: { p_user_id: string }; Returns: boolean }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      record_ip_login_attempt: {
        Args: {
          p_attempt_type: string
          p_email: string
          p_ip_address: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      run_data_retention_cleanup: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "partner" | "member"
      bid_status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired"
      certificate_status: "active" | "pending" | "expired" | "revoked"
      connection_status: "pending" | "accepted" | "declined" | "blocked"
      encryption_key_status: "active" | "rotating" | "retired" | "compromised"
      household_member_status: "active" | "pending" | "suspended"
      household_role: "owner" | "admin" | "member" | "dependent"
      household_type: "family" | "enterprise"
      opportunity_status: "open" | "filled" | "closed" | "cancelled"
      opportunity_type:
        | "co_investment"
        | "experience"
        | "deal_flow"
        | "introduction"
      partner_status: "pending" | "approved" | "suspended" | "rejected"
      partnership_status: "active" | "pending" | "negotiating" | "declined"
      recommendation_status: "pending" | "viewed" | "bid_submitted" | "declined"
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
      site_status: "draft" | "published" | "archived"
      social_campaign_status:
        | "draft"
        | "active"
        | "paused"
        | "completed"
        | "archived"
      social_platform:
        | "twitter"
        | "linkedin"
        | "instagram"
        | "facebook"
        | "reddit"
        | "threads"
      social_post_status:
        | "draft"
        | "scheduled"
        | "publishing"
        | "published"
        | "failed"
        | "cancelled"
      strategy_status: "active" | "planned" | "paused"
      strategy_type: "free" | "paid"
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
      bid_status: ["pending", "accepted", "rejected", "withdrawn", "expired"],
      certificate_status: ["active", "pending", "expired", "revoked"],
      connection_status: ["pending", "accepted", "declined", "blocked"],
      encryption_key_status: ["active", "rotating", "retired", "compromised"],
      household_member_status: ["active", "pending", "suspended"],
      household_role: ["owner", "admin", "member", "dependent"],
      household_type: ["family", "enterprise"],
      opportunity_status: ["open", "filled", "closed", "cancelled"],
      opportunity_type: [
        "co_investment",
        "experience",
        "deal_flow",
        "introduction",
      ],
      partner_status: ["pending", "approved", "suspended", "rejected"],
      partnership_status: ["active", "pending", "negotiating", "declined"],
      recommendation_status: ["pending", "viewed", "bid_submitted", "declined"],
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
      site_status: ["draft", "published", "archived"],
      social_campaign_status: [
        "draft",
        "active",
        "paused",
        "completed",
        "archived",
      ],
      social_platform: [
        "twitter",
        "linkedin",
        "instagram",
        "facebook",
        "reddit",
        "threads",
      ],
      social_post_status: [
        "draft",
        "scheduled",
        "publishing",
        "published",
        "failed",
        "cancelled",
      ],
      strategy_status: ["active", "planned", "paused"],
      strategy_type: ["free", "paid"],
    },
  },
} as const
