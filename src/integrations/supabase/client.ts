// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xvxigkogmwffqbixrolm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2eGlna29nbXdmZnFiaXhyb2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDkzNDksImV4cCI6MjA2NDE4NTM0OX0.H524tjcFRg-vRKSWZd9kK7LvoqnBbwDXt-zG55juQBw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);