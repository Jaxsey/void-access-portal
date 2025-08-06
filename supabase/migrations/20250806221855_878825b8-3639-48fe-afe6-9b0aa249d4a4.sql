-- Insert admin users with hashed passwords
-- Password for 'Jaxe' is 'Jax2003!' 
-- Password for 'skol' is 'simingay'
INSERT INTO public.admin_users (username, password_hash) VALUES 
('Jaxe', '$2b$10$8K8VeB1qVxQz7N4nF2mGJeKxVf9m6X.Yr8fQwEcKzLpNvRtUhG9zW'),
('skol', '$2b$10$rN3mF7vCqPzH2nKxG5jM1.Qm9WrYtEzVfXcLp8bKaJhGnUtRvF6qO')
ON CONFLICT (username) DO NOTHING;