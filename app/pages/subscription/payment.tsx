import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'wallet' | 'card' | 'bank';
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'safepay',
    name: 'Safepay',
    icon: <CreditCard className="w-6 h-6" />,
    type: 'card',
    description: 'Secure checkout with Safepay - Cards, Wallets & More'
  },
  {
    id: 'easypaisa',
    name: 'Easypaisa',
    icon: <Smartphone className="w-6 h-6" />,
    type: 'wallet',
    description: 'Pay with your Easypaisa mobile wallet'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: <Smartphone className="w-6 h-6" />,
    type: 'wallet',
    description: 'Pay with your JazzCash mobile wallet'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-6 h-6" />,
    type: 'card',
    description: 'Visa, Mastercard, and local bank cards'
  },
  {
    id: 'zindigi',
    name: 'Zindigi',
    icon: <Wallet className="w-6 h-6" />,
    type: 'wallet',
    description: 'Pay with your Zindigi digital wallet'
  },
  {
    id: 'upaisa',
    name: 'UPaisa',
    icon: <Smartphone className="w-6 h-6" />,
    type: 'wallet',
    description: 'Pay with your UPaisa mobile wallet'
  }
];

const plans = {
  weekly: { name: 'Weekly', price: 150, period: 'week' },
  monthly: { name: 'Monthly', price: 399, period: 'month' },
  annual: { name: 'Annual', price: 3600, period: 'year', originalPrice: 4788, discount: '25% OFF' }
};

export function SubscriptionPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    mobileNumber: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    cnicNumber: ''
  });

  const planId = searchParams.get('plan') || 'monthly';
  const selectedPlan = plans[planId as keyof typeof plans];

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!selectedPlan) {
      navigate('/subscription');
      return;
    }
  }, [user, selectedPlan, navigate]);

  if (!selectedPlan) {
    return null;
  }

  const originalPlanPrice = 'originalPrice' in selectedPlan ? selectedPlan.originalPrice : null;
  const planDiscountLabel = 'discount' in selectedPlan ? selectedPlan.discount : null;

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const validatePaymentData = () => {
    const method = selectedMethod;
    if (!method) {
      setError('Please select a payment method');
      return false;
    }

    if (method.type === 'wallet') {
      if (!paymentData.mobileNumber) {
        setError('Mobile number is required');
        return false;
      }
      if (!/^03\d{9}$/.test(paymentData.mobileNumber)) {
        setError('Please enter a valid Pakistani mobile number (03XXXXXXXXX)');
        return false;
      }
    }

    if (method.type === 'card') {
      if (!paymentData.cardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
        setError('Please fill in all card details');
        return false;
      }
      if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!user || !selectedPlan || !selectedMethod) return;

    const method = selectedMethod;

    if (method.id === 'safepay') {
      setLoading(true);
      setError(null);

      try {
        const orderId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const safepayRequest = {
          amount: selectedPlan.price * 100,
          currency: "PKR",
          order_id: orderId,
          customer_email: user.email || 'customer@example.com',
          customer_name: user.user_metadata?.full_name || 'Customer',
          source: 'custom'
        };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-safepay-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(safepayRequest)
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Payment initiation failed');
        }

        await supabase
          .from('payment_transactions')
          .insert({
            order_id: orderId,
            user_id: user.id,
            plan_id: planId,
            amount: selectedPlan.price,
            payment_method: 'safepay',
            status: 'pending',
            transaction_id: result.tracker
          });

        if (result.checkout_url) {
          window.location.href = result.checkout_url;
        } else {
          throw new Error('No checkout URL received');
        }

      } catch (err) {
        console.error('Safepay error:', err);
        setError(err instanceof Error ? err.message : 'Payment failed');
        setLoading(false);
      }
      return;
    }

    if (!validatePaymentData()) return;

    setLoading(true);
    setError(null);

    try {
      const orderId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const paymentRequest = {
        basket_id: orderId,
        txnamt: selectedPlan.price,
        customer_email_address: user.email,
        customer_mobile_no: paymentData.mobileNumber || '03001234567',
        order_date: new Date().toISOString().split('T')[0],
        transaction_id: orderId,
        ...(method.type === 'card' && {
          account_type_id: '1',
          card_number: paymentData.cardNumber.replace(/\s/g, ''),
          expiry_month: paymentData.expiryMonth,
          expiry_year: paymentData.expiryYear,
          cvv: paymentData.cvv,
          cnic_number: paymentData.cnicNumber
        }),
        ...(method.type === 'wallet' && {
          account_type_id: method.id === 'easypaisa' ? '2' : '3',
          account_number: paymentData.mobileNumber
        })
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payfast-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(paymentRequest)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          user_id: user.id,
          plan_id: planId,
          amount: selectedPlan.price,
          payment_method: method.id,
          status: 'pending'
        });

      navigate(`/subscription/verify?order=${orderId}&method=${method.id}`);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Steps */}
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
                2
              </div>
              <span className="text-primary font-medium">Payment Method</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Payment Method</h2>
              <p className="text-muted-foreground">Choose how you'd like to pay for your subscription</p>
            </div>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod?.id === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod?.id === method.id && (
                    <div className="flex justify-end">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Payment Details Form */}
            {selectedMethod && selectedMethod.id !== 'safepay' && (
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Payment Details</h3>

                {selectedMethod.type === 'wallet' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        value={paymentData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder="03001234567"
                        maxLength={11}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your {selectedMethod.name} registered mobile number
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod.type === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Month</Label>
                        <select
                          id="expiryMonth"
                          value={paymentData.expiryMonth}
                          onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Year</Label>
                        <select
                          id="expiryYear"
                          value={paymentData.expiryYear}
                          onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year.toString().slice(-2)}>
                                {year.toString().slice(-2)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName">Card Holder Name</Label>
                      <Input
                        id="cardHolderName"
                        value={paymentData.cardHolderName}
                        onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnic">CNIC Number</Label>
                      <Input
                        id="cnic"
                        value={paymentData.cnicNumber}
                        onChange={(e) => handleInputChange('cnicNumber', e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567890123"
                        maxLength={13}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required for verification purposes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bank Card Discount Banner */}
            <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Exclusive Discounts On Bank Cards</h3>
                  <p className="text-sm text-muted-foreground">UPTO 70% Off</p>
                  <button className="text-sm text-primary hover:underline mt-1">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Billing:</span>
                  <span className="font-medium">Every {selectedPlan.period}</span>
                </div>

                {originalPlanPrice !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Original Price:</span>
                    <span className="text-sm text-muted-foreground line-through">
                      Rs {originalPlanPrice.toLocaleString()}
                    </span>
                  </div>
                )}

                {planDiscountLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Discount:</span>
                    <span className="text-sm text-green-600">{planDiscountLabel}</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      Rs {selectedPlan.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-muted/30 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Secure Payment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment information is encrypted and processed securely by PayFast.
                  </p>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pay Rs {selectedPlan.price.toLocaleString()}
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
