-- Add the new templates to the database so the Foreign Key constraint is satisfied

INSERT INTO templates (id, name, config) VALUES 
('template-modern', 'Modern Tech', '{"style": "dark", "font": "inter"}'),
('template-classic', 'Classic Corporate', '{"style": "light", "font": "serif"}'),
('template-creative', 'Creative Startup', '{"style": "vibrant", "font": "rounded"}')
ON CONFLICT (id) DO NOTHING;
