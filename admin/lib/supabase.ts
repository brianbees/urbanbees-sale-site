import { createClient } from '@supabase/supabase-js';

// Public client for read operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client with service role key for create/update/delete operations
// Note: Using NEXT_PUBLIC_ prefix to make it available in client components
// This is acceptable for an internal admin tool, but ideally should use API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
