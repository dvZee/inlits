import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Lock,
  Copy,
  UploadCloud,
  FileImage,
  X
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'wallet' | 'bank';
  description: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    type: 'wallet',
    description: 'Transfer manually to our JazzCash account',
    accountName: 'Muhammad zaheer',
    accountNumber: '03284840271'
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    type: 'wallet',
    description: 'Transfer manually to our NayaPay account',
    accountName: 'Muhammad zaheer',
    accountNumber: '03284840271'
  },
  {
    id: 'bank',
    name: 'Bank Transfer (Meezan Bank)',
    type: 'bank',
    description: 'Transfer manually to our Meezan Bank account',
    bankName: 'Meezan Bank',
    accountName: 'MUHAMMAD ZAHEER',
    accountNumber: '11590106390893',
    iban: 'PK78MEZN0011590106390893'
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCopy = (text: string, fieldId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, or WEBP)');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setScreenshotFile(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePayment = async () => {
    if (!user || !selectedPlan || !selectedMethod) return;
    if (!screenshotFile) {
      setError('Please upload a screenshot of your payment receipt.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload screenshot to Supabase Storage (using message-images bucket)
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `payment-proofs/${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-images')
        .upload(filePath, screenshotFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-images')
        .getPublicUrl(filePath);

      // 3. Insert Transaction into Database
      const orderId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: dbError } = await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          user_id: user.id,
          plan_id: planId,
          amount: selectedPlan.price,
          payment_method: selectedMethod.id,
          status: 'pending',
          transaction_id: publicUrl // public url of the payment screenshot proof
        });

      if (dbError) throw dbError;

      // 4. Redirect to confirmation page
      navigate(`/subscription/confirm?order=${orderId}`);

    } catch (err) {
      console.error('Manual payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
              <p className="text-muted-foreground">Transfer manually and upload a screenshot receipt</p>
            </div>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setSelectedMethod(method);
                    handleRemoveFile();
                    setError(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    selectedMethod?.id === method.id
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-input hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{method.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod?.id === method.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedMethod && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">Transfer Details</h3>
                  <p className="text-xs text-muted-foreground">Please send the exact subscription amount to this account:</p>
                </div>

                <div className="bg-muted/40 border border-border/50 rounded-xl p-5 space-y-4">
                  {/* Account Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-border/60 pb-3">
                    <span className="text-xs text-muted-foreground font-medium">Account Title</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground uppercase">{selectedMethod.accountName}</span>
                      <button
                        onClick={() => handleCopy(selectedMethod.accountName, 'name')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Copy Account Title"
                      >
                        {copiedField === 'name' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-border/60 pb-3">
                    <span className="text-xs text-muted-foreground font-medium">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-foreground">{selectedMethod.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(selectedMethod.accountNumber, 'number')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedField === 'number' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* IBAN (if bank) */}
                  {selectedMethod.iban && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-border/60 pb-3">
                      <span className="text-xs text-muted-foreground font-medium">IBAN</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-foreground break-all">{selectedMethod.iban}</span>
                        <button
                          onClick={() => handleCopy(selectedMethod.iban!, 'iban')}
                          className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors flex-shrink-0"
                          title="Copy IBAN"
                        >
                          {copiedField === 'iban' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bank Name (if bank) */}
                  {selectedMethod.bankName && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Bank</span>
                      <span className="font-semibold text-foreground">{selectedMethod.bankName}</span>
                    </div>
                  )}
                </div>

                {/* Screenshot Uploader */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Upload Screenshot Proof
                  </Label>
                  
                  {!screenshotPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-amber-500/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-muted/10 flex flex-col items-center justify-center gap-2 group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold">Click to upload screenshot</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        JPG, PNG, or WEBP. Make sure the reference number and transfer amount are visible.
                      </p>
                    </div>
                  ) : (
                    <div className="relative border border-border rounded-xl p-4 bg-muted/20 flex flex-col items-center gap-3">
                      <button 
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="w-full max-h-48 overflow-hidden rounded-lg border flex items-center justify-center bg-black">
                        <img 
                          src={screenshotPreview} 
                          alt="Screenshot Receipt Preview" 
                          className="max-w-full max-h-48 object-contain"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground self-start">
                        <FileImage className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold break-all text-foreground">
                          {screenshotFile?.name}
                        </span>
                        <span>({((screenshotFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
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
                    <span className="text-sm text-green-600 font-semibold">{planDiscountLabel}</span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-amber-500">
                      Rs {selectedPlan.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-muted/30 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Verification Security</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your manual payment receipt is private and handled securely by the Inlits admin support team.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || !screenshotFile || loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md shadow-amber-500/10 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Receipt...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Submit Payment Proof
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
