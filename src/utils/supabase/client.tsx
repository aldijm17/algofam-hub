// /utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Fungsi ini akan membuat Supabase client untuk digunakan di sisi klien (browser)
export function createClient() {
  return createBrowserClient(
    // Pastikan variabel ini ada di file .env.local Anda
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}