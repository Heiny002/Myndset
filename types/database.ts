export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'basic' | 'premium';
          subscription_status: 'active' | 'canceled' | 'past_due' | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          meditations_generated: number;
          meditations_limit: number;
          remixes_this_month: number;
          remixes_limit: number;
          billing_cycle_start: string;
          billing_cycle_anchor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium';
          subscription_status?: 'active' | 'canceled' | 'past_due' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          meditations_generated?: number;
          meditations_limit?: number;
          remixes_this_month?: number;
          remixes_limit?: number;
          billing_cycle_start?: string;
          billing_cycle_anchor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium';
          subscription_status?: 'active' | 'canceled' | 'past_due' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          meditations_generated?: number;
          meditations_limit?: number;
          remixes_this_month?: number;
          remixes_limit?: number;
          billing_cycle_start?: string;
          billing_cycle_anchor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questionnaire_responses: {
        Row: {
          id: string;
          user_id: string;
          tier: 1 | 2 | 3;
          responses: Json;
          title: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: 1 | 2 | 3;
          responses: Json;
          title?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 1 | 2 | 3;
          responses?: Json;
          title?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'questionnaire_responses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      meditation_plans: {
        Row: {
          id: string;
          user_id: string;
          questionnaire_response_id: string;
          plan_data: Json;
          status: 'pending_approval' | 'approved' | 'rejected' | 'generating' | 'completed';
          admin_notes: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          questionnaire_response_id: string;
          plan_data: Json;
          status?: 'pending_approval' | 'approved' | 'rejected' | 'generating' | 'completed';
          admin_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          questionnaire_response_id?: string;
          plan_data?: Json;
          status?: 'pending_approval' | 'approved' | 'rejected' | 'generating' | 'completed';
          admin_notes?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meditation_plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meditation_plans_questionnaire_response_id_fkey';
            columns: ['questionnaire_response_id'];
            isOneToOne: false;
            referencedRelation: 'questionnaire_responses';
            referencedColumns: ['id'];
          },
        ];
      };
      meditations: {
        Row: {
          id: string;
          user_id: string;
          meditation_plan_id: string;
          title: string;
          description: string | null;
          script_text: string;
          audio_url: string | null;
          audio_duration_seconds: number | null;
          voice_id: string | null;
          session_length: 'ultra_quick' | 'quick' | 'standard' | 'deep';
          techniques: Json;
          generation_cost_cents: number | null;
          is_favorite: boolean;
          play_count: number;
          last_played_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meditation_plan_id: string;
          title: string;
          description?: string | null;
          script_text: string;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
          voice_id?: string | null;
          session_length?: 'ultra_quick' | 'quick' | 'standard' | 'deep';
          techniques?: Json;
          generation_cost_cents?: number | null;
          is_favorite?: boolean;
          play_count?: number;
          last_played_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meditation_plan_id?: string;
          title?: string;
          description?: string | null;
          script_text?: string;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
          voice_id?: string | null;
          session_length?: 'ultra_quick' | 'quick' | 'standard' | 'deep';
          techniques?: Json;
          generation_cost_cents?: number | null;
          is_favorite?: boolean;
          play_count?: number;
          last_played_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meditations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meditations_meditation_plan_id_fkey';
            columns: ['meditation_plan_id'];
            isOneToOne: false;
            referencedRelation: 'meditation_plans';
            referencedColumns: ['id'];
          },
        ];
      };
      meditation_remixes: {
        Row: {
          id: string;
          original_meditation_id: string;
          user_id: string;
          section_to_remix: string;
          remix_instructions: string | null;
          new_script_text: string;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          original_meditation_id: string;
          user_id: string;
          section_to_remix: string;
          remix_instructions?: string | null;
          new_script_text: string;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          original_meditation_id?: string;
          user_id?: string;
          section_to_remix?: string;
          remix_instructions?: string | null;
          new_script_text?: string;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meditation_remixes_original_meditation_id_fkey';
            columns: ['original_meditation_id'];
            isOneToOne: false;
            referencedRelation: 'meditations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meditation_remixes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          id: string;
          type: string;
          created: string;
          data: Json;
          processed_at: string | null;
          status: string;
          error_message: string | null;
          retry_count: number;
        };
        Insert: {
          id: string;
          type: string;
          created: string;
          data: Json;
          processed_at?: string | null;
          status?: string;
          error_message?: string | null;
          retry_count?: number;
        };
        Update: {
          id?: string;
          type?: string;
          created?: string;
          data?: Json;
          processed_at?: string | null;
          status?: string;
          error_message?: string | null;
          retry_count?: number;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'super_admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'super_admin';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_users_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      meditation_versions: {
        Row: {
          id: string;
          meditation_id: string;
          version_number: number;
          script_text: string;
          script_style: string | null;
          audio_url: string | null;
          audio_duration_seconds: number | null;
          voice_id: string | null;
          voice_type: string | null;
          techniques: Json;
          generation_cost_cents: number | null;
          is_live: boolean;
          replaced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meditation_id: string;
          version_number: number;
          script_text: string;
          script_style?: string | null;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
          voice_id?: string | null;
          voice_type?: string | null;
          techniques?: Json;
          generation_cost_cents?: number | null;
          is_live?: boolean;
          replaced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meditation_id?: string;
          version_number?: number;
          script_text?: string;
          script_style?: string | null;
          audio_url?: string | null;
          audio_duration_seconds?: number | null;
          voice_id?: string | null;
          voice_type?: string | null;
          techniques?: Json;
          generation_cost_cents?: number | null;
          is_live?: boolean;
          replaced_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meditation_versions_meditation_id_fkey';
            columns: ['meditation_id'];
            isOneToOne: false;
            referencedRelation: 'meditations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      get_user_usage: {
        Args: { check_user_id: string };
        Returns: Array<{
          meditations_generated: number;
          meditations_limit: number;
          remixes_this_month: number;
          remixes_limit: number;
          billing_cycle_start: string;
          billing_cycle_anchor: number;
          days_until_reset: number;
        }>;
      };
      increment_meditation_count: {
        Args: { check_user_id: string };
        Returns: void;
      };
      increment_remix_count: {
        Args: { check_user_id: string };
        Returns: void;
      };
      reset_monthly_usage: {
        Args: Record<string, never>;
        Returns: void;
      };
      archive_meditation_version: {
        Args: { p_meditation_id: string };
        Returns: string;
      };
      set_meditation_version_live: {
        Args: { p_version_id: string };
        Returns: string;
      };
    };
    Enums: {
      subscription_tier: 'free' | 'basic' | 'premium';
      subscription_status: 'active' | 'canceled' | 'past_due';
      plan_status: 'pending_approval' | 'approved' | 'rejected' | 'generating' | 'completed';
      session_length: 'ultra_quick' | 'quick' | 'standard' | 'deep';
      questionnaire_tier: 1 | 2 | 3;
      admin_role: 'admin' | 'super_admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier use
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type QuestionnaireResponse = Database['public']['Tables']['questionnaire_responses']['Row'];
export type QuestionnaireResponseInsert =
  Database['public']['Tables']['questionnaire_responses']['Insert'];
export type QuestionnaireResponseUpdate =
  Database['public']['Tables']['questionnaire_responses']['Update'];

export type MeditationPlan = Database['public']['Tables']['meditation_plans']['Row'];
export type MeditationPlanInsert = Database['public']['Tables']['meditation_plans']['Insert'];
export type MeditationPlanUpdate = Database['public']['Tables']['meditation_plans']['Update'];

export type Meditation = Database['public']['Tables']['meditations']['Row'];
export type MeditationInsert = Database['public']['Tables']['meditations']['Insert'];
export type MeditationUpdate = Database['public']['Tables']['meditations']['Update'];

export type MeditationRemix = Database['public']['Tables']['meditation_remixes']['Row'];
export type MeditationRemixInsert = Database['public']['Tables']['meditation_remixes']['Insert'];
export type MeditationRemixUpdate = Database['public']['Tables']['meditation_remixes']['Update'];

export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert'];
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update'];

// Subscription tiers with their limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    meditationsPerMonth: 1,
    maxSessionLength: 'quick' as const,
    canRemix: false,
  },
  basic: {
    meditationsPerMonth: 5,
    maxSessionLength: 'standard' as const,
    canRemix: true,
  },
  premium: {
    meditationsPerMonth: 20,
    maxSessionLength: 'deep' as const,
    canRemix: true,
  },
} as const;
