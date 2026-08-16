// Public Supabase browser configuration for 67 Royale.
// Never put service-role or secret keys in this file.
window.SUPABASE_URL = 'https://pbokbnixktqmmtigehul.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_552EmITFZ9A7XDm1P43cWg_cbSWF_Vg';

function get67AuthClient() {
  if (!window.__67AuthClient) {
    window.__67AuthClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );
  }
  return window.__67AuthClient;
}

window.start67GoogleAuth = async function () {
  try {
    const { error } = await get67AuthClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  } catch (error) {
    console.error('67 Google sign-in failed:', error);
    if (typeof window.toast === 'function') window.toast(error.message || 'Google sign-in failed');
    else alert(error.message || 'Google sign-in failed');
  }
};

function inject67GoogleButton() {
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
}

function inject67ComplianceModal() {
  if (document.getElementById('67ComplianceModal')) return;
  const modal = document.createElement('div');
  modal.id = '67ComplianceModal';
  modal.className = 'modal open';
  modal.innerHTML = `
    <div class="modalbox" style="max-width:520px">
      <h2>Welcome to 67 Royale</h2>
      <p class="sub" style="line-height:1.55">67 is an 18+ internet-culture community. You can browse public content without an account, but an account is required to post, react, vote, comment, follow or enter Royale.</p>
      <label style="display:flex;gap:8px;margin:14px 0;font-size:12px"><input id="67AgeConfirm" type="checkbox"> I confirm that I meet 67's minimum age requirement.</label>
      <label style="display:flex;gap:8px;margin:14px 0;font-size:12px"><input id="67TermsConfirm" type="checkbox"> I agree to the Terms, Privacy Policy and Community Rules.</label>
      <button id="67FinishOnboarding" class="btn primary" style="width:100%;margin-top:8px">Enter 67 Royale</button>
      <div class="sub" style="margin-top:10px">Only the confirmation timestamps are stored on your 67 profile. Final production legal text and age-assurance process must be completed before public launch.</div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('67FinishOnboarding').addEventListener('click', finish67Compliance);
}

async function finish67Compliance() {
  const age = document.getElementById('67AgeConfirm')?.checked;
  const terms = document.getElementById('67TermsConfirm')?.checked;
  if (!age || !terms) {
    if (typeof window.toast === 'function') window.toast('Confirm your age and accept the terms first');
    return;
  }
  const { data: { user } } = await get67AuthClient().auth.getUser();
  if (!user) return;
  const now = new Date().toISOString();
  const { error } = await get67AuthClient().from('profiles').update({
    age_confirmed_at: now,
    terms_accepted_at: now,
    privacy_accepted_at: now,
    community_rules_accepted_at: now
  }).eq('id', user.id);
  if (error) {
    console.error('67 onboarding save failed:', error);
    if (typeof window.toast === 'function') window.toast('Could not save your account settings');
    return;
  }
  document.getElementById('67ComplianceModal')?.remove();
  if (typeof window.toast === 'function') window.toast('Welcome to 67 Royale');
}

async function check67AccountCompliance() {
  const { data: { user } } = await get67AuthClient().auth.getUser();
  if (!user) return;
  const { data: profile, error } = await get67AuthClient()
    .from('profiles')
    .select('age_confirmed_at,terms_accepted_at,privacy_accepted_at,community_rules_accepted_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('67 profile check failed:', error.message);
    return;
  }
  if (!profile?.age_confirmed_at || !profile?.terms_accepted_at || !profile?.privacy_accepted_at || !profile?.community_rules_accepted_at) {
    inject67ComplianceModal();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inject67GoogleButton();
  check67AccountCompliance();
  const client = get67AuthClient();
  client.auth.onAuthStateChange((_event, session) => {
    if (session) setTimeout(check67AccountCompliance, 0);
  });
});
