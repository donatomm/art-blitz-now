-- Server-only receipt ledger. No catalogue rows, prices or mappings are changed.
CREATE TABLE public.confirmed_orders (
  stripe_session_id text PRIMARY KEY CHECK (stripe_session_id LIKE 'cs_%'),
  stripe_payment_intent_id text NOT NULL UNIQUE CHECK (stripe_payment_intent_id LIKE 'pi_%'),
  livemode boolean NOT NULL,
  amount_total bigint NOT NULL CHECK (amount_total > 0),
  currency text NOT NULL CHECK (currency = 'eur'),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0),
  confirmed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.confirmed_orders ENABLE ROW LEVEL SECURITY;
-- Cloud defaults grant service_role ALL too. Reset before granting append-only.
REVOKE ALL ON public.confirmed_orders FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.confirmed_orders TO service_role;
-- No browser role may read, insert, update or delete receipts. Stripe retains
-- customer/shipping data; this ledger stores references and purchased items.
COMMENT ON TABLE public.confirmed_orders IS
  'Authoritatively verified paid Checkout Sessions; unique session and payment prevent duplicate orders.';
