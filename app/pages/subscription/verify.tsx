import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ArrowRight, 
  Smartphone,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SubscriptionVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const orderId = searchParams.get('order');
  const paymentMethod = searchParams.get('method');

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/subscription');
      return;
    }
  }, [user, orderId, navigate]);

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call PayFast API to verify OTP and complete transaction
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payfast-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            order_id: orderId,
            otp: otp,
            transaction_id: orderId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed');
      }

      // Update payment status in database
      await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          verified_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      // Navigate to confirmation page
      navigate(`/subscription/confirm?order=${orderId}`);

    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      // Call API to resend OTP
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-payfast-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            order_id: orderId,
            transaction_id: orderId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend OTP');
      }

      // Reset countdown
      setCountdown(60);
      setCanResend(false);

    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                3
              </div>
              <span className="text-primary font-medium">Verify</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Payment</h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit OTP to your {paymentMethod} account. Please enter it below to complete your subscription.
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {formatTime(countdown)}
                </p>
              )}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify & Complete Payment
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Security Notice */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-sm">Secure Transaction</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your payment is protected by bank-level security. The OTP ensures only you can complete this transaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}