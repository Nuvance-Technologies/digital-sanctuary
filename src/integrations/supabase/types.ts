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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          amount_total: number | null
          cause: Database["public"]["Enums"]["donation_cause"]
          created_at: string
          currency: string
          dedication: string | null
          donor_email: string
          donor_name: string
          id: string
          paid_at: string | null
          reference_id: string
          status: Database["public"]["Enums"]["donation_status"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          amount_total?: number | null
          cause?: Database["public"]["Enums"]["donation_cause"]
          created_at?: string
          currency?: string
          dedication?: string | null
          donor_email: string
          donor_name: string
          id?: string
          paid_at?: string | null
          reference_id?: string
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          amount_total?: number | null
          cause?: Database["public"]["Enums"]["donation_cause"]
          created_at?: string
          currency?: string
          dedication?: string | null
          donor_email?: string
          donor_name?: string
          id?: string
          paid_at?: string | null
          reference_id?: string
          status?: Database["public"]["Enums"]["donation_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description_en: string | null
          description_hi: string | null
          event_date: string
          event_time: string | null
          featured: boolean
          id: string
          published: boolean
          title_en: string
          title_hi: string | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          event_date: string
          event_time?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          title_en: string
          title_hi?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          event_date?: string
          event_time?: string | null
          featured?: boolean
          id?: string
          published?: boolean
          title_en?: string
          title_hi?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: Database["public"]["Enums"]["gallery_category"]
          created_at: string
          description_en: string | null
          description_hi: string | null
          id: string
          media_url: string
          published: boolean
          sort_order: number
          thumbnail_url: string | null
          title_en: string
          title_hi: string | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          media_url: string
          published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title_en: string
          title_hi?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          media_url?: string
          published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title_en?: string
          title_hi?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          device_id: string | null
          email: string
          event_id: string
          guests: number
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          email: string
          event_id: string
          guests?: number
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          email?: string
          event_id?: string
          guests?: number
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "user"
      donation_cause: "annakshetra" | "maintenance" | "goshala" | "general"
      donation_status: "pending" | "paid" | "failed"
      event_type: "utsav" | "purnima" | "amavasya" | "ekadashi" | "other"
      gallery_category: "utsavs" | "darshan" | "meera_mai"
      media_type: "image" | "video"
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
      app_role: ["admin", "user"],
      donation_cause: ["annakshetra", "maintenance", "goshala", "general"],
      donation_status: ["pending", "paid", "failed"],
      event_type: ["utsav", "purnima", "amavasya", "ekadashi", "other"],
      gallery_category: ["utsavs", "darshan", "meera_mai"],
      media_type: ["image", "video"],
    },
  },
} as const
