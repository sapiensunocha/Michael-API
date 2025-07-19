// frontend/src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your frontend/.env file or environment variables.');
  // Throwing an error or preventing app initialization might be better in production
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);