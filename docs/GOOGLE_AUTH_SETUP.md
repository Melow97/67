# 67 Royale — Google Sign-In Setup

67 uses Supabase Auth for identity. Google OAuth is configured in Supabase and the browser calls `signInWithOAuth({ provider: 'google' })`.

## Supabase

1. Open Authentication → Providers → Google.
2. Enable Google.
3. Create a Google OAuth Web application in Google Cloud / Google Auth Platform.
4. Add the production Netlify origin as an Authorized JavaScript origin.
5. Add the Supabase callback URL shown by the Google provider settings as an Authorized redirect URI.
6. Paste the Google Client ID and Client Secret into Supabase. Do not put the Google secret in GitHub or browser code.

## Production redirect

After Netlify gives 67 its production URL, add that exact origin to the Google OAuth configuration and Supabase URL/redirect settings.

For local testing, Supabase documents adding the local origin as an additional authorized JavaScript origin.

## Browser flow

The frontend only needs the Supabase publishable key. The Google client secret remains server-side in Supabase.
