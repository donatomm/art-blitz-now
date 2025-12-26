-- Create table for master/default prices (Listino Prezzi)
CREATE TABLE public.default_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dimension TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.default_prices ENABLE ROW LEVEL SECURITY;

-- Everyone can view default prices
CREATE POLICY "Default prices are viewable by everyone" 
ON public.default_prices 
FOR SELECT 
USING (true);

-- Only admins can insert default prices
CREATE POLICY "Admins can insert default prices" 
ON public.default_prices 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update default prices
CREATE POLICY "Admins can update default prices" 
ON public.default_prices 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete default prices
CREATE POLICY "Admins can delete default prices" 
ON public.default_prices 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_default_prices_updated_at
BEFORE UPDATE ON public.default_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Populate with existing SKU prices based on current products data
INSERT INTO public.default_prices (dimension, price) VALUES
  ('40x40', 44),
  ('60x40', 53),
  ('75x50', 70),
  ('60x60', 70),
  ('80x80', 95),
  ('90x60', 99),
  ('80x60', 71),
  ('100x75', 112),
  ('120x80', 129),
  ('120x60', 129)
ON CONFLICT (dimension) DO NOTHING;