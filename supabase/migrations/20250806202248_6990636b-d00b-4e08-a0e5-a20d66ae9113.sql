-- Create daily_keys table
CREATE TABLE IF NOT EXISTS public.daily_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL UNIQUE,
  url_path TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create key_access_logs table  
CREATE TABLE IF NOT EXISTS public.key_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Daily keys are viewable by everyone" 
ON public.daily_keys 
FOR SELECT 
USING (true);

CREATE POLICY "Key access logs can be inserted by everyone" 
ON public.key_access_logs 
FOR INSERT 
WITH CHECK (true);

-- Function to generate random string
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER) 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create daily key
CREATE OR REPLACE FUNCTION get_or_create_daily_key()
RETURNS TABLE(license_key TEXT, url_path TEXT, date TEXT) AS $$
DECLARE
    existing_key RECORD;
    new_key TEXT;
    new_path TEXT;
BEGIN
    -- Check if today's key exists
    SELECT dk.license_key, dk.url_path, dk.date::TEXT INTO existing_key
    FROM public.daily_keys dk
    WHERE dk.date = CURRENT_DATE
    LIMIT 1;
    
    IF existing_key IS NOT NULL THEN
        -- Return existing key
        RETURN QUERY SELECT existing_key.license_key, existing_key.url_path, existing_key.date;
    ELSE
        -- Generate new key and path
        new_key := 'SM-' || generate_random_string(16);
        new_path := 'key' || floor(random() * 9000 + 1000)::TEXT;
        
        -- Insert new daily key
        INSERT INTO public.daily_keys (license_key, url_path, date)
        VALUES (new_key, new_path, CURRENT_DATE);
        
        -- Return new key
        RETURN QUERY SELECT new_key, new_path, CURRENT_DATE::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log key access
CREATE OR REPLACE FUNCTION log_key_access(ip_addr TEXT, user_agent_val TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.key_access_logs (ip_address, user_agent)
    VALUES (ip_addr, user_agent_val);
END;
$$ LANGUAGE plpgsql;