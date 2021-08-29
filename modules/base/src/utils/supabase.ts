import { createClient } from '@supabase/supabase-js';

export default createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'localhost:9999',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '12345678',
);
