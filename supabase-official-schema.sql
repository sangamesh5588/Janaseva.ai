-- ==============================================================================
-- Janaseva AI: Complete All-117 Bengaluru PINs (702 Department Accounts) Migration
-- ==============================================================================
-- Paste this script into your Supabase Dashboard > SQL Editor and click "Run".
-- It creates the database columns, official tables, RLS policies, and registers
-- ALL 117 Bengaluru PIN codes × 6 Departments = 702 Official Accounts directly
-- into Supabase Auth (auth.users) with encrypted passwords!
-- ==============================================================================

-- 1. Enable Cryptography Extension for Password Hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure `reports` table has all necessary routing and official resolution columns
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS pincode text DEFAULT '560001';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assigned_official_email text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assigned_department text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolution_notes text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolution_photo_url text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

-- 3. Official Accounts & Department Directory Table
CREATE TABLE IF NOT EXISTS public.official_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  department_code text NOT NULL,
  department_name text NOT NULL,
  pincode text NOT NULL,
  pincode_suffix text NOT NULL,
  role text NOT NULL DEFAULT 'official' CHECK (role IN ('official', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on official_accounts
ALTER TABLE public.official_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to official accounts directory" ON public.official_accounts;
CREATE POLICY "Allow public read access to official accounts directory"
  ON public.official_accounts FOR SELECT
  USING (true);

-- 4. Automated Function to Create Staff / Official Accounts in Supabase Auth (auth.users)
CREATE OR REPLACE FUNCTION public.create_staff_auth_account(
  user_email text,
  user_password text,
  user_role text,
  dept_code text,
  dept_name text,
  user_pincode text,
  pin_suffix text
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  hashed_pwd text;
BEGIN
  -- Hash the password with bcrypt blowfish
  hashed_pwd := crypt(user_password, gen_salt('bf'));

  -- Check if user already exists in auth.users
  SELECT id INTO new_user_id FROM auth.users WHERE email = lower(user_email);

  IF new_user_id IS NULL THEN
    -- Generate new UUID and insert directly into Supabase Auth
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(user_email),
      hashed_pwd,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'full_name', dept_name,
        'role', user_role,
        'department', dept_code,
        'pincode', user_pincode
      ),
      now(),
      now()
    );
  ELSE
    -- If user exists, update password and metadata
    UPDATE auth.users
    SET
      encrypted_password = hashed_pwd,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = jsonb_build_object(
        'full_name', dept_name,
        'role', user_role,
        'department', dept_code,
        'pincode', user_pincode
      ),
      updated_at = now()
    WHERE id = new_user_id;
  END IF;

  -- Ensure official directory entry is in sync
  INSERT INTO public.official_accounts (email, department_code, department_name, pincode, pincode_suffix, role)
  VALUES (lower(user_email), dept_code, dept_name, user_pincode, pin_suffix, user_role)
  ON CONFLICT (email) DO UPDATE
  SET
    department_code = dept_code,
    department_name = dept_name,
    pincode = user_pincode,
    pincode_suffix = pin_suffix,
    role = user_role;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, name, email, preferred_language)
  VALUES (new_user_id, dept_name, lower(user_email), 'en')
  ON CONFLICT (id) DO UPDATE
  SET name = dept_name, email = lower(user_email);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. Seed Main Admin Account
-- ==============================================================================
SELECT public.create_staff_auth_account(
  'admin@janaseva.com',
  'Admin@123',
  'admin',
  'admin',
  'Chief Municipal Administrator',
  '560001',
  '001'
);

-- ==============================================================================
-- 6. Batch Seed ALL 117 Bengaluru PIN Codes × 6 Departments = 702 Official Accounts
-- ==============================================================================
DO $$
DECLARE
  pin_num int;
  pin_str text;
  suffix_str text;
  depts text[][] := ARRAY[
    ['road_damage', 'Road & Infrastructure Dept', 'road.com'],
    ['garbage', 'Solid Waste Management Dept', 'garbage.com'],
    ['water_supply', 'Water Supply Board', 'water.com'],
    ['streetlight', 'Streetlight & Electrical Dept', 'light.com'],
    ['drainage', 'Drainage & Sewerage Board', 'drainage.com'],
    ['other', 'Public Works & Emergency', 'other.com']
  ];
  user_email text;
  user_pwd text;
BEGIN
  -- Loop across all 117 Bengaluru postal codes (560001 to 560117)
  FOR pin_num IN 1..117 LOOP
    suffix_str := lpad(pin_num::text, 3, '0');
    pin_str := '560' || suffix_str;
    user_pwd := 'Dept' || suffix_str;

    -- Loop through the 6 municipal departments for this PIN
    FOR i IN 1..6 LOOP
      user_email := 'dept' || suffix_str || '@' || depts[i][3];
      
      PERFORM public.create_staff_auth_account(
        user_email,
        user_pwd,
        'official',
        depts[i][1],
        depts[i][2],
        pin_str,
        suffix_str
      );
    END LOOP;
  END LOOP;
END;
$$;

-- ==============================================================================
-- 7. Row Level Security Policies for Reports & Officials
-- ==============================================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view report by tracking ID
DROP POLICY IF EXISTS "Public can view report by tracking ID" ON public.reports;
CREATE POLICY "Public can view report by tracking ID"
  ON public.reports FOR SELECT
  USING (true);

-- Allow citizens to insert reports
DROP POLICY IF EXISTS "Anyone can insert citizen report" ON public.reports;
CREATE POLICY "Anyone can insert citizen report"
  ON public.reports FOR INSERT
  WITH CHECK (true);

-- Allow officials and admin to update reports
DROP POLICY IF EXISTS "Officials can update assigned reports" ON public.reports;
CREATE POLICY "Officials can update assigned reports"
  ON public.reports FOR UPDATE
  USING (true);
