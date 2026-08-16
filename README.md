# 67 Royale

> A fast-moving meme, internet-culture and community platform built around posts, rankings and Royale battles.

## Status

67 Royale is currently in active development. Authentication and the Supabase-backed social foundation are being built before production launch.

## Core product

- Meme-first social feed
- Google authentication through Supabase Auth
- User profiles
- Posts and reactions
- ELO / Royale ranking system
- Royale meme battles
- "You've been 67'd" battle results
- Streaks and platform points
- Trend and meme discovery
- Future AI-powered meme analysis and answers

## Tech stack

- HTML / CSS / JavaScript
- Supabase Auth
- Supabase Postgres
- GitHub for source control
- Netlify planned for production hosting

## Local development

This project is currently a lightweight browser application and does not require a Node build step for the basic frontend.

Serve the repository with a local HTTP server. Do not open HTML files directly with `file://`, because OAuth callbacks and browser security rules require an HTTP origin.

The development authentication flow currently expects the local site to be available at:

```text
http://localhost:5173
```

Supabase Authentication should have the matching redirect URL configured:

```text
http://localhost:5173/auth/callback.html
```

## Supabase configuration

The browser uses the project's public Supabase URL and publishable key. Never commit a Supabase service-role key, Google Client Secret, Stripe secret, or other server secret to this repository.

Google OAuth is configured through Supabase Auth. The Google OAuth provider's callback remains the Supabase callback:

```text
https://pbokbnixktqmmtigehul.supabase.co/auth/v1/callback
```

## Project structure

```text
67/
├── index.html              # Main 67 interface
├── profile.html            # User profile
├── auth/
│   └── callback.html       # OAuth callback / account routing
├── js/
│   └── supabase.js         # Supabase browser client and app integration
└── README.md               # Project documentation
```

## Security principles

- Never expose service-role credentials in frontend code.
- Authentication decisions come from Supabase Auth.
- Profile and social data should use Row Level Security (RLS).
- Users may modify only resources they own.
- Admin privileges must be enforced server-side, not by hiding a frontend button.
- Production age-assurance, terms, privacy and community-safety requirements must be completed before public launch.

## Roadmap

### Phase 1 — Foundation

- [x] Supabase project
- [x] Google OAuth provider
- [x] Account onboarding fields
- [x] User profile foundation
- [x] Posts database
- [x] Reactions database
- [ ] Finish local OAuth callback testing

### Phase 2 — Community

- [ ] Comments
- [ ] Media uploads
- [ ] User follows
- [ ] Reporting and moderation
- [ ] Notifications

### Phase 3 — Royale

- [ ] Battle matchmaking
- [ ] Meme comparison engine
- [ ] ELO calculations
- [ ] Battle limits / Pro access
- [ ] "67'd" result cards
- [ ] Leaderboards

### Phase 4 — Intelligence

- [ ] Meme trend detection
- [ ] AI meme analysis
- [ ] AI-powered answers
- [ ] Social trend ingestion
- [ ] Personalised discovery

### Phase 5 — Production

- [ ] Production domain
- [ ] Netlify deployment
- [ ] Production OAuth redirect configuration
- [ ] Payments / Pro subscription
- [ ] Support / donations
- [ ] Monitoring and analytics

## Contributing

67 Royale is currently a private product project. Development changes should be made deliberately and tested locally before production deployment.

## License

All rights reserved unless a separate license is added to this repository.