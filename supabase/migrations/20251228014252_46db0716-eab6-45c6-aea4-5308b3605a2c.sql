-- Add Hello Bar settings
INSERT INTO public.site_settings (key, value) VALUES
  ('hellobar_enabled', 'true'),
  ('hellobar_text', '"SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!"'),
  ('hellobar_text_color', '"#FFFFFF"'),
  ('hellobar_bg_color', '"#16A34A"'),
  ('hellobar_countdown_enabled', 'true'),
  ('hellobar_countdown_end', '"2025-01-01T00:00:00"'),
  ('hellobar_countdown_text_color', '"#FFFFFF"'),
  ('hellobar_countdown_bg_color', '"#15803D"'),
  ('hellobar_button_text', '"Dettagli"'),
  ('hellobar_button_text_color', '"#16A34A"'),
  ('hellobar_button_bg_color', '"#FFFFFF"'),
  ('hellobar_button_border_color', '"#FFFFFF"')
ON CONFLICT (key) DO NOTHING;