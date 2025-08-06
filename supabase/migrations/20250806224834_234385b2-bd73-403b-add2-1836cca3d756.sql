-- Create proper admin user with correctly hashed password
-- First generate a proper bcrypt hash using PostgreSQL's extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clear and insert the final admin user
DELETE FROM public.admin_users;
INSERT INTO public.admin_users (username, password_hash) VALUES 
  ('jax', crypt('xaj12', gen_salt('bf', 10)));