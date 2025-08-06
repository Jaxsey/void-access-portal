-- Insert admin users directly
INSERT INTO public.admin_users (username, password_hash) VALUES 
  ('Jaxe', crypt('Jax2003!', gen_salt('bf', 10))),
  ('skol', crypt('siminisgay!', gen_salt('bf', 10)))
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;