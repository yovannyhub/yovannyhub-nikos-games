import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://oholmmaslrtxcfnfwewf.supabase.co",
  "sb_publishable_Y8ltQxVMlR_H8WdtQQd5gA_UCXyRtkQ",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
