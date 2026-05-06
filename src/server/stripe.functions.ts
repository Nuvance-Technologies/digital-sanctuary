import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequestHost, getRequestHeader } from "@tanstack/react-start/server";

const Input = z.object({
  cause: z.enum(["annakshetra", "maintenance", "goshala", "general"]),
  amount: z.number().int().min(1).max(10_000_000),
  currency: z.string().default("INR"),
  donor_name: z.string().min(1).max(120),
  donor_email: z.string().email(),
  dedication: z.string().max(500).optional().nullable(),
});

const causeLabel: Record<string, string> = {
  annakshetra: "Annakshetra Seva",
  maintenance: "Ashram Maintenance",
  goshala: "Goshala Seva",
  general: "General Daan",
};

export const createDonationCheckout = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY.");

    const stripe = new Stripe(secret, { apiVersion: "2025-09-30.clover" as any });

    // 1. Insert pending donation
    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        cause: data.cause,
        amount: data.amount,
        currency: data.currency,
        donor_name: data.donor_name,
        donor_email: data.donor_email,
        dedication: data.dedication ?? null,
        status: "pending",
      })
      .select("id, reference_id")
      .single();
    if (error || !donation) throw new Error(error?.message ?? "Could not create donation record");

    // 2. Build origin from request
    const proto = getRequestHeader("x-forwarded-proto") ?? "https";
    const host = getRequestHost();
    const origin = `${proto}://${host}`;

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.donor_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data.currency.toLowerCase(),
            unit_amount: Math.round(data.amount * 100),
            product_data: {
              name: `${causeLabel[data.cause]} — Shri Meera Mai Ashram`,
              description: data.dedication ? `Sankalp: ${data.dedication}` : undefined,
            },
          },
        },
      ],
      metadata: {
        donation_id: donation.id,
        reference_id: donation.reference_id,
        cause: data.cause,
      },
      success_url: `${origin}/receipt/${donation.reference_id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate?canceled=1`,
    });

    // 4. Persist session id
    await supabaseAdmin
      .from("donations")
      .update({ stripe_session_id: session.id })
      .eq("id", donation.id);

    return { url: session.url!, reference_id: donation.reference_id };
  });