# 67 Royale — Development Guide

## Development rule

Build and verify one subsystem at a time. Authentication should remain stable while social and Royale features are added.

## Local server

Use an HTTP server rather than opening `index.html` directly. OAuth requires a valid HTTP origin.

Recommended development origin:

```text
http://localhost:5173
```

If you choose a different local port, update the Supabase Auth redirect configuration and Google/Supabase settings consistently.

## Authentication flow

```text
67 frontend
  -> Supabase Auth
  -> Google OAuth
  -> Supabase callback
  -> /auth/callback.html
  -> profile lookup / creation
  -> onboarding or main app
```

## Secrets

Frontend code may contain only public Supabase configuration intended for browser use. Never commit:

- Supabase service-role keys
- Google OAuth client secrets
- Payment provider secret keys
- AI provider secret keys
- Database passwords
- Private API tokens

## Database

Supabase Postgres is the source of truth for accounts, profiles, posts, reactions and future Royale state. Use migrations for schema changes and enable RLS for user-owned data.

## Before production

- Replace localhost OAuth redirects with the production domain.
- Verify all RLS policies.
- Add rate limits and abuse controls.
- Configure backups and monitoring.
- Complete legal documents and age-assurance requirements.
- Configure payment webhooks server-side.
- Add an audited server-side admin role system.
