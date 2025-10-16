import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ResendOTPRequest {
  order_id: string;
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

    const { order_id, transaction_id }: ResendOTPRequest = await req.json();

    if (!order_id || !transaction_id) {
      throw new Error('Missing required parameters');
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

    // Resend OTP
    const resendResponse = await fetch(`${PAYFAST_BASE_URL}/transaction/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      },
      body: new URLSearchParams({
        transaction_id: transaction_id
      })
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(resendResult.status_msg || 'Failed to resend OTP');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP resent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('PayFast resend OTP error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to resend OTP'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});