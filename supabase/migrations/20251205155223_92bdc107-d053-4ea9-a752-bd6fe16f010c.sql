-- Add deal label fields to products table
ALTER TABLE public.products 
ADD COLUMN deal_label_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN deal_label_text text NOT NULL DEFAULT 'OFFERTA DEL GIORNO, scade h20:00';