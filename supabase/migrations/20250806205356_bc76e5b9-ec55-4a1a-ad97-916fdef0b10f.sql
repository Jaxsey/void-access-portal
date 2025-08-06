-- Update the get_or_create_daily_key function to generate key/XXXX format
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
$function$