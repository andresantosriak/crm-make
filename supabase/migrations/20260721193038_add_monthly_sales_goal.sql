ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS monthly_sales_goal numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_monthly_sales_goal_check;

ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_monthly_sales_goal_check
  CHECK (monthly_sales_goal >= 0);
