import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_SECRET_KEY;
        const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret || !whSecret) {
          return new Response("Stripe not configured", { status: 500 });
        }
        const stripe = new Stripe(secret, { apiVersion: "2025-09-30.clover" as any });
        const sig = request.headers.get("stripe-signature");
        if (!sig) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, whSecret);
        } catch (err: any) {
          console.error("Stripe signature verification failed:", err?.message);
          return new Response(`Invalid signature: ${err?.message}`, { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const s = event.data.object as Stripe.Checkout.Session;
              await supabaseAdmin
                .from("donations")
                .update({
                  status: "paid",
                  paid_at: new Date().toISOString(),
                  amount_total: s.amount_total != null ? s.amount_total / 100 : null,
                  stripe_payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : null,
                })
                .eq("stripe_session_id", s.id);
              break;
            }
            case "checkout.session.expired":
            case "checkout.session.async_payment_failed": {
              const s = event.data.object as Stripe.Checkout.Session;
              await supabaseAdmin.from("donations").update({ status: "failed" }).eq("stripe_session_id", s.id);
              break;
            }
            default:
              break;
          }
        } catch (err: any) {
          console.error("Webhook handler error:", err?.message);
          // Return 200 to avoid Stripe retry storms once signature is verified
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});