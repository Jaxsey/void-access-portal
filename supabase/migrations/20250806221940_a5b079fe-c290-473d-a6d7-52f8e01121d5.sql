-- Fix security warnings: set search_path for all functions
CREATE OR REPLACE FUNCTION public.generate_random_string(length integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_key_access(ip_addr text, user_agent_val text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.key_access_logs (ip_address, user_agent)
    VALUES (ip_addr, user_agent_val);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_admin_session(token text)
 RETURNS TABLE(admin_id uuid, username text, valid boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clean up expired sessions first
  PERFORM cleanup_expired_admin_sessions();
  
  -- Return session validation result
  RETURN QUERY
  SELECT 
    au.id as admin_id,
    au.username,
    true as valid
  FROM public.admin_sessions asess
  JOIN public.admin_users au ON asess.admin_id = au.id
  WHERE asess.session_token = token
    AND asess.expires_at > now()
  LIMIT 1;
  
  -- If no valid session found, return invalid result
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID as admin_id, NULL::TEXT as username, false as valid;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_or_create_daily_key()
 RETURNS TABLE(license_key text, url_path text, date text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
        -- Generate new key and path with key/ format
        new_key := 'SM-' || generate_random_string(16);
        new_path := 'key/' || floor(random() * 9000 + 1000)::TEXT;
        
        -- Insert new daily key
        INSERT INTO public.daily_keys (license_key, url_path, date)
        VALUES (new_key, new_path, CURRENT_DATE);
        
        -- Return new key
        RETURN QUERY SELECT new_key, new_path, CURRENT_DATE::TEXT;
    END IF;
END;
$function$;