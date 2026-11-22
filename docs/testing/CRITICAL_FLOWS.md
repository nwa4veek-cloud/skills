# Phase 1 critical-flow register

`PASS` means evidence was actually collected; code presence is not a pass.

| ID | Critical flow | Current state |
|---|---|---|
| CF-01 | Visitor completes exactly five questions, selects exactly two priorities, and submits valid answers | Unit tests added; run status pending |
| CF-02 | Invalid/incomplete or tampered quiz input is rejected before recommendation persistence | Unit tests added; route integration not run |
| CF-03 | Eligible inventory is filtered, scored deterministically and sorted; no/one/many results are handled | Unit tests added; run status pending |
| CF-04 | Visitor sees explanation, applicable used-phone checklist, no-match/restart/edit states | Implemented; manual browser verification pending |
| CF-05 | Visitor follows WhatsApp click-to-chat; click analytics do not claim message delivery | Implemented; real number and end-to-end verification pending |
| CF-06 | Unauthenticated and non-admin users cannot enter admin pages or mutate catalog/settings/images | Middleware, server guards and RLS added; Supabase permission verification pending |
| CF-07 | Authenticated admin manages catalog, image, inventory and settings; empty/error states are clear | Implemented; Supabase integration verification pending |
| CF-08 | Admin sees quiz and WhatsApp interaction counts | Implemented; real database verification pending |
| CF-09 | Public product images have stable URLs, fit size/type limits and are served through Next image optimization | Client processing and bucket policies added; browser/storage verification pending |

## Automated tests

`src/lib/recommendations.test.ts` covers budget ceilings/flexibility, conditions, scoring/explanations, usage ranking, missing data, availability, inactive products, tie determinism/limit, empty/single inventory and used-phone checklist behavior.

`src/lib/quiz.test.ts` covers a complete valid submission, a missing answer, fewer/more/duplicate/unknown priorities, custom range limits, forged non-custom amount, malformed/unsafe budgets and invalid usage/condition.

Run `npm test` after installing the pinned project dependencies. No integration credentials or test database are committed.

## Required manual/integration checks before release

1. Apply the migration in a dedicated Supabase project; inspect tables, indexes, constraints and storage bucket.
2. Verify anon, authenticated non-admin, admin and service-role access for every table and storage operation. Confirm products/quiz/analytics/private settings are not directly readable by an anon client.
3. Sign in as an admin, then try the product/settings/image APIs unauthenticated, as a non-admin, and with a cross-origin request; every attempt must be denied without changing data.
4. Add representative, verified products; exercise all five quiz steps at mobile and desktop widths; test slow network, API failure, no match, one match and three matches.
5. Verify the London-used checklist makes no inspection claim, products with malformed/missing ratings do not match, deleted/unavailable products disappear, and changing answers restores the prior answers.
6. Check a real configured WhatsApp link opens the intended business number and a populated draft. Confirm clicks update counts; do not infer delivery.
7. Test a valid/invalid/oversized image; confirm output dimensions/type and stable cached image URL.
8. Run typecheck, unit tests, lint, production build and keyboard/screen-reader checks. If deployed, smoke-test the live public route, login, APIs, images and mobile layout and capture deployment/log evidence.

No Supabase, browser end-to-end or production check has been reported as passed in this implementation session.
