# Shri Meera Mai Ashram — Digital Sanctuary

A bilingual (English / शुद्ध हिन्दी) PWA for the Ashram at Kapildhara, Amarkantak. Modern Vedic aesthetic with glassmorphism, Framer Motion, and a flowing Narmada SVG spline tying sections together. Lovable Cloud powers auth, database, gallery storage, RSVPs, donations, and admin.

## Design system

- Colors: Saffron `#FF8C00`, Narmada Blue `#0077BE`, Sandalwood Gold `#D4AF37`, cream `#FAFAFA` / twilight `#0F172A`
- Glassmorphism cards (frosted, backdrop-blur) over a soft gradient background
- Inter for UI, elegant serif for headings; full Devanagari support
- Framer Motion for scroll-reveals, transitions, and the Diya animation
- Light/dark mode toggle (day → twilight cycle)

## Public site

**Sticky bilingual header** — language toggle (EN / हिं) via React context, prominent Donate / दान CTA, mobile-friendly nav.

**Hero** — full-bleed landing with vertically flowing Narmada SVG path that visually connects every section as the user scrolls.

**Immersive History (इतिहास)** — animated vertical timeline of Shri Meera Mai's life and legacy; cards fade and lift in on scroll.

**Bilingual Media Vault (गैलरी)** — masonry grid with tabs: Utsavs, Darshan, Life of Meera Mai. Hover gives 3D depth. Lightbox for photos and embedded videos. Content managed by admins.

**Parikrama Logistics Hub (परिक्रमा सेवा)**
- Stay (आवास): room-type status cards
- Food (भोजन): Bhandara timing schedule
- Essential Kit: interactive checklist (state persisted in localStorage)

**Dharmic Calendar (पंचांग)** — beautiful month view highlighting Utsavs, Purnima, Amavasya, and admin-created events. Click an event to see details and RSVP.

**RSVP / attendance** — anyone can RSVP with name + email (no login). Confirmation shown on screen and stored. In-app notification reminders surface on the site for tithis the user has RSVP'd to (via a small bell/notification center keyed by email or device).

**Trust-centric Donation (दान)**
- Tabs for causes: Annakshetra, Maintenance, Goshala
- Preset amounts + custom amount, donor name/email, optional dedication
- Stripe Checkout integration wired up but disabled until keys are added; in the meantime a simulated UPI / test flow completes the journey end-to-end
- On webhook-confirmed success: Sankalp success state plays the **Virtual Diya** animation — flame height, glow radius, ember count, and aura intensity scale with donation amount; subtle particle drift for large donations
- Shareable: generate an OG-ready share card (image + link) with the donor's dedication and Diya, plus native share / copy-link / WhatsApp / X buttons

**Donation receipt** — every completed donation gets a receipt page with transaction summary (amount, cause, date, reference ID, dedication) and a **Download PDF** button. Receipts are accessible via a unique link emailed/shown after success.

## Admin panel (`/admin`)

- **Login**: email + password (Lovable Cloud auth). Access restricted to a whitelist of admin emails stored in a `user_roles` table; non-admins are blocked at the route guard.
- **Gallery manager**: create / edit / delete / reorder items across the three categories; upload images to Cloud Storage; changes publish instantly.
- **Calendar manager**: create / edit / delete events and tithis; mark featured Utsavs.
- **RSVP viewer**: per-event attendee list with export.
- **Donations viewer**: list of donations with status, amount, cause, donor, receipt link.

## Stripe (added last)

Architecture is built now so the switch is a one-step activation:
- Server function creates a Stripe Checkout Session for the chosen cause/amount
- Public webhook route `/api/public/stripe-webhook` verifies the signature and marks the donation `paid`
- The Virtual Diya only lights after the webhook confirms success (client polls the donation record)
- Until you provide your Stripe secret + webhook secret, the same flow runs in **simulation mode** so the rest of the site is fully testable

When you're ready, you'll paste your Stripe Secret Key and Webhook Signing Secret and we flip it live.

## Data model (Lovable Cloud)

- `profiles` (id → auth.users)
- `user_roles` (user_id, role) + `has_role()` security-definer function
- `gallery_items` (category, title_en, title_hi, media_url, type, order, published)
- `events` (title_en, title_hi, description, date, type, featured)
- `rsvps` (event_id, name, email, device_id, created_at)
- `donations` (cause, amount, donor_name, donor_email, dedication, status, stripe_session_id, reference_id, created_at)
- `notifications` (email/device_id, event_id, scheduled_for, sent)

RLS: public read on published gallery/events; insert-only on rsvps and donations from anon; full CRUD for admins via `has_role(auth.uid(), 'admin')`.

## Build order

1. Cloud + design system + bilingual context + glassmorphic layout + Narmada SVG spline
2. History timeline, Media Vault, Logistics Hub, Dharmic Calendar
3. Auth + admin role + admin panel (gallery, calendar, RSVPs, donations views)
4. RSVP flow + in-app notification center
5. Donation flow in simulation mode + Virtual Diya (amount-reactive) + shareable success + PDF receipt
6. Stripe Checkout + webhook wired and gated behind your keys (added when you provide them)

After approval I'll start at step 1 and work through sequentially.