import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentStepProps {
  manuscriptId: string;
  amount?: number;
  currency?: string;
  onPaymentComplete: () => void;
}

export function PaymentStep({ 
  manuscriptId, 
  amount = 50000, 
  currency = "NGN",
  onPaymentComplete 
}: PaymentStepProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  const initializePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          manuscriptId,
          amount,
          currency,
        },
      });

      if (error) throw error;

      if (data.authorization_url) {
        // Open Paystack payment page
        const paymentWindow = window.open(
          data.authorization_url,
          'Paystack Payment',
          'width=600,height=700'
        );

        // Poll for payment completion
        const pollInterval = setInterval(async () => {
          if (paymentWindow?.closed) {
            clearInterval(pollInterval);
            await verifyPayment(data.reference);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error(error.message || 'Failed to initialize payment');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference },
      });

      if (error) throw error;

      if (data.status === 'success') {
        setPaymentStatus('completed');
        toast.success('Payment successful! Your manuscript has been submitted.');
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast.error('Payment was not completed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
      setPaymentStatus('failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Article Processing Charge (APC)
        </CardTitle>
        <CardDescription>
          Complete payment to submit your manuscript for review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary/20 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Processing Fee:</span>
            <span className="text-2xl font-bold text-primary">
              {currency} {amount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            This fee covers the peer review process, editing, and publication of your article.
          </p>
        </div>

        {paymentStatus === 'completed' && (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">Payment completed successfully!</span>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">Payment failed. Please try again.</span>
          </div>
        )}

        <Button
          onClick={initializePayment}
          disabled={loading || paymentStatus === 'completed'}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>Processing...</>
          ) : paymentStatus === 'completed' ? (
            <>Payment Completed</>
          ) : (
            <>Proceed to Payment</>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secured by Paystack. Your payment information is encrypted and secure.
        </p>
      </CardContent>
    </Card>
  );
}
