import { createClient } from '@supabase/supabase-js';

// الموقع هيسحب البيانات تلقائياً من Vercel أو من ملف .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("خطأ: مفاتيح Supabase مفقودة! تأكد من إعدادات Vercel أو ملف .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
