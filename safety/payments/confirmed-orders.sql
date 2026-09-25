-- Run only against a disposable local/test DB after the migration.
BEGIN;
DO $$
BEGIN
  IF has_table_privilege('anon', 'public.confirmed_orders', 'SELECT,INSERT,UPDATE,DELETE')
    OR has_table_privilege('authenticated', 'public.confirmed_orders', 'SELECT,INSERT,UPDATE,DELETE') THEN
    RAISE EXCEPTION 'Browser roles must not access receipts';
  END IF;
  IF NOT has_table_privilege('service_role', 'public.confirmed_orders', 'SELECT,INSERT')
    OR has_table_privilege('service_role', 'public.confirmed_orders', 'UPDATE,DELETE') THEN
    RAISE EXCEPTION 'Receipt service must be append-only';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.confirmed_orders'::regclass) THEN
    RAISE EXCEPTION 'RLS is required';
  END IF;
END $$;

SET LOCAL ROLE service_role;
INSERT INTO public.confirmed_orders VALUES
  ('cs_test_sqlcheck', 'pi_sqlcheck', false, 5900, 'eur',
   '[{"artwork_id":"test-art","name":"Test artwork","dimensions":"40x60","quantity":1,"amount_total":5900}]', now());
INSERT INTO public.confirmed_orders VALUES
  ('cs_test_sqlcheck', 'pi_sqlcheck', false, 5900, 'eur',
   '[{"artwork_id":"test-art","name":"Test artwork","dimensions":"40x60","quantity":1,"amount_total":5900}]', now())
ON CONFLICT (stripe_session_id) DO NOTHING;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.confirmed_orders WHERE stripe_session_id='cs_test_sqlcheck') <> 1 THEN
    RAISE EXCEPTION 'Duplicate receipt';
  END IF;
  BEGIN
    INSERT INTO public.confirmed_orders VALUES ('cs_test_second', 'pi_sqlcheck', false, 5900, 'eur', '[{}]', now());
    RAISE EXCEPTION 'Duplicate payment was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.confirmed_orders VALUES ('cs_test_invalid', 'pi_invalid', false, 0, 'eur', '[{}]', now());
    RAISE EXCEPTION 'Zero amount was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
ROLLBACK;
