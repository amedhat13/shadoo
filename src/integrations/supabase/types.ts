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
      agent_payouts: {
        Row: {
          agent_id: string | null
          amount: number
          id: string
          method: string
          payment_details: Json | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string | null
          status: string | null
          transaction_reference: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          id?: string
          method: string
          payment_details?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          id?: string
          method?: string
          payment_details?: Json | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_payouts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tiers: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          min_completed_visits: number | null
          min_rating: number | null
          min_subscription_plan: string | null
          name: string
          sort_order: number | null
          tier_code: string
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          min_completed_visits?: number | null
          min_rating?: number | null
          min_subscription_plan?: string | null
          name: string
          sort_order?: number | null
          tier_code: string
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          min_completed_visits?: number | null
          min_rating?: number | null
          min_subscription_plan?: string | null
          name?: string
          sort_order?: number | null
          tier_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_tiers_min_subscription_plan_fkey"
            columns: ["min_subscription_plan"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          available_balance: number | null
          bank_details: Json | null
          completed_visits: number | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          mobile_wallet: string | null
          national_id: string | null
          phone: string
          questionnaire_answers: Json | null
          rating_avg: number | null
          status: string | null
          tier: string | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          verification_docs: Json | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          available_balance?: number | null
          bank_details?: Json | null
          completed_visits?: number | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          mobile_wallet?: string | null
          national_id?: string | null
          phone: string
          questionnaire_answers?: Json | null
          rating_avg?: number | null
          status?: string | null
          tier?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          verification_docs?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          available_balance?: number | null
          bank_details?: Json | null
          completed_visits?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          mobile_wallet?: string | null
          national_id?: string | null
          phone?: string
          questionnaire_answers?: Json | null
          rating_avg?: number | null
          status?: string | null
          tier?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          verification_docs?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          actor_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string
          district: string | null
          google_maps_link: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          district?: string | null
          google_maps_link: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          district?: string | null
          google_maps_link?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          agent_tier: string
          branch_id: string | null
          budget_used: number
          created_at: string
          id: string
          is_geo_tagged: boolean
          name: string
          number_of_visits: number
          photo_requirements: Json
          published_at: string | null
          purchase_budget_per_visit: number
          purchase_item_name: string | null
          questions: Json
          status: string
          total_purchase_budget: number
          updated_at: string
          user_id: string
          visit_schedules: Json | null
          visits_completed: number
          visits_pending: number
        }
        Insert: {
          agent_tier?: string
          branch_id?: string | null
          budget_used?: number
          created_at?: string
          id?: string
          is_geo_tagged?: boolean
          name: string
          number_of_visits?: number
          photo_requirements?: Json
          published_at?: string | null
          purchase_budget_per_visit?: number
          purchase_item_name?: string | null
          questions?: Json
          status?: string
          total_purchase_budget?: number
          updated_at?: string
          user_id: string
          visit_schedules?: Json | null
          visits_completed?: number
          visits_pending?: number
        }
        Update: {
          agent_tier?: string
          branch_id?: string | null
          budget_used?: number
          created_at?: string
          id?: string
          is_geo_tagged?: boolean
          name?: string
          number_of_visits?: number
          photo_requirements?: Json
          published_at?: string | null
          purchase_budget_per_visit?: number
          purchase_item_name?: string | null
          questions?: Json
          status?: string
          total_purchase_budget?: number
          updated_at?: string
          user_id?: string
          visit_schedules?: Json | null
          visits_completed?: number
          visits_pending?: number
        }
        Relationships: [
          {
            foreignKeyName: "missions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          logo_url: string | null
          must_change_password: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          questions: Json
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          questions?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          questions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          visits_per_month: number
        }
        Insert: {
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          visits_per_month: number
        }
        Update: {
          billing_period?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          visits_per_month?: number
        }
        Relationships: []
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
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          payment_reference: string | null
          plan_id: string
          status: string
          trial_visits_allowed: number | null
          updated_at: string
          user_id: string
          visits_used_this_month: number
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          payment_reference?: string | null
          plan_id: string
          status?: string
          trial_visits_allowed?: number | null
          updated_at?: string
          user_id: string
          visits_used_this_month?: number
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          payment_reference?: string | null
          plan_id?: string
          status?: string
          trial_visits_allowed?: number | null
          updated_at?: string
          user_id?: string
          visits_used_this_month?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          agent_id: string | null
          answers: Json | null
          created_at: string | null
          id: string
          mission_id: string | null
          photos: string[] | null
          purchase_amount: number | null
          receipt_photo: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          started_at: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          agent_id?: string | null
          answers?: Json | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          photos?: string[] | null
          purchase_amount?: number | null
          receipt_photo?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          agent_id?: string | null
          answers?: Json | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          photos?: string[] | null
          purchase_amount?: number | null
          receipt_photo?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "support"
        | "finance"
        | "operations"
        | "client_admin"
        | "client_manager"
        | "client_viewer"
        | "agent"
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
      app_role: [
        "super_admin",
        "admin",
        "support",
        "finance",
        "operations",
        "client_admin",
        "client_manager",
        "client_viewer",
        "agent",
      ],
    },
  },
} as const
