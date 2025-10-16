import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyRequest {
  order_id: string;
  otp: string;
  transaction_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAYFAST_MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
    const PAYFAST_SECURED_KEY = Deno.env.get('PAYFAST_SECURED_KEY');
    const PAYFAST_BASE_URL = Deno.env.get('PAYFAST_BASE_URL') || 'https://sandbox.payfast.pk/api/v1';

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_SECURED_KEY) {
      throw new Error('PayFast environment variables are not set');
    }

    const { order_id, otp, transaction_id }: VerifyRequest = await req.json();

    if (!order_id || !otp || !transaction_id) {
      throw new Error('Missing required verification parameters');
    }

    // Get access token
    const authResponse = await fetch(`${PAYFAST_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        merchant_id: PAYFAST_MERCHANT_ID,
        secured_key: PAYFAST_SECURED_KEY,
        grant_type: 'client_credentials'
      })
    });

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with PayFast');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Verify OTP and complete transaction
    const verifyResponse = await fetch(`${PAYFAST_BASE_URL}/transaction/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      },
      body: new URLSearchParams({
        transaction_id: transaction_id,
        otp: otp
      })
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResponse.ok) {
      throw new Error(verifyResult.status_msg || 'OTP verification failed');
    }

    // Check if transaction was successful
    if (verifyResult.status_code === '00' || verifyResult.status_code === 'SUCCESS') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          transaction_id: verifyResult.transaction_id,
          message: 'Payment verified successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      throw new Error(verifyResult.status_msg || 'Payment verification failed');
    }

  } catch (error) {
    console.error('PayFast verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Verification failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});