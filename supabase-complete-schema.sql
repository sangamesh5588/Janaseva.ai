-- ==============================================================================
-- Janaseva AI: 100% Complete Production Supabase Schema & Storage Configuration
-- ==============================================================================
-- Paste this ENTIRE script into your Supabase Dashboard > SQL Editor and click "Run".
-- It handles:
--   1. Extensions (pgcrypto)
--   2. Profiles & automatic auth trigger
--   3. Reports table (with routing, PIN, GPS, Before/After photos, and resolution notes)
--   4. Report Status History table (with INSERT and SELECT RLS for audit milestones)
--   5. Supabase Storage Bucket ('report-photos') & full storage RLS policies
--   6. Official Accounts directory & automated auth account creator
--   7. Batch seeding for ALL 117 Bengaluru PIN codes × 6 Departments = 702 Official Accounts
-- ==============================================================================

-- 1. Enable Cryptography Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'kn')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view profiles" ON public.profiles;
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Auto-create profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, preferred_language)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'en'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id text UNIQUE NOT NULL,
  citizen_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  landmark text,
  pincode text NOT NULL DEFAULT '560001',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  photo_url text,
  status text NOT NULL DEFAULT 'submitted',
  assigned_official_email text,
  assigned_department text,
  resolution_notes text,
  resolution_photo_url text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist even if table was created earlier
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS pincode text DEFAULT '560001';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS latitude numeric(10, 7);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS longitude numeric(10, 7);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assigned_official_email text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assigned_department text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolution_notes text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolution_photo_url text;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view reports" ON public.reports;
CREATE POLICY "Public can view reports"
  ON public.reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert citizen report" ON public.reports;
CREATE POLICY "Anyone can insert citizen report"
  ON public.reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update report status" ON public.reports;
CREATE POLICY "Anyone can update report status"
  ON public.reports FOR UPDATE
  USING (true);

-- 4. Report Status History Table (Audit Timeline)
CREATE TABLE IF NOT EXISTS public.report_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  official_comment text,
  official_email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.report_status_history ADD COLUMN IF NOT EXISTS official_email text;

ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view report status history" ON public.report_status_history;
CREATE POLICY "Public can view report status history"
  ON public.report_status_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert status history" ON public.report_status_history;
CREATE POLICY "Anyone can insert status history"
  ON public.report_status_history FOR INSERT
  WITH CHECK (true);

-- 5. Supabase Storage Bucket ('report-photos') & Storage Policies
-- Inserts the public storage bucket for citizen and official photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read of all report photos
DROP POLICY IF EXISTS "Public read report photos" ON storage.objects;
CREATE POLICY "Public read report photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-photos');

-- Allow anyone to upload photos to report-photos bucket
DROP POLICY IF EXISTS "Public upload report photos" ON storage.objects;
CREATE POLICY "Public upload report photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-photos');

-- Allow anyone to update photos in report-photos bucket
DROP POLICY IF EXISTS "Public update report photos" ON storage.objects;
CREATE POLICY "Public update report photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'report-photos');

-- 6. Official Accounts Directory & Registration Function
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

ALTER TABLE public.official_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read official accounts" ON public.official_accounts;
CREATE POLICY "Public read official accounts"
  ON public.official_accounts FOR SELECT
  USING (true);

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
  hashed_pwd := crypt(user_password, gen_salt('bf'));

  SELECT id INTO new_user_id FROM auth.users WHERE email = lower(user_email);

  IF new_user_id IS NULL THEN
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

  INSERT INTO public.official_accounts (email, department_code, department_name, pincode, pincode_suffix, role)
  VALUES (lower(user_email), dept_code, dept_name, user_pincode, pin_suffix, user_role)
  ON CONFLICT (email) DO UPDATE
  SET
    department_code = dept_code,
    department_name = dept_name,
    pincode = user_pincode,
    pincode_suffix = pin_suffix,
    role = user_role;

  INSERT INTO public.profiles (id, name, email, preferred_language)
  VALUES (new_user_id, dept_name, lower(user_email), 'en')
  ON CONFLICT (id) DO UPDATE
  SET name = dept_name, email = lower(user_email);

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed Admin Account
SELECT public.create_staff_auth_account(
  'admin@janaseva.com',
  'Admin@123',
  'admin',
  'admin',
  'Chief Municipal Administrator',
  '560001',
  '001'
);

-- 8. Seed ALL 117 Bengaluru PIN Codes × 6 Departments = 702 Official Accounts
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
  FOR pin_num IN 1..117 LOOP
    suffix_str := lpad(pin_num::text, 3, '0');
    pin_str := '560' || suffix_str;
    user_pwd := 'Dept' || suffix_str;

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
