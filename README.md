# Phone Match

Phone Match helps smartphone buyers in Nigeria compare available brand-new and London-used phones against their budget, usage and two top priorities. It is an independent single-vendor recommendation experience powered by MATT6:33 GADGET HUB.

This repository contains the Phase 1 application implementation. **Supabase credentials, production inventory, WhatsApp contact details and deployment are not configured here.** Do not treat this implementation as launched or production-verified.

## Stack

- Next.js 15 App Router, React 19 and TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Auth and Storage
- Vitest unit tests
- Netlify is a documented future hosting target; this project has not been deployed.

All application dependencies are exact-version pinned in `package.json`.

## Local setup

Requirements: Node.js 20.9 or later and npm.

1. Install the pinned dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Add your own Supabase project URL, anon key and **server-only** service-role key. Keep the service-role key out of `NEXT_PUBLIC_*` variables, source control, browser code and logs.
3. In the Supabase SQL Editor, apply `supabase/migrations/202611210001_phase1_core.sql` to a new project. The migration creates the Phase 1 tables, indexes, update triggers, RLS policies and product-image bucket policies.
4. In Supabase Auth, create the vendor administrator account. Use a trusted project-owner process to set its `app_metadata.role` to `admin`; the client cannot grant itself this role. For example, from the Supabase SQL Editor, replace the placeholder UUID with the intended auth user ID:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where id = 'REPLACE_WITH_AUTH_USER_UUID'::uuid;
   ```

   Sign out and back in after changing the role so the JWT is refreshed. Never run this for an untrusted account.
5. Start the development server:

   ```sh
   npm run dev
   ```

6. Open `http://localhost:3000`. Sign in at `/admin/login`, add products with complete catalogue data and matching attributes, then set the business WhatsApp number in **Admin → Settings**.

The public pages can render without Supabase values. Admin sign-in, product matching/persistence, analytics and image upload need the server-side Supabase configuration and migration. With no catalogue, a valid quiz has an honest no-match state; no demo products are inserted.

## Environment variables

| Variable | Usage | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project and stable product-image URLs | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth browser/server client | Yes; protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only catalogue, quiz, settings, analytics and storage operations | **No** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional fallback before the administrator sets the number | Yes; public contact detail |
| `NEXT_PUBLIC_SITE_URL` | Canonical, sitemap and robots metadata after the site URL is known | Yes |

Use placeholders from `.env.example` only until your own project values are available. The project does not ship with real credentials.

## Verification commands

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

`npm test` covers deterministic recommendation logic and quiz validation. The Supabase migration, RLS boundaries, admin login, image upload and live WhatsApp navigation still require integration/manual verification against a configured Supabase project. See `docs/testing/CRITICAL_FLOWS.md`.

## Data and matching

- The quiz asks five questions and does not require customer registration or collect contact details.
- Quiz submissions retain the selected budget, two priorities, intended use, condition and flexibility, with result rows for matching products. Administrators alone can read them through RLS.
- Public matching is performed server-side using the service role so internal matching scores and suitability attributes are not exposed to browser users.
- Only active, available, configured products within the selected condition and budget are eligible. At most three recommendations are returned; products are never fabricated to fill empty slots.
- Product ratings are vendor-configured matching inputs. They are not shown as independent industry ratings.
- WhatsApp links open a prefilled draft. Phone Match records a click, not successful delivery.
- Product images are resized and WebP-compressed in the browser, uploaded via an administrator-authorized server route, and stored at stable paths in a public product-images bucket. Do not upload private material to that bucket.
- The database has no automatic quiz/submission retention cleanup in this MVP. Choose and implement a retention policy before public launch.

## Documentation

- `docs/architecture/ARCHITECTURE.md` — application layers, data/security model and system diagrams.
- `docs/product/PRODUCT_EVOLUTION.md` — chronological product decisions, changes, verification and follow-up work.
- `docs/testing/CRITICAL_FLOWS.md` — important user/admin flows and the current verification state.

## Deployment and known limitations

No Supabase or Netlify credentials were supplied or configured, no production deployment was attempted, and no live integration has been verified. Before launch, configure environment variables, apply/verify the migration, create an administrator, set a real WhatsApp number, add inventory, test RLS and critical flows, and deploy to a project-controlled Netlify site. Validate the public contact details and privacy/retention policy before sharing the URL.

The in-process API rate limiter is best-effort and does not coordinate across serverless instances. Add a platform-level or shared-store limit before relying on it in production. Uploaded product images are public and may remain orphaned if an administrator uploads an image but does not save a product. The administrator can deactivate inventory immediately; deletion is blocked when historical recommendations refer to a product.

No Phase 2 feedback features, AI, marketplace, orders, payments or automated inventory sync are included.
