# Technical Decisions

This document records the key architectural and tooling decisions made in the project, with the reasoning and tradeoffs for each.

---

## 1. Framework — Next.js 15 on Vercel

**Decision:** Use Next.js with the App Router, deployed on Vercel.

**Reasoning:**
- Next.js App Router gives us API Routes (Server Functions) collocated with the UI in a single repo, avoiding a separate backend service.
- Vercel's free tier handles the deployment and provides automatic preview URLs for every PR.
- The tight Vercel/Next.js integration means zero-config builds, environment variable management, and edge caching out of the box.

**Tradeoffs:**
- Vendor lock-in to Vercel's hosting and build pipeline. Migrating to another platform (e.g., Railway, Fly.io) is possible but requires some reconfiguration.
- `next build` can be slow on low-powered CI runners because it bundles both the client and server.

---

## 2. Database — Supabase (PostgreSQL)

**Decision:** Use Supabase as the managed database and client SDK.

**Reasoning:**
- Supabase provides a hosted PostgreSQL instance with a JavaScript client, Row Level Security, and a web dashboard — all on a generous free tier.
- Using `@supabase/supabase-js` directly in Next.js API routes keeps the architecture simple; no ORM layer needed for the current query complexity.
- The `NEXT_PUBLIC_` prefix on `SUPABASE_URL` and `SUPABASE_ANON_KEY` is intentional: the anon key is designed to be public and its permissions are controlled entirely by RLS policies.

**Tradeoffs:**
- The anon key is exposed to the client bundle. This is the intended Supabase model, but it means RLS policies **must** be correct — a misconfigured policy could expose or corrupt data.
- The current RLS policy allows public inserts (for simplicity during development). For production, inserts should be restricted to a service-role key held only server-side or by GitHub Actions, not the anon key.

---

## 3. AI Content Generation — OpenAI via GitHub Actions

**Decision:** Generate ephemeris entries by calling the OpenAI Chat Completions API from a GitHub Actions workflow that POSTs to the production Vercel endpoint.

**Reasoning:**
- Keeping AI generation out of the hot request path avoids latency for end users; the page reads pre-generated data from Supabase.
- Running generation in GitHub Actions means the `OPENAI_API_KEY` never reaches the browser and is stored as an encrypted GitHub secret.
- Calling the *Vercel endpoint* (rather than running a Node script directly on the Actions runner) lets the workflow reuse the same production code path and respects the same validation/error-handling logic.

**Tradeoffs:**
- The Vercel endpoint must be publicly reachable at generation time — GitHub Actions can't call `localhost`.
- The current workflow is triggered on push (path-filtered), not on a cron schedule. A weekly cron (`schedule:`) is commented out and should be enabled for production use to pre-fill upcoming dates.
- Rate limiting is handled by a `sleep 2` between API calls, which is simplistic. A proper retry/back-off strategy would be more robust.

---

## 4. GitHub Actions Strategy

**Decision:** One workflow for data generation (`generate-ephemeris.yml`), one workflow for CI (`ci.yml`).

**Reasoning:**
- Separating concerns keeps each workflow simple and easy to debug.
- The CI workflow runs on every PR and push to main, providing fast feedback on linting and tests without triggering expensive AI API calls.
- The generation workflow is path-filtered so it only runs when the API route or the workflow file itself changes, reducing unnecessary runs.

**`generate-ephemeris.yml` — what it does:**
1. Checks out the repo and installs Node dependencies (needed for `jq`-based helper scripts).
2. Loops over the next 7 days and POSTs `{ day, month, year }` to the production Vercel API.
3. Waits 2 seconds between requests to stay within OpenAI's free-tier rate limits.
4. Verifies the last generated entry is valid JSON by GETting the same endpoint.
5. Notifies success or failure regardless of step outcome (`if: always()`).

**Secrets used by the workflow:**

| Secret | Where it goes | Why |
|--------|--------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Env var for the step | Lets the Vercel API route connect to Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Env var for the step | Supabase auth for insert |
| `OPENAI_API_KEY` | Env var for the step | Authorises the ChatGPT API call inside the Vercel route |

---

## 5. Rate Limiting & Security Boundaries

**Decision:** No custom rate limiting on the API route itself; rely on Vercel's built-in request throttling and the anon-key/RLS boundary.

**Reasoning:**
- For a portfolio project with low traffic, Vercel's free-tier limits are sufficient.
- The anon key controls what the client *can* do; RLS policies enforce what the database *allows*.

**Tradeoffs:**
- The `/api/generate-ephemeris` POST endpoint is publicly accessible with no authentication. Anyone who finds it could spam OpenAI and Supabase writes. For production, add an `Authorization` header check or move the generation endpoint behind an internal route.
- The `OPENAI_API_KEY` is only present on the GitHub Actions runner and in the Vercel environment — it is never returned to the client.

---

## 6. Testing Approach — Vitest

**Decision:** Use Vitest for unit and integration tests.

**Reasoning:**
- Vitest is a drop-in ESM-native test runner that shares Vite's transform pipeline, giving fast cold starts and first-class TypeScript support with zero extra Babel configuration.
- It integrates well with the `@/*` path alias already configured in `tsconfig.json` via the `vitest.config.ts` resolver.
- The test suite mocks `@supabase/supabase-js` and the global `fetch` so tests run fully offline with no real API credentials.

**Tradeoffs:**
- Vitest does not run inside the Next.js test environment (jsdom/RSC), so component-level tests requiring React rendering would need `@testing-library/react` and a DOM environment. The current tests cover pure utilities and API route logic only.
