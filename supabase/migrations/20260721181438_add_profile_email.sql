ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower
  ON profiles (lower(email))
  WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _establishment_id uuid;
BEGIN
  _role := NEW.raw_user_meta_data ->> 'role';

  IF _role IS NULL OR _role NOT IN ('admin', 'employee') THEN
    _role := 'employee';
  END IF;

  _establishment_id := NULLIF(NEW.raw_user_meta_data ->> 'establishment_id', '')::uuid;

  IF _establishment_id IS NULL THEN
    SELECT id INTO _establishment_id
    FROM establishments
    WHERE active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, establishment_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    _role,
    _establishment_id
  );

  RETURN NEW;
END;
$$;
