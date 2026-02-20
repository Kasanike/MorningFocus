export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_principles: {
        Row: {
          id: string;
          user_id: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          language_preference: string;
          plan: "free" | "pro";
          subscription_start: string | null;
          subscription_end: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          language_preference?: string;
          plan?: "free" | "pro";
          subscription_start?: string | null;
          subscription_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          language_preference?: string;
          plan?: "free" | "pro";
          subscription_start?: string | null;
          subscription_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_focus: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          tasks: Json;
          quote_override: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          tasks?: Json;
          quote_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          tasks?: Json;
          quote_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
