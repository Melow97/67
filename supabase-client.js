import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://pbokbnixktqmmtigehul.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_552EmITFZ9A7XDm1P43cWg_cbSWF_Vg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function getLiveTrends(limit = 4) {
  const { data, error } = await supabase
    .from('trends')
    .select('id,name,category,status,momentum,post_count,summary,source,updated_at')
    .order('momentum', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getRecentPosts(limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('id,author_id,body,media_url,category,royal_score,created_at,profiles(username,display_name,avatar_url,elo)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,display_name,avatar_url,elo,royals,streak_days,royale_tickets')
    .order('elo', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
