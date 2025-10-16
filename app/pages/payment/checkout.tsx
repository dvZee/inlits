import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { CreditCard, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentItem {
  id: string;
  type: 'book' | 'audiobook' | 'subscription';
  title: string;
  price: number;
  cover_url?: string;
  description?: string;
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentItem, setPaymentItem] = useState<PaymentItem | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const itemId = searchParams.get('item');
  const itemType = searchParams.get('type');

  useEffect(() => {
    const loadPaymentItem = async () => {
      if (!itemId || !itemType) {
        setError('Invalid payment request');
        setLoadingItem(false);
        return;
      }

      try {
        let data, error;

        if (itemType === 'book') {
          ({ data, error } = await supabase
            .from('books')
            .select('id, title, price, cover_url, description')
            .eq('id', itemId)
            .single());
        } else if (itemType === 'audiobook') {
          ({ data, error } = await supabase
            .from('audiobooks')
            .select('id, title, price, cover_url, description')
            .eq('id', itemId)
            .single());
        } else if (itemType === 'subscription') {
          // Handle subscription plans
          data = {
            id: 'pro-monthly',
            title: 'Inlits Pro - Monthly',
            price: 9.99,
            description: 'Access to all premium content and features'
          };
        }

        if (error) throw error;
        if (!data) throw new Error('Item not found');

        setPaymentItem({
          ...data,
          type: itemType as PaymentItem['type']
        });
      } catch (err) {
        console.error('Error loading payment item:', err);
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setLoadingItem(false);
      }
    };

    loadPaymentItem();
  }, [itemId, itemType]);

  const handlePayment = async () => {
    if (!user || !paymentItem) return;

    setLoading(true);
    setError(null);

    try {
      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare payment data
      const paymentData = {
        amount: paymentItem.price,
        itemName: paymentItem.title,
        orderId: orderId,
        customerEmail: user.email,
        returnUrl: `${window.location.origin}/payment/success?order=${orderId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?order=${orderId}`,
        notifyUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-webhook`
      };

      // Call the Edge Function to initiate payment
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payfast-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(paymentData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      // Store payment attempt in database
      await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          user_id: user.id,
          item_id: paymentItem.id,
          item_type: paymentItem.type,
          amount: paymentItem.price,
          status: 'pending',
          payment_method: 'payfast'
        });

      // Redirect to PayFast or submit form
      if (result.formData && result.paymentUrl) {
        // Create and submit form for PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.paymentUrl;
        
        Object.entries(result.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error('Invalid payment response');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !paymentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Payment Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="text-muted-foreground">Please sign in to complete your purchase</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              {paymentItem && (
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex gap-4">
                    {paymentItem.cover_url && (
                      <div className="w-20 h-28 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={paymentItem.cover_url}
                          alt={paymentItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{paymentItem.title}</h3>
                      {paymentItem.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {paymentItem.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <span className="text-lg font-semibold">${paymentItem.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${paymentItem?.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">PayFast</h3>
                    <p className="text-sm text-muted-foreground">Secure payment processing</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !paymentItem}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ${paymentItem?.price} with PayFast
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Secured by PayFast</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-muted/30 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Secure Payment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment information is encrypted and processed securely by PayFast.
                    We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}