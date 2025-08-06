-- Create function to verify admin password using crypt
CREATE OR REPLACE FUNCTION public.verify_admin_password(input_username text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    stored_hash text;
BEGIN
    SELECT password_hash INTO stored_hash
    FROM public.admin_users
    WHERE username = input_username;
    
    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;
    
    -- Use crypt to verify password
    RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$;