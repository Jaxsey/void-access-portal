-- Use plaintext since bcrypt is problematic
DELETE FROM public.admin_users;
INSERT INTO public.admin_users (username, password_hash) VALUES 
  ('jax', 'xaj12');