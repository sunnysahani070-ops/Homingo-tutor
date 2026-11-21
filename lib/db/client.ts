import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Ensure .env.local is loaded in script/test contexts
config({ path: resolve(process.cwd(), '.env.local') });

let _anonClient: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient {
  if (!_anonClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) {
      throw new Error('Supabase public variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing');
    }
    _anonClient = createClient(url, anonKey);
  }
  return _anonClient;
}

export function getServiceSupabase(): SupabaseClient {
  if (!_serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !serviceKey) {
      throw new Error('Supabase server variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing');
    }
    _serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return _serviceClient;
}

// Fallback proxy export for code importing `supabase` directly
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClientSupabase();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
