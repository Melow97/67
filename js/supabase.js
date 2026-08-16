// Public Supabase browser configuration for 67 Royale.
// Never put service-role or secret keys in this file.
window.SUPABASE_URL = 'https://pbokbnixktqmmtigehul.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_552EmITFZ9A7XDm1P43cWg_cbSWF_Vg';

// Google OAuth helper. The Google Client ID/Secret remain in Supabase Auth.
// The browser only asks Supabase to start the OAuth flow.
window.start67GoogleAuth = async function () {
  try {
    const client = window.__67AuthClient || window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
    window.__67AuthClient = client;

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('67 Google sign-in failed:', error);
    if (typeof window.toast === 'function') window.toast(error.message || 'Google sign-in failed');
    else alert(error.message || 'Google sign-in failed');
  }
};

// Add the Google button to the existing authentication modal without changing
// the visual layout elsewhere in the app.
document.addEventListener('DOMContentLoaded', () => {
  const modalBox = document.querySelector('#modal .modalbox');
  if (!modalBox || document.getElementById('googleAuthBtn')) return;

  const google = document.createElement('button');
  google.id = 'googleAuthBtn';
  google.className = 'btn';
  google.style.cssText = 'width:100%;margin:12px 0 8px;font-weight:850;';
  google.textContent = 'Continue with Google';
  google.addEventListener('click', () => window.start67GoogleAuth());

  const divider = document.createElement('div');
  divider.className = 'sub';
  divider.style.cssText = 'text-align:center;margin:4px 0 6px;';
  divider.textContent = 'or use email';

  const emailInput = modalBox.querySelector('#email');
  if (emailInput) {
    modalBox.insertBefore(google, emailInput);
    modalBox.insertBefore(divider, emailInput);
  } else {
    modalBox.prepend(divider);
    modalBox.prepend(google);
  }
});
