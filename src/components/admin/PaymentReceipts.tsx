import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_date: string;
  paystack_reference: string;
  manuscript_id: string;
}

interface PaymentReceiptsProps {
  payments: Payment[];
}

export function PaymentReceipts({ payments }: PaymentReceiptsProps) {
  const generateReceipt = (payment: Payment) => {
    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-size: 1.5em; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>African Journal of Veterinary Sciences</h1>
          <h2>Payment Receipt</h2>
        </div>
        <div class="receipt-details">
          <div class="detail-row">
            <span>Receipt #:</span>
            <span>${payment.paystack_reference || payment.id}</span>
          </div>
          <div class="detail-row">
            <span>Date:</span>
            <span>${new Date(payment.payment_date).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span>Description:</span>
            <span>Article Processing Charge</span>
          </div>
          <div class="detail-row total">
            <span>Total:</span>
            <span>${payment.currency} ${payment.amount.toLocaleString()}</span>
          </div>
        </div>
        <p style="margin-top: 40px; text-align: center; color: #666;">
          Thank you for your payment. This receipt is auto-generated.
        </p>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.paystack_reference || payment.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded");
  };

  const generateInvoice = (payment: Payment) => {
    // Similar to receipt but formatted as invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
          .total { font-size: 1.5em; font-weight: bold; margin-top: 20px; background: #f5f5f5; padding: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>African Journal of Veterinary Sciences</p>
        </div>
        <div class="invoice-details">
          <div class="detail-row">
            <span>Invoice #:</span>
            <span>INV-${payment.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span>Date Issued:</span>
            <span>${new Date(payment.payment_date).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span>Payment Reference:</span>
            <span>${payment.paystack_reference || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span>Service:</span>
            <span>Article Processing Charge (APC)</span>
          </div>
          <div class="detail-row total">
            <span>Total Amount:</span>
            <span>${payment.currency} ${payment.amount.toLocaleString()}</span>
          </div>
        </div>
        <p style="margin-top: 40px; color: #666;">
          Status: <strong>PAID</strong><br>
          Payment Date: ${new Date(payment.payment_date).toLocaleString()}
        </p>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${payment.id.slice(0, 8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Invoice downloaded");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Receipts & Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No payments found</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.payment_date).toLocaleDateString()} • 
                    {payment.paystack_reference && ` Ref: ${payment.paystack_reference}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateReceipt(payment)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateInvoice(payment)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}