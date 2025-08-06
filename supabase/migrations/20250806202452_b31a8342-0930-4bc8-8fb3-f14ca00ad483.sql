-- Fix security warnings by adding search_path parameter to functions
DROP FUNCTION IF EXISTS generate_random_string(INTEGER);
DROP FUNCTION IF EXISTS get_or_create_daily_key();
DROP FUNCTION IF EXISTS log_key_access(TEXT, TEXT);

-- Function to generate random string with security_definer and search_path
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER) 
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to get or create daily key with security_definer and search_path
CREATE OR REPLACE FUNCTION get_or_create_daily_key()
RETURNS TABLE(license_key TEXT, url_path TEXT, date TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to log key access with security_definer and search_path
CREATE OR REPLACE FUNCTION log_key_access(ip_addr TEXT, user_agent_val TEXT)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.key_access_logs (ip_address, user_agent)
    VALUES (ip_addr, user_agent_val);
END;
$$;