# Product Evolution Document

Chronological project record. Keep earlier decisions and verification history; append new entries as the product changes.

## 2026-11-21 — Phase 1 MVP implementation scaffold

### Change and reason

Built the initial Phone Match Next.js App Router application for the authorized Phase 1 task. The buyer's five-answer, no-registration journey and vendor's protected catalogue/settings workflow are the product core. Recommendations remain deterministic; there is no generative selection.

### Affected files and flows

- Application scaffold: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `.eslintrc.json`, `next-env.d.ts`, `.gitignore`, `.env.example`.
- Public experience and discoverability: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/quiz/page.tsx`, `src/app/results/page.tsx`, `src/app/privacy/page.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`, `src/app/globals.css`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`.
- Quiz, matching, results and messaging: `src/components/quiz.tsx`, `src/components/choice-tile.tsx`, `src/components/priority-choice.tsx`, `src/components/results.tsx`, `src/components/product-match-card.tsx`, `src/lib/types.ts`, `src/lib/quiz.ts`, `src/lib/recommendations.ts`, `src/lib/whatsapp.ts`, `src/lib/settings.ts`, `src/lib/image-optimization.ts`.
- Admin, auth and APIs: `middleware.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/admin-guard.ts`, `src/lib/server/settings.ts`, `src/lib/server/rate-limit.ts`, `src/lib/server/origin-guard.ts`, `src/lib/server/product-validation.ts`, `src/app/admin/**`, `src/app/api/**`, and administrator form/navigation components.
- Data/access: `supabase/migrations/202611210001_phase1_core.sql`.
- Automated behavior tests: `src/lib/recommendations.test.ts`, `src/lib/quiz.test.ts`.
- Project docs/flow register: `README.md`, `docs/architecture/ARCHITECTURE.md`, `docs/testing/CRITICAL_FLOWS.md`.

### Introduced decisions and clarified assumptions

- Created the five PRD tables with UUIDs, foreign keys, checks, indexes, RLS and a public-read/admin-write product-image bucket. Public clients receive no direct database policy; validated server routes use a server-only service role.
- The administrator role comes from trusted Supabase `app_metadata.role = "admin"`, never user-editable metadata. Pages, API mutations and storage uploads have server-side authorization; RLS independently restricts direct table access.
- The public quiz stores only the five answers and recommendations; it does not collect identity/contact data. Results are returned in a minimized public shape (without internal ratings/usage matching data) and kept in the current tab's `sessionStorage` so visitors can return to edit answers.
- Default budget and scoring configuration follows the PRD; administrators can edit seven budget ranges, flexibility percentages, weights, thresholds and the public WhatsApp number. The contact is unset by default so no unknown recipient is contacted.
- The open-ended budget choice uses the configured range's lower bound; a custom amount is available for a more specific high budget. Admin configuration requires non-overlapping standard ranges and a distinct custom range.
- The admin deletion workflow asks for confirmation; foreign keys prevent removing products already linked to recommendation history, so administrators can deactivate those instead.
- Product image files are resized and compressed to WebP in the browser before storage; stored images are limited to 3 MB and 1,600 px maximum edge. Stable public paths use Next image optimization.
- Budget, score weights and classifications are vendor-configured deterministic inputs. Match scores are not represented as third-party/industry ratings. Used-device checklists explicitly remain general advice rather than inspection records.
- No products are seeded or invented. Without a configured service role/database, recommendation submission returns an actionable error. An empty inventory produces a real no-match state.
- No supplied credentials were copied into the project. `.env.example` uses placeholders; no Supabase/Netlify configuration, production environment or deployment is claimed.

### Defects and fixes during the build

- No application existed before this work. While writing the database constraints, added explicit JSON type/null/integer validation to avoid nullable JSON values passing PostgreSQL `CHECK` constraints. Corrected the migration ordering so update triggers attach only after their tables exist.
- Reduced the recommendation API response to a public product projection so internal ratings, suitability values and admin-only fields do not leak to the browser.
- Added same-origin checks to write routes and public API input validation, plus an admin-only upload route with MIME/size limits.
- No test/build/lint failure was verified or repaired; automated execution was not available at the time of this entry.

### Verification

- Read `BUILD INSTRUCTIONS/Universal App Building Instructions.md`, `BUILD INSTRUCTIONS/Code Writer.md`, `BUILD INSTRUCTIONS/Code QA.md`, `BUILD INSTRUCTIONS/Universal SEO Instructions.md` and `PRODUCTDOCS/PRD` before implementation.
- Focused recommendation and quiz validation tests were added, but test execution, typecheck, lint, production build, migration execution, RLS integration tests, browser checks and deployment verification are **not run**. The first PowerShell permission request was denied. Static workspace diagnostics reported “No errors found”; this is not equivalent to a TypeScript build or test run.
- No production environment, Supabase project or Netlify deployment was verified.

### Risks, compatibility, rollback and debt

- The one-time migration has not been applied. Back up/inspect a Supabase project before applying; dropping these tables later would destroy quiz and statistics history. Prefer reviewed forward migrations to destructive rollback.
- The best-effort in-memory rate limiter is not shared across instances and trusts the platform's forwarded-address header. Use a platform/shared limiter before public launch.
- Quiz data currently has no automated retention schedule; set one and provide a privacy contact before public launch.
- Uploaded images can be orphaned if upload succeeds and the product is never saved; no cleanup job is included. This is safe but incurs small storage/egress cost.
- Admin inventory is limited to the newest 100 records; there is no pagination, product search, email/password reset interface, audit log, automated image deletion, database retention job, integration/E2E suite or Netlify adapter configuration.
- WhatsApp click-to-chat behavior, product image loading, admin claims, RLS and the migration need manual integration verification. A recorded click does not indicate message delivery.
- Dependency versions were selected and pinned; run install, verify Node compatibility and generate a package lock in the project environment before CI/deployment.

### Next recommended step

Install dependencies and generate the lockfile, then run `npm run typecheck`, `npm test`, `npm run lint` and `npm run build`; resolve any failures. Apply the migration to a dedicated Supabase project, configure environment variables and a trusted admin, then execute `docs/testing/CRITICAL_FLOWS.md` including negative permission checks. Do not call Phase 1 release acceptance complete or deploy until the real WhatsApp number, inventory, privacy retention plan, production URL and live smoke tests are confirmed.
