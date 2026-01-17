import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// إذا لم تكن القيم موجودة، سيظهر لك تنبيه بدلاً من تحطم الموقع
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("تنبيه: روابط Supabase مفقودة في ملف .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);