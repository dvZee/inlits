import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, 
  Crown, 
  Calendar,
  CreditCard,
  ArrowRight,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

export function SubscriptionConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order');

  useEffect(() => {
    const loadTransaction = async () => {
      if (!orderId || !user) {
        setError('Invalid confirmation request');
        setLoading(false);
        return;
      }

      try {
        // Get transaction details
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTransaction(data);

        // Update user's subscription status if payment is completed
        if (data.status === 'completed') {
          const expiryDate = new Date();
          if (data.plan_id === 'weekly') {
            expiryDate.setDate(expiryDate.getDate() + 7);
          } else if (data.plan_id === 'monthly') {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (data.plan_id === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }

          // Update user profile with subscription info
          await supabase
            .from('profiles')
            .update({
              subscription_plan: data.plan_id,
              subscription_status: 'active',
              subscription_expires_at: expiryDate.toISOString()
            })
            .eq('id', user.id);
        }
      } catch (err) {
        console.error('Error loading transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to load confirmation');
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [orderId, user]);

  const plans = {
    weekly: { name: 'Weekly', price: 150, period: 'week' },
    monthly: { name: 'Monthly', price: 399, period: 'month' },
    annual: { name: 'Annual', price: 3600, period: 'year' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Confirmation Error</h1>
          <p className="text-muted-foreground">
            {error || 'We could not confirm your subscription. Please contact support.'}
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const selectedPlan = plans[transaction.plan_id as keyof typeof plans];

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              4
            </div>
            <span className="text-primary font-medium">Confirm</span>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          {/* Success Animation */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to Inlits Premium!</h1>
            <p className="text-muted-foreground">
              Your subscription has been activated successfully. Enjoy unlimited access to all premium content.
            </p>
          </div>

          {/* Subscription Details */}
          <div className="bg-card border rounded-lg p-6 text-left space-y-4">
            <h2 className="font-semibold text-center mb-4">Subscription Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{selectedPlan?.name} Subscription</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">Rs {transaction.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{transaction.payment_method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-sm">{transaction.order_id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Billing:</span>
                <span>
                  {new Date(Date.now() + (
                    selectedPlan?.period === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                    selectedPlan?.period === 'month' ? 30 * 24 * 60 * 60 * 1000 :
                    365 * 24 * 60 * 60 * 1000
                  )).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-4">What's included in your subscription:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Unlimited premium content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Ad-free experience</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>HD quality streaming</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Offline downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Multiple device access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Exploring Premium Content
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/library')}
              className="w-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to My Library
            </button>
          </div>

          {/* Receipt Download */}
          <div className="pt-4 border-t">
            <button className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}