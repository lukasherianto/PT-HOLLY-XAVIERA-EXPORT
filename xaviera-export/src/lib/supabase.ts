import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqkozdqaurjopcqqkhtx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sGCwEqyKJvrCghFeCTnVKQ_OkeTHDEV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
