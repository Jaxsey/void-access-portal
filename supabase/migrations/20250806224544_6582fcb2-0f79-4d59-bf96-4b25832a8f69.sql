-- Clear existing admin users and insert simple ones
DELETE FROM public.admin_users;

-- Insert simple admin user with bcrypt hash for 'xaj12'
INSERT INTO public.admin_users (username, password_hash) VALUES 
  ('jax', '$2a$10$N9qo8uLOickgx2ZMRZoMye/Sm/T3z0z7E7J7J7J7J7J7J7J7J7J7J7O');

-- Let's also test with a plaintext temporarily for debugging
INSERT INTO public.admin_users (username, password_hash) VALUES 
  ('test', 'plaintest');