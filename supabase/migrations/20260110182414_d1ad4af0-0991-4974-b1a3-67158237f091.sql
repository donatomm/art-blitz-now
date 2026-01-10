-- Allow anyone to view site settings (navigation items, hero settings, etc.)
CREATE POLICY "Anyone can view site settings" 
  ON site_settings 
  FOR SELECT 
  USING (true);