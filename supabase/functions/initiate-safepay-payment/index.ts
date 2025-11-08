import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  amount: number;
  currency: string;
  order_id: string;
  customer_email: string;
  customer_name?: string;
  source?: string;
  webhook_url?: string;
  redirect_url?: string;
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

    const paymentData: PaymentRequest = await req.json();

    if (!paymentData.amount || !paymentData.currency || !paymentData.order_id || !paymentData.customer_email) {
      throw new Error("Missing required payment fields");
    }

    const payload = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.order_id,
      customer: {
        email: paymentData.customer_email,
        name: paymentData.customer_name || "Customer"
      },
      source: paymentData.source || "custom",
      webhook_url: paymentData.webhook_url,
      redirect_url: paymentData.redirect_url
    };

    const response = await fetch(`${SAFEPAY_BASE_URL}/order/v1/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SAFEPAY_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payment initiation failed");
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracker: result.data.tracker,
        token: result.data.token,
        checkout_url: result.data.checkout_url,
        order_id: paymentData.order_id
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Safepay payment initiation error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Payment initiation failed"
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