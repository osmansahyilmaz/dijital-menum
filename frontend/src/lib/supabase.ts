import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn(
        '[Supabase] Credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

// Create client only if credentials are available, otherwise create a placeholder
let supabaseClient: SupabaseClient;

if (isSupabaseConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Create a dummy client that won't crash but won't work either
    // This allows the app to at least render when credentials are missing
    supabaseClient = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
    );
}

export const supabase = supabaseClient;
export default supabase;
