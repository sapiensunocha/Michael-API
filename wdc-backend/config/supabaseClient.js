const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Ensure environment variables are loaded

// Initialize Supabase client for backend operations.
// It's crucial to use the SUPABASE_SERVICE_ROLE_KEY here for full access
// and to bypass Row Level Security (RLS), as this is a trusted backend service.
// The SUPABASE_URL should be your project's API URL.
// The SUPABASE_SERVICE_ROLE_KEY is a secret key and should NEVER be exposed to the frontend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use the service role key for backend
);

module.exports = supabase;
