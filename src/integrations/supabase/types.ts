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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      kit_quotes: {
        Row: {
          club_name: string
          created_at: string
          crest_path: string | null
          delivery_address: string
          delivery_date: string | null
          id: string
          notes: string
          primary_color: string
          quantity: number
          quote_minor: number | null
          quote_note: string
          roster: Json
          secondary_color: string
          sport: string
          status: string
          user_id: string
        }
        Insert: {
          club_name: string
          created_at?: string
          crest_path?: string | null
          delivery_address?: string
          delivery_date?: string | null
          id?: string
          notes?: string
          primary_color?: string
          quantity: number
          quote_minor?: number | null
          quote_note?: string
          roster?: Json
          secondary_color?: string
          sport?: string
          status?: string
          user_id?: string
        }
        Update: {
          club_name?: string
          created_at?: string
          crest_path?: string | null
          delivery_address?: string
          delivery_date?: string | null
          id?: string
          notes?: string
          primary_color?: string
          quantity?: number
          quote_minor?: number | null
          quote_note?: string
          roster?: Json
          secondary_color?: string
          sport?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          attachments: Json
          company_name: string
          consent_to_processing: boolean
          contact_email: string
          contact_name: string
          contact_phone: string
          content_draft: string
          country: string
          created_at: string
          currency: string
          disclosure_acknowledged: boolean
          distribution_regions: Json
          id: string
          industry: string
          paid_at: string | null
          payment_reference: string | null
          published_urls: Json
          quote_minor: number | null
          reference_number: string
          selected_outlets: Json
          status: string
          target_audience: string
          target_date: string | null
          timeline: Json
          title: string
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          attachments?: Json
          company_name?: string
          consent_to_processing?: boolean
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          content_draft?: string
          country?: string
          created_at?: string
          currency?: string
          disclosure_acknowledged?: boolean
          distribution_regions?: Json
          id?: string
          industry?: string
          paid_at?: string | null
          payment_reference?: string | null
          published_urls?: Json
          quote_minor?: number | null
          reference_number?: string
          selected_outlets?: Json
          status?: string
          target_audience?: string
          target_date?: string | null
          timeline?: Json
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Update: {
          attachments?: Json
          company_name?: string
          consent_to_processing?: boolean
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          content_draft?: string
          country?: string
          created_at?: string
          currency?: string
          disclosure_acknowledged?: boolean
          distribution_regions?: Json
          id?: string
          industry?: string
          paid_at?: string | null
          payment_reference?: string | null
          published_urls?: Json
          quote_minor?: number | null
          reference_number?: string
          selected_outlets?: Json
          status?: string
          target_audience?: string
          target_date?: string | null
          timeline?: Json
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          country: string
          created_at: string
          display_name: string
          id: string
          industry: string
          job_title: string
          organization: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id: string
          industry?: string
          job_title?: string
          organization?: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id?: string
          industry?: string
          job_title?: string
          organization?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          address: Json
          currency: string
          discount_minor: number
          email: string
          id: string
          items: Json
          payment_reference: string | null
          placed_at: string
          reference: string
          shipping_minor: number
          status: string
          subtotal_minor: number
          total_minor: number
          user_id: string
        }
        Insert: {
          address?: Json
          currency?: string
          discount_minor?: number
          email: string
          id?: string
          items?: Json
          payment_reference?: string | null
          placed_at?: string
          reference: string
          shipping_minor?: number
          status?: string
          subtotal_minor?: number
          total_minor?: number
          user_id: string
        }
        Update: {
          address?: Json
          currency?: string
          discount_minor?: number
          email?: string
          id?: string
          items?: Json
          payment_reference?: string | null
          placed_at?: string
          reference?: string
          shipping_minor?: number
          status?: string
          subtotal_minor?: number
          total_minor?: number
          user_id?: string
        }
        Relationships: []
      }
      survey_answers: {
        Row: {
          answers: Json
          completed: boolean
          duration_seconds: number
          id: string
          respondent_country: string
          respondent_id: string
          respondent_segment: string
          submitted_at: string
          survey_id: string
        }
        Insert: {
          answers?: Json
          completed?: boolean
          duration_seconds?: number
          id?: string
          respondent_country?: string
          respondent_id: string
          respondent_segment?: string
          submitted_at?: string
          survey_id: string
        }
        Update: {
          answers?: Json
          completed?: boolean
          duration_seconds?: number
          id?: string
          respondent_country?: string
          respondent_id?: string
          respondent_segment?: string
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          audience: string
          category: string
          closing_date: string | null
          consent_notice: string
          created_at: string
          creator_id: string
          escrow_points: number
          hidden: boolean
          id: string
          is_anonymous: boolean
          is_branded: boolean
          moderation_note: string
          objective: string
          opening_date: string | null
          questions: Json
          response_limit: number
          reward_minor: number
          reward_points: number
          slug: string | null
          status: string
          tags: Json
          tier: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          category?: string
          closing_date?: string | null
          consent_notice?: string
          created_at?: string
          creator_id?: string
          escrow_points?: number
          hidden?: boolean
          id?: string
          is_anonymous?: boolean
          is_branded?: boolean
          moderation_note?: string
          objective?: string
          opening_date?: string | null
          questions?: Json
          response_limit?: number
          reward_minor?: number
          reward_points?: number
          slug?: string | null
          status?: string
          tags?: Json
          tier?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          category?: string
          closing_date?: string | null
          consent_notice?: string
          created_at?: string
          creator_id?: string
          escrow_points?: number
          hidden?: boolean
          id?: string
          is_anonymous?: boolean
          is_branded?: boolean
          moderation_note?: string
          objective?: string
          opening_date?: string | null
          questions?: Json
          response_limit?: number
          reward_minor?: number
          reward_points?: number
          slug?: string | null
          status?: string
          tags?: Json
          tier?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_accounts: {
        Row: {
          cash_minor: number
          currency: string
          locked_points: number
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_minor?: number
          currency?: string
          locked_points?: number
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_minor?: number
          currency?: string
          locked_points?: number
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          event_key: string
          id: string
          kind: string
          note: string
          points: number
          user_id: string
        }
        Insert: {
          amount_minor?: number
          created_at?: string
          currency?: string
          event_key: string
          id?: string
          kind: string
          note?: string
          points?: number
          user_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          event_key?: string
          id?: string
          kind?: string
          note?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_name: string
          account_number: string
          amount_minor: number
          bank_code: string
          currency: string
          id: string
          processed_at: string | null
          provider_reference: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          amount_minor: number
          bank_code: string
          currency?: string
          id?: string
          processed_at?: string | null
          provider_reference?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          amount_minor?: number
          bank_code?: string
          currency?: string
          id?: string
          processed_at?: string | null
          provider_reference?: string | null
          requested_at?: string
          status?: string
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
      app_role:
        | "registered_user"
        | "earner"
        | "survey_creator"
        | "premium_customer"
        | "corporate_account"
        | "contributor"
        | "administrator"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "registered_user",
        "earner",
        "survey_creator",
        "premium_customer",
        "corporate_account",
        "contributor",
        "administrator",
      ],
    },
  },
} as const
