-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  medium TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view products)
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

-- Create app_role enum for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin can manage products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial products
INSERT INTO public.products (name, medium, image_url, sizes, display_order) VALUES
('Ocean Dreams', 'Print on Canvas', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', '[{"label": "S", "dimensions": "40x60", "price": 125}, {"label": "M", "dimensions": "60x90", "price": 175}, {"label": "L", "dimensions": "80x120", "price": 245}]'::jsonb, 0),
('Mountain Serenity', 'Print on Canvas', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', '[{"label": "S", "dimensions": "40x60", "price": 125}, {"label": "M", "dimensions": "60x90", "price": 175}, {"label": "L", "dimensions": "80x120", "price": 245}]'::jsonb, 1),
('Abstract Flow', 'Giclée Print', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', '[{"label": "S", "dimensions": "30x40", "price": 95}, {"label": "M", "dimensions": "50x70", "price": 145}, {"label": "L", "dimensions": "70x100", "price": 195}]'::jsonb, 2),
('Forest Light', 'Print on Canvas', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', '[{"label": "S", "dimensions": "40x60", "price": 125}, {"label": "M", "dimensions": "60x90", "price": 175}, {"label": "L", "dimensions": "80x120", "price": 245}]'::jsonb, 3),
('City Nights', 'Print on Aluminum', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', '[{"label": "S", "dimensions": "40x60", "price": 165}, {"label": "M", "dimensions": "60x90", "price": 225}, {"label": "L", "dimensions": "80x120", "price": 295}]'::jsonb, 4),
('Golden Hour', 'Print on Canvas', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', '[{"label": "S", "dimensions": "40x60", "price": 125}, {"label": "M", "dimensions": "60x90", "price": 175}, {"label": "L", "dimensions": "80x120", "price": 245}]'::jsonb, 5);