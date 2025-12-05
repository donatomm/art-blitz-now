-- Create pages table for editable page content
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Public can read all pages
CREATE POLICY "Pages are viewable by everyone"
ON public.pages
FOR SELECT
USING (true);

-- Only admins can insert pages
CREATE POLICY "Admins can insert pages"
ON public.pages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update pages
CREATE POLICY "Admins can update pages"
ON public.pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete pages
CREATE POLICY "Admins can delete pages"
ON public.pages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial page content
INSERT INTO public.pages (slug, title, content) VALUES
('artista', 'L''Artista', '## Chi Sono

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Il Mio Percorso

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

## Ispirazione

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'),

('nota-clienti', 'Nota per i Clienti', 'Contenuto della nota per i clienti da definire.'),

('spedizione', 'Regole di Spedizione', '## Tempi di Consegna

Tutte le opere sono accuratamente imballate e spedite entro 5-7 giorni lavorativi.

- **Italia**: 3-5 giorni lavorativi
- **Europa**: 5-10 giorni lavorativi
- **Internazionale**: 10-21 giorni lavorativi

## Costi di Spedizione

I costi di spedizione sono calcolati al checkout in base alla tua posizione e alle dimensioni dell''opera. Spedizione gratuita per ordini superiori a €500.

## Imballaggio

Ogni pezzo è imballato professionalmente con materiali protettivi per garantire che arrivi in perfette condizioni.

## Resi e Cambi

Vogliamo che tu ami la tua opera. Se per qualsiasi motivo non sei soddisfatto, contattaci entro 14 giorni dalla consegna. Gli ordini personalizzati non sono rimborsabili.'),

('contatti', 'Contatti', '## Contattaci

Hai una domanda sulle nostre opere o vuoi discutere un ordine personalizzato? Ci piacerebbe sentirti.

## Orari

- **Lunedì - Venerdì**: 9:00 - 18:00
- **Sabato**: 10:00 - 16:00
- **Domenica**: Chiuso');