import { createClient } from '@supabase/supabase-js'

// Sostituisci con i tuoi valori di Supabase
const supabaseUrl = 'https://sdvebkfxhlchksocmfgp.supabase.co'
const supabaseKey = 'TUA_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)