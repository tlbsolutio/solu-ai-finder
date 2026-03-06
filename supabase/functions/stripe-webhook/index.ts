import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Stripe signature verification (HMAC-SHA256)
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Reject if timestamp is older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === signature;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";

  // Verify signature if secret is configured
  if (STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(body, sigHeader, STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      console.error("Invalid Stripe signature");
      return new Response("Invalid signature", { status: 400 });
    }
  }

  const event = JSON.parse(body);
  console.log("Stripe event:", event.type, event.id);

  // Only handle successful checkout completions
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const checkoutSession = event.data.object;
  const customerEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email;
  const paymentRef = checkoutSession.payment_intent || checkoutSession.id;
  const amountTotal = checkoutSession.amount_total; // in cents
  const planType = amountTotal >= 80000 ? "accompagnee" : "autonome";
  // client_reference_id = cart session ID (passed from pricing page)
  const cartSessionId = checkoutSession.client_reference_id;

  if (!customerEmail) {
    console.error("No customer email in checkout session");
    return new Response(JSON.stringify({ error: "No customer email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!cartSessionId) {
    console.error("No cart session ID (client_reference_id) in checkout session");
    return new Response(JSON.stringify({ warning: "No session ID, manual activation needed", email: customerEmail }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Activating subscription for ${customerEmail}, session: ${cartSessionId}, plan: ${planType}, ref: ${paymentRef}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get the session's owner_id from cart_sessions (the actual user who owns the diagnostic)
  const { data: cartSession, error: sessionError } = await supabase
    .from("cart_sessions")
    .select("owner_id")
    .eq("id", cartSessionId)
    .single();

  let ownerId: string;

  if (cartSession?.owner_id) {
    // Use the session owner (correct: whoever created the diagnostic)
    ownerId = cartSession.owner_id;
    console.log(`Session owner: ${ownerId} (from cart_sessions)`);
  } else {
    // Fallback: find user by Stripe email
    console.warn(`Session ${cartSessionId} not found or no owner, falling back to email lookup`);
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("Error listing users:", userError);
      return new Response(JSON.stringify({ error: "Failed to find user" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const user = users.users.find(
      (u) => u.email?.toLowerCase() === customerEmail.toLowerCase(),
    );
    if (!user) {
      console.error(`No user found for email: ${customerEmail}`);
      return new Response(JSON.stringify({ warning: "User not found, manual activation needed", email: customerEmail }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    ownerId = user.id;
  }

  // Check if subscription already exists for this session
  const { data: existing } = await supabase
    .from("cart_subscriptions")
    .select("id")
    .eq("session_id", cartSessionId)
    .limit(1)
    .single();

  let subError;
  if (existing) {
    const res = await supabase
      .from("cart_subscriptions")
      .update({ status: "active", payment_ref: paymentRef, owner_id: ownerId })
      .eq("id", existing.id);
    subError = res.error;
  } else {
    const res = await supabase
      .from("cart_subscriptions")
      .insert({
        owner_id: ownerId,
        session_id: cartSessionId,
        status: "active",
        payment_ref: paymentRef,
      });
    subError = res.error;
  }

  if (subError) {
    console.error("Error activating subscription:", subError);
    return new Response(JSON.stringify({ error: "Failed to activate subscription" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Subscription activated for owner ${ownerId}, session: ${cartSessionId}, plan: ${planType}`);

  return new Response(
    JSON.stringify({ success: true, ownerId, sessionId: cartSessionId, plan: planType }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
