ALTER TABLE public.withdrawals ADD COLUMN bank_name text NOT NULL DEFAULT '';

CREATE TABLE public.wallet_point_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference text NOT NULL UNIQUE,
  pack_id text NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  points bigint NOT NULL CHECK (points > 0),
  currency text NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  provider_transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT ALL ON public.wallet_point_purchases TO service_role;
ALTER TABLE public.wallet_point_purchases ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.initialize_member_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallet_accounts(user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.initialize_member_wallet() FROM PUBLIC;
CREATE TRIGGER fmie_wallet_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.initialize_member_wallet();
INSERT INTO public.wallet_accounts(user_id) SELECT id FROM auth.users ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.settle_wallet_point_purchase(
  _reference text,
  _amount_minor bigint,
  _currency text,
  _provider_transaction_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase public.wallet_point_purchases%ROWTYPE;
BEGIN
  SELECT * INTO v_purchase FROM public.wallet_point_purchases WHERE reference = _reference FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF v_purchase.amount_minor <> _amount_minor OR v_purchase.currency <> _currency OR _currency <> 'NGN' THEN
    RETURN false;
  END IF;
  IF v_purchase.status = 'succeeded' THEN
    RETURN true;
  END IF;
  IF v_purchase.status <> 'pending' OR _provider_transaction_id IS NULL OR length(_provider_transaction_id) = 0 THEN
    RETURN false;
  END IF;

  INSERT INTO public.wallet_accounts(user_id) VALUES (v_purchase.user_id) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.wallet_accounts SET points = points + v_purchase.points, updated_at = now() WHERE user_id = v_purchase.user_id;
  UPDATE public.wallet_point_purchases
    SET status = 'succeeded', provider_transaction_id = _provider_transaction_id, paid_at = now()
    WHERE id = v_purchase.id;
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (v_purchase.user_id, 'paystack:points:' || v_purchase.reference, 'points_purchase', -v_purchase.amount_minor, v_purchase.points, 'NGN', 'Survey point purchase confirmed by Paystack');
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_wallet_point_purchase(text, bigint, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_wallet_point_purchase(text, bigint, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.request_wallet_withdrawal(
  _user_id uuid,
  _amount_minor bigint,
  _bank_name text,
  _account_number text,
  _account_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available bigint;
  v_withdrawal_id uuid;
BEGIN
  IF _amount_minor < 200000 THEN
    RAISE EXCEPTION 'Minimum withdrawal is 2000 NGN';
  END IF;
  IF _amount_minor <= 0 OR _amount_minor % 100 <> 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be a whole number of NGN';
  END IF;
  IF _bank_name IS NULL OR length(trim(_bank_name)) < 2 OR length(_bank_name) > 100 THEN
    RAISE EXCEPTION 'Enter a valid bank name';
  END IF;
  IF _account_number !~ '^[0-9]{10}$' THEN
    RAISE EXCEPTION 'Enter a valid 10-digit account number';
  END IF;
  IF _account_name IS NULL OR length(trim(_account_name)) < 2 OR length(_account_name) > 120 THEN
    RAISE EXCEPTION 'Enter a valid account name';
  END IF;

  INSERT INTO public.wallet_accounts(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT cash_minor INTO v_available FROM public.wallet_accounts WHERE user_id = _user_id FOR UPDATE;
  IF _amount_minor > v_available THEN
    RAISE EXCEPTION 'Amount exceeds your available balance';
  END IF;

  v_withdrawal_id := gen_random_uuid();
  UPDATE public.wallet_accounts SET cash_minor = cash_minor - _amount_minor, updated_at = now() WHERE user_id = _user_id;
  INSERT INTO public.withdrawals(id, user_id, amount_minor, bank_code, bank_name, account_number, account_name, status)
    VALUES (v_withdrawal_id, _user_id, _amount_minor, 'manual', trim(_bank_name), _account_number, trim(_account_name), 'pending');
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (_user_id, 'withdrawal:request:' || v_withdrawal_id::text, 'withdrawal', -_amount_minor, 0, 'NGN', 'Withdrawal request reserved for administrator review');
  RETURN v_withdrawal_id;
END;
$$;
REVOKE ALL ON FUNCTION public.request_wallet_withdrawal(uuid, bigint, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_wallet_withdrawal(uuid, bigint, text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.resolve_wallet_withdrawal(_withdrawal_id uuid, _decision text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%ROWTYPE;
BEGIN
  IF _decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Decision must be approve or reject';
  END IF;
  SELECT * INTO v_withdrawal FROM public.withdrawals WHERE id = _withdrawal_id FOR UPDATE;
  IF NOT FOUND OR v_withdrawal.status <> 'pending' THEN
    RETURN false;
  END IF;

  IF _decision = 'approve' THEN
    UPDATE public.withdrawals SET status = 'approved' WHERE id = _withdrawal_id;
    RETURN true;
  END IF;

  INSERT INTO public.wallet_accounts(user_id) VALUES (v_withdrawal.user_id) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.wallet_accounts SET cash_minor = cash_minor + v_withdrawal.amount_minor, updated_at = now() WHERE user_id = v_withdrawal.user_id;
  UPDATE public.withdrawals SET status = 'rejected', processed_at = now() WHERE id = _withdrawal_id;
  INSERT INTO public.wallet_transactions(user_id, event_key, kind, amount_minor, points, currency, note)
    VALUES (v_withdrawal.user_id, 'withdrawal:refund:' || _withdrawal_id::text, 'withdrawal', v_withdrawal.amount_minor, 0, 'NGN', 'Rejected withdrawal returned to wallet');
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.resolve_wallet_withdrawal(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_wallet_withdrawal(uuid, text) TO service_role;

CREATE INDEX wallet_point_purchases_user_idx ON public.wallet_point_purchases(user_id, created_at DESC);
COMMENT ON TABLE public.wallet_point_purchases IS 'Point purchases are created and settled only by trusted server operations after Paystack verification.';
COMMENT ON FUNCTION public.request_wallet_withdrawal(uuid, bigint, text, text, text) IS 'Reserves cash and creates a pending withdrawal atomically; the minimum is NGN 2,000 and approval does not send a bank transfer.';