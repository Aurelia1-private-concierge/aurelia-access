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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      ],
    },
  },
} as const
