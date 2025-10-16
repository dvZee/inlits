import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          {/* Cancel Icon */}
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Cancel Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          {/* Order Info */}
          {orderId && (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Return Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@inlits.com" className="text-primary hover:underline">
                support@inlits.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}