import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, BookOpen, Headphones, ArrowRight, AlertCircle, Library } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !user) {
        setError('Invalid payment verification');
        setLoading(false);
        return;
      }

      try {
        // Check transaction status in database
        const { data, error } = await supabase
          .from('payment_transactions')
          .select(`
            *,
            item:books(title, cover_url, file_url),
            audiobook:audiobooks(title, cover_url)
          `)
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setTransaction(data);

        // If payment is successful, grant access to the content
        if (data.status === 'completed') {
          // Add to user's library automatically
          await supabase
            .from('reading_status')
            .upsert({
              user_id: user.id,
              content_id: data.item_id,
              content_type: data.item_type,
              status: 'want_to_consume'
            });
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err instanceof Error ? err.message : 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold">Payment Verification Failed</h1>
          <p className="text-muted-foreground">
            {error || 'We could not verify your payment. Please contact support if you were charged.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'audiobook':
        return <Headphones className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getAccessUrl = () => {
    switch (transaction.item_type) {
      case 'book':
        return `/reader/book-${transaction.item_id}`;
      case 'audiobook':
        return `/player/audiobook-${transaction.item_id}`;
      default:
        return '/library';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your content is now available in your library.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-card border rounded-lg p-6 text-left">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-sm">{transaction.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">${transaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span>PayFast</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {transaction.status === 'completed' ? 'Completed' : 'Processing'}
                </span>
              </div>
            </div>
          </div>

          {/* Purchased Item */}
          {(transaction.item || transaction.audiobook) && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Your Purchase</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted">
                  {(transaction.item?.cover_url || transaction.audiobook?.cover_url) ? (
                    <img
                      src={transaction.item?.cover_url || transaction.audiobook?.cover_url}
                      alt={transaction.item?.title || transaction.audiobook?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getContentIcon(transaction.item_type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">
                    {transaction.item?.title || transaction.audiobook?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {transaction.item_type}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getAccessUrl()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {getContentIcon(transaction.item_type)}
              {transaction.item_type === 'audiobook' ? 'Listen Now' : 'Read Now'}
            </Link>
            
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Library className="w-5 h-5" />
              Go to Library
            </Link>
          </div>

          {/* Download Option */}
          {transaction.item?.file_url && (
            <div className="pt-4 border-t">
              <a
                href={transaction.item.file_url}
                download
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
