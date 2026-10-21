CREATE OR REPLACE FUNCTION public.get_wallet_ledger_totals(_user_id uuid)
RETURNS TABLE(total_earned_minor bigint, points_purchased_minor bigint, completed_surveys bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(amount_minor) FILTER (WHERE kind = 'survey_reward' AND amount_minor > 0), 0)::bigint,
    COALESCE(SUM(ABS(amount_minor)) FILTER (WHERE kind = 'points_purchase' AND amount_minor < 0), 0)::bigint,
    COUNT(*) FILTER (WHERE kind = 'survey_reward' AND amount_minor > 0)::bigint
  FROM public.wallet_transactions
  WHERE user_id = auth.uid() AND user_id = _user_id;
$$;
REVOKE ALL ON FUNCTION public.get_wallet_ledger_totals(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_wallet_ledger_totals(uuid) TO authenticated;
COMMENT ON FUNCTION public.get_wallet_ledger_totals(uuid) IS 'Returns lifetime wallet totals only for the signed-in owner; row access remains subject to wallet transaction RLS.';