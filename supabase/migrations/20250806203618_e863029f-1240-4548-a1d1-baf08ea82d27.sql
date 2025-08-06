-- Create the missing trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create admin_users table with proper password hashing
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin_sessions table for proper session management
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
END;
$$;

-- Create function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(token TEXT)
RETURNS TABLE(admin_id UUID, username TEXT, valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Insert demo admin user (password: admin123)
-- Using a simple bcrypt-compatible hash for testing
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Create policies for admin_users (very restrictive)
CREATE POLICY "Admin users are not publicly accessible" 
ON public.admin_users 
FOR ALL 
USING (false);

-- Create policies for admin_sessions (very restrictive)
CREATE POLICY "Admin sessions are not publicly accessible" 
ON public.admin_sessions 
FOR ALL 
USING (false);

-- Create updated trigger for admin_users
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();