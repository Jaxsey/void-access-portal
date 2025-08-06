-- Create enum for key types
CREATE TYPE public.key_type AS ENUM ('daily', 'premium', 'admin');

-- Create premium_keys table for 30-day keys
CREATE TABLE public.premium_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  url_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create admin_keys table for lifetime keys
CREATE TABLE public.admin_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  url_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_admin UUID REFERENCES public.admin_users(id)
);

-- Enable RLS
ALTER TABLE public.premium_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for viewing keys
CREATE POLICY "Premium keys are viewable by everyone" 
ON public.premium_keys 
FOR SELECT 
USING (true);

CREATE POLICY "Admin keys are viewable by everyone" 
ON public.admin_keys 
FOR SELECT 
USING (true);

-- Create functions for generating keys
CREATE OR REPLACE FUNCTION public.generate_premium_key(admin_user_id UUID)
RETURNS TABLE(license_key TEXT, url_path TEXT, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_key TEXT;
    new_path TEXT;
    expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate new premium key
    new_key := 'PM-' || generate_random_string(16);
    new_path := 'premium/' || floor(random() * 9000 + 1000)::TEXT;
    expiry_date := now() + INTERVAL '30 days';
    
    -- Insert new premium key
    INSERT INTO public.premium_keys (license_key, url_path, expires_at)
    VALUES (new_key, new_path, expiry_date);
    
    -- Return new key info
    RETURN QUERY SELECT new_key, new_path, expiry_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_admin_key(admin_user_id UUID)
RETURNS TABLE(license_key TEXT, url_path TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_key TEXT;
    new_path TEXT;
BEGIN
    -- Generate new admin key
    new_key := 'ADM-' || generate_random_string(20);
    new_path := 'admin/' || floor(random() * 9000 + 1000)::TEXT;
    
    -- Insert new admin key
    INSERT INTO public.admin_keys (license_key, url_path, created_by_admin)
    VALUES (new_key, new_path, admin_user_id);
    
    -- Return new key info
    RETURN QUERY SELECT new_key, new_path;
END;
$$;