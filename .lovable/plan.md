## Scope

You'll continue building in Lovable (TanStack Start) and export to Next.js yourself later. In this project I'll:

1. Wire **BYOK Stripe** Checkout + webhook so the Virtual Diya only lights on confirmed payment.
2. Re-point the app at **your own Supabase project** and give you a one-shot SQL migration to run there.
3. Hand you a **Next.js export guide** (file-by-file mapping) so the port is mechanical.

---

## Part 1 — Bring-your-own Supabase

Lovable Cloud cannot be disabled on this project, but the running app can be pointed at any Supabase project by overriding the env vars. Two phases:

**A. You create the Supabase project**

- New project at supabase.com → copy `Project URL`, `anon public key`, `service_role key`.
- I'll request them via the secrets tool as: `BYO_SUPABASE_URL`, `BYO_SUPABASE_ANON_KEY`, `BYO_SUPABASE_SERVICE_ROLE_KEY`.

**B. I produce a single consolidated migration file**

- `supabase/migrations/byo_full_schema.sql` containing: enums (`app_role`, `donation_status`, `donation_cause`, `event_type`, `media_type`), all 6 tables, RLS policies, `has_role()` + `handle_new_user()` functions, and the `on_auth_user_created` trigger. You run it once in your Supabase SQL editor.
- Seed your admin email into `admin_whitelist`.

**C. Switch the client over**

- Update `src/integrations/supabase/client.ts` and `client.server.ts` to read the BYO env vars when present, falling back to Lovable Cloud otherwise. (The auto-generated comment stays — I'll add a small wrapper that reads the override.)
- Regenerate `src/integrations/supabase/types.ts` against your project (one `supabase gen types` command, instructions provided).

> Note: in Lovable preview, the app will keep working against Lovable Cloud unless you also set the BYO_* env vars in your environment. The wiring is ready for when you export.

---

## Part 2 — BYOK Stripe Checkout + Webhook

**Secrets requested:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` (publishable can also live in `.env`).

**Server function** `src/server/stripe.functions.ts`:

- `createDonationCheckout({ amount, currency, cause, donor_name, donor_email, dedication })`
  1. Insert a `donations` row with `status='pending'`, generate `reference_id`.
  2. Create a Stripe Checkout Session (`mode: 'payment'`, line item built from amount/currency/cause label, `metadata: { donation_id, reference_id }`, `success_url=/receipt/{reference_id}?session_id={CHECKOUT_SESSION_ID}`, `cancel_url=/donate?canceled=1`).
  3. Persist `stripe_session_id` on the donation row, return `{ url }`.

**Public webhook** `src/routes/api/public/stripe-webhook.ts`:

- `POST` only, reads raw body, verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET` using the official `stripe` SDK's `constructEvent`.
- On `checkout.session.completed`: look up donation by `stripe_session_id`, update `status='paid'`, `paid_at=now()`, store `amount_total`/`currency` from the session.
- On `checkout.session.expired` / `payment_intent.payment_failed`: mark `failed`.
- Always returns 200 quickly; errors logged but not retried unless signature invalid (then 400).

**Donate page changes** (`src/routes/donate.tsx`):

- Replace simulation submit with `useServerFn(createDonationCheckout)` → `window.location = url`.
- Remove the optimistic "Diya lit" state.

**Receipt page** (`src/routes/receipt.$ref.tsx`):

- On mount, poll donation row by `reference_id` for up to ~10s waiting for `status='paid'` (webhook is usually faster than redirect, but covers race).
- Only render lit Virtual Diya + PDF download when `status='paid'`. Show "Confirming with bank…" otherwise; show error if `failed`.

**DB migration**: add `amount_total numeric`, `stripe_payment_intent text` columns to `donations` (small additive migration).

**Webhook URL to register in Stripe dashboard:**

- Lovable preview: `https://project--3ce323e1-e0ea-4fcc-b0c5-255b92fc9cac.lovable.app/api/public/stripe-webhook`
- After Next.js export: your deployed URL + `/api/public/stripe-webhook` (Next.js route at `app/api/public/stripe-webhook/route.ts`).

---

## Part 3 — Next.js Export Guide

I'll add `MIGRATION_TO_NEXTJS.md` at the project root with:


| TanStack Start                            | Next.js 15 (App Router) equivalent                            |
| ----------------------------------------- | ------------------------------------------------------------- |
| `src/routes/foo.tsx` (`createFileRoute`)  | `app/foo/page.tsx`                                            |
| `src/routes/__root.tsx`                   | `app/layout.tsx`                                              |
| `src/routes/api/public/stripe-webhook.ts` | `app/api/public/stripe-webhook/route.ts`                      |
| `createServerFn` handlers                 | `"use server"` server actions in `app/_actions/*.ts`          |
| `requireSupabaseAuth` middleware          | `@supabase/ssr` server client per request                     |
| `useServerFn(fn)`                         | direct `await fn(args)` from client component (server action) |
| `Link from @tanstack/react-router`        | `Link from next/link`                                         |
| Vite env `VITE_*` / `import.meta.env`     | `NEXT_PUBLIC_*` / `process.env`                               |


Plus: `package.json` swaps (`next`, `@supabase/ssr`), `next.config.js`, deletion of `src/routeTree.gen.ts` and `vite.config.ts`, copy-paste-ready replacement of `client.ts` / `client.server.ts` for `@supabase/ssr`. Tailwind config already portable.

---

## Build Order

```text
1. Add Stripe deps (stripe, @stripe/stripe-js)
2. Migration: add amount_total + stripe_payment_intent to donations
3. Write src/server/stripe.functions.ts (createDonationCheckout)
4. Write src/routes/api/public/stripe-webhook.ts (signature verify + status update)
5. Update donate.tsx → real Checkout redirect
6. Update receipt.$ref.tsx → poll for paid status, gate Diya
7. Generate consolidated supabase/migrations/byo_full_schema.sql
8. Add BYO_* env override in client.ts / client.server.ts
9. Write MIGRATION_TO_NEXTJS.md
```

## What I need from you (in order)

1. `**STRIPE_SECRET_KEY**` + `**STRIPE_WEBHOOK_SECRET**` — I'll request via the secrets tool once you approve.
2. (Optional, for actually running on your Supabase from Lovable) `**BYO_SUPABASE_URL**`, `**BYO_SUPABASE_ANON_KEY**`, `**BYO_SUPABASE_SERVICE_ROLE_KEY**`. You can skip this and just take the migration file + code with you to Next.js.

Approve and I'll start all the steps