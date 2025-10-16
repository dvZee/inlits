import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PaymentRequest {
  basket_id: string;
  txnamt: number;
  customer_email_address: string;
  customer_mobile_no: string;
  order_date: string;
  transaction_id: string;
  account_type_id?: string;
  // Card specific fields
  card_number?: string;
  expiry_month?: string;
  expiry_year?: string;
  cvv?: string;
  cnic_number?: string;
  // Wallet specific fields
  account_number?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get PayFast credentials from environment
    const PAYFAST_MERCHANT_ID = Deno.env.get('PAYFAST_MERCHANT_ID');
    const PAYFAST_SECURED_KEY = Deno.env.get('PAYFAST_SECURED_KEY');
    const PAYFAST_BASE_URL = Deno.env.get('PAYFAST_BASE_URL') || 'https://sandbox.payfast.pk/api/v1';

    if (!PAYFAST_MERCHANT_ID || !PAYFAST_SECURED_KEY) {
      throw new Error('PayFast environment variables are not set');
    }

    const paymentData: PaymentRequest = await req.json();

    // Validate required fields
    const requiredFields = ['basket_id', 'txnamt', 'customer_email_address', 'customer_mobile_no', 'order_date', 'transaction_id'];
    for (const field of requiredFields) {
      if (!paymentData[field as keyof PaymentRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // First, get access token (you'll need to implement this based on PayFast auth docs)
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

    // Prepare transaction payload
    const transactionPayload = {
      basket_id: paymentData.basket_id,
      txnamt: paymentData.txnamt.toString(),
      customer_email_address: paymentData.customer_email_address,
      customer_mobile_no: paymentData.customer_mobile_no,
      account_type_id: paymentData.account_type_id || '3', // Default to wallet
      order_date: paymentData.order_date,
      otp_required: 'yes',
      recurring_txn: 'no',
      transaction_id: paymentData.transaction_id,
      // Add payment method specific fields
      ...(paymentData.card_number && {
        card_number: paymentData.card_number,
        expiry_month: paymentData.expiry_month,
        expiry_year: paymentData.expiry_year,
        cvv: paymentData.cvv
      }),
      ...(paymentData.account_number && {
        account_number: paymentData.account_number
      }),
      ...(paymentData.cnic_number && {
        cnic_number: paymentData.cnic_number
      })
    };

    // Initiate transaction with PayFast
    const transactionResponse = await fetch(`${PAYFAST_BASE_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      },
      body: new URLSearchParams(transactionPayload)
    });

    const transactionResult = await transactionResponse.json();

    if (!transactionResponse.ok) {
      throw new Error(transactionResult.status_msg || 'Transaction initiation failed');
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionResult.transaction_id,
        status_code: transactionResult.status_code,
        status_msg: transactionResult.status_msg,
        basket_id: transactionResult.basket_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('PayFast payment initiation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment initiation failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});