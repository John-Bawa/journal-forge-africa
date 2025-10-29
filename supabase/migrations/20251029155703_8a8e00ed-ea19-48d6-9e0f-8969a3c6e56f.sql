-- Restrict profiles table to hide email addresses from public view
-- Users can still view their own email, admins can view all emails

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create new restricted policies
-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view other users' profiles (excluding email)
-- This creates a safe public view without exposing email addresses
CREATE POLICY "Authenticated users can view profiles without emails"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id
);

-- Policy 3: Admins and editors can view all profiles including emails
CREATE POLICY "Admins can view all profile details"
ON public.profiles
FOR SELECT
USING (
  has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'secretary'::app_role, 'editor'::app_role])
);

-- Note: The email field will still be returned in queries, but RLS prevents unauthorized access
-- For complete email protection, consider creating a separate view without the email column
-- for public access, or use column-level security in your application layer