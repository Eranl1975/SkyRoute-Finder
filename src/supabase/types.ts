// Auto-generated Supabase type stubs.
// Replace with generated types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: { id: string; user_id: string; role: 'user' | 'admin'; created_at: string };
        Insert: { user_id: string; role?: 'user' | 'admin' };
        Update: { role?: 'user' | 'admin' };
      };
      search_history: {
        Row: { id: string; user_id: string | null; params: Record<string, unknown>; result_summary: Record<string, unknown> | null; searched_at: string };
        Insert: { user_id?: string; params: Record<string, unknown>; result_summary?: Record<string, unknown> };
        Update: never;
      };
      saved_searches: {
        Row: { id: string; user_id: string; name: string | null; params: Record<string, unknown>; saved_at: string };
        Insert: { user_id: string; name?: string; params: Record<string, unknown> };
        Update: { name?: string };
      };
      favorites: {
        Row: { id: string; user_id: string; type: 'flight' | 'hotel'; item_id: string; item_data: Record<string, unknown>; saved_at: string };
        Insert: { user_id: string; type: 'flight' | 'hotel'; item_id: string; item_data: Record<string, unknown> };
        Update: never;
      };
      provider_registry: {
        Row: { id: string; name: string; domain: string; trust_level: string; type: string; country: string | null; is_active: boolean; is_official: boolean; notes: string | null; updated_at: string };
        Insert: Omit<Database['public']['Tables']['provider_registry']['Row'], 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['provider_registry']['Row'], 'id'>>;
      };
      app_settings: {
        Row: { key: string; value: unknown; updated_at: string; updated_by: string | null };
        Insert: { key: string; value: unknown };
        Update: { value?: unknown };
      };
      feature_flags: {
        Row: { flag_key: string; enabled: boolean; description: string | null; updated_at: string };
        Insert: { flag_key: string; enabled?: boolean; description?: string };
        Update: { enabled?: boolean };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
