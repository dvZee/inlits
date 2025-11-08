import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyRequest {
  tracker: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const SAFEPAY_SECRET_KEY = Deno.env.get("SAFEPAY_SECRET_KEY");
    const SAFEPAY_BASE_URL = Deno.env.get("SAFEPAY_BASE_URL") || "https://sandbox.api.getsafepay.com";

    if (!SAFEPAY_SECRET_KEY) {
      throw new Error("Safepay environment variables are not set");
    }

    const { tracker }: VerifyRequest = await req.json();

    if (!tracker) {
      throw new Error("Tracker is required for verification");
    }

    const response = await fetch(`${SAFEPAY_BASE_URL}/order/v1/${tracker}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SAFEPAY_SECRET_KEY}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payment verification failed");
    }

    const paymentState = result.data.state;
    const isPaid = paymentState === "PAID" || paymentState === "COMPLETE";

    return new Response(
      JSON.stringify({
        success: true,
        paid: isPaid,
        state: paymentState,
        tracker: tracker,
        amount: result.data.amount,
        currency: result.data.currency,
        order_id: result.data.order_id
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Safepay verification error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Verification failed"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});