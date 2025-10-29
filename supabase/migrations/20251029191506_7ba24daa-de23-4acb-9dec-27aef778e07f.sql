-- Add payment method and receipt path columns to payments table
ALTER TABLE public.payments 
ADD COLUMN payment_method text NOT NULL DEFAULT 'paystack',
ADD COLUMN receipt_path text;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', false);

-- Allow authenticated users to upload their own payment receipts
CREATE POLICY "Users can upload own payment receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own payment receipts
CREATE POLICY "Users can view own payment receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND (auth.uid()::text = (storage.foldername(name))[1] 
       OR has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'secretary'::app_role]))
);

-- Allow admins to view all payment receipts
CREATE POLICY "Admins can view all payment receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'secretary'::app_role])
);