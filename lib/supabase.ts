import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmwcvaaviheclxgerdgq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rtV0FkubiAIH544cWRazHA_7U_Iio6_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

