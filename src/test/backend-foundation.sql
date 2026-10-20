SELECT rule, passed FROM (
 SELECT 'Members cannot assign their own roles' AS rule, NOT has_table_privilege('authenticated','public.user_roles','INSERT') AS passed
 UNION ALL SELECT 'Visitors cannot read member profiles', NOT has_table_privilege('anon','public.profiles','SELECT')
 UNION ALL SELECT 'Members can change their display name', has_column_privilege('authenticated','public.profiles','display_name','UPDATE')
 UNION ALL SELECT 'Members cannot change wallet balances', NOT has_table_privilege('authenticated','public.wallet_accounts','UPDATE')
 UNION ALL SELECT 'Members cannot invent wallet credits', NOT has_table_privilege('authenticated','public.wallet_transactions','INSERT')
 UNION ALL SELECT 'Members cannot mark press releases paid', NOT has_column_privilege('authenticated','public.press_releases','paid_at','UPDATE')
 UNION ALL SELECT 'Members can draft articles before payment', has_column_privilege('authenticated','public.press_releases','content_draft','INSERT')
 UNION ALL SELECT 'Members cannot set shop order prices', NOT has_table_privilege('authenticated','public.shop_orders','INSERT')
 UNION ALL SELECT 'Every foundation table has row protection', count(*)=10 AND bool_and(c.relrowsecurity) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('profiles','user_roles','surveys','survey_answers','wallet_accounts','wallet_transactions','withdrawals','press_releases','kit_quotes','shop_orders')
) checks ORDER BY rule;