import React, { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '@/lib/auth';
import { Check, ArrowRight, Crown, Zap, Users, BookOpen, Headphones, Star, Shield } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'weekly' | 'monthly' | 'annual';
  originalPrice?: number;
  discount?: string;
  features: string[];
  popular?: boolean;
  description: string;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'weekly',
    name: 'Weekly',
    price: 150,
    period: 'weekly',
    description: 'Perfect for trying out premium features',
    features: [
      'Unlimited audiobooks and podcasts',
      'High-quality audio streaming',
      'Listen on up to 2 devices',
      'Ad-free experience',
      'Premium content library'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 399,
    period: 'monthly',
    description: 'Most popular choice for regular users',
    popular: true,
    features: [
      'Unlimited audiobooks and podcasts',
      'High-quality audio streaming',
      'Listen on up to 5 devices',
      'Ad-free experience',
      'Premium content library',
      'Offline downloads',
      'Priority customer support'
    ]
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 3600,
    originalPrice: 4788,
    discount: '25% OFF',
    period: 'annual',
    description: 'Best value with maximum savings',
    features: [
      'Unlimited audiobooks and podcasts',
      'High-quality audio streaming',
      'Listen on up to 5 devices',
      'Ad-free experience',
      'Premium content library',
      'Offline downloads',
      'Priority customer support',
      'Exclusive content access',
      'Early access to new features'
    ]
  }
];

export function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(plans[1]); // Default to monthly
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!user) {
      navigate('/signin', { 
        state: { 
          from: { pathname: '/subscription' },
          message: 'Please sign in to continue with your subscription'
        }
      });
      return;
    }

    // Navigate to payment method selection
    navigate(`/subscription/payment?plan=${selectedPlan.id}`);
  };

  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString()}`;
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'weekly': return 'per week';
      case 'monthly': return 'per month';
      case 'annual': return 'per year';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                1
              </div>
              <span className="text-primary font-medium">Select Package</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="w-16 h-px bg-border"></div>
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm">2</div>
              <span>Payment Method</span>
              <div className="w-16 h-px bg-border"></div>
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm">3</div>
              <span>Verify</span>
              <div className="w-16 h-px bg-border"></div>
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm">4</div>
              <span>Confirm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock unlimited access to premium content and features
          </p>
        </div>

        {/* Plan Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <button className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium">
              Packages
            </button>
            <button className="px-6 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              Promotional Packages
            </button>
            <button className="px-6 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              Promo Code
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                selectedPlan.id === plan.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-input hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full z-10">
                  Most Popular
                </div>
              )}
              
              {plan.discount && (
                <div className="absolute -top-3 right-4 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  {plan.discount}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {formatPrice(plan.originalPrice)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedPlan.id === plan.id && (
                <div className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none">
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>


        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full max-w-md mx-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            You can cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}