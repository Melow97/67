// 67 Royale Google OAuth helper.
// Requires js/supabase.js and the Supabase JS client to be loaded first.
window.signInWithGoogle = async function () {
  const { error } = await window.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
};

window.signOut67 = async function () {
  const { error } = await window.supabase.auth.signOut();
  if (error) throw error;
  window.location.reload();
};
