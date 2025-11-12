import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';

export function SubscriptionVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const orderId = searchParams.get('order');
  const tracker = searchParams.get('tracker');

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/subscription');
      return;
    }

    const verifyPayment = async () => {
      if (!tracker) {
        setError('Missing payment tracker');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-safepay-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ tracker })
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Payment verification failed');
        }

        if (result.paid) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'completed',
              verified_at: new Date().toISOString()
            })
            .eq('order_id', orderId);

          setVerified(true);
          setTimeout(() => {
            navigate(`/subscription/confirm?order=${orderId}`);
          }, 2000);
        } else {
          setError('Payment not completed yet. Please complete the payment on Safepay.');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [user, orderId, tracker, navigate]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                3
              </div>
              <span className="text-primary font-medium">Verify Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          {loading && (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your payment with Safepay...
                </p>
              </div>
            </>
          )}

          {verified && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Payment Verified!</h1>
                <p className="text-muted-foreground">
                  Your payment has been successfully verified. Redirecting you to confirmation page...
                </p>
              </div>
            </>
          )}

          {error && !loading && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors"
              >
                Retry Verification
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="w-full border border-input hover:bg-accent text-foreground font-medium py-4 px-6 rounded-lg transition-colors"
              >
                Return to Subscription
              </button>
            </>
          )}

          <div className="bg-muted/30 border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-sm">Secure Transaction</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your payment is protected by Safepay's bank-level security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
