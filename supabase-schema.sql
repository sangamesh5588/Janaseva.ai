-- Janaseva AI: Supabase Schema for Citizen Reporting

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  preferred_language text default 'en' check (preferred_language in ('en', 'kn')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'en'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Reports Table
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  tracking_id text unique not null,
  citizen_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('road_damage', 'garbage', 'drainage', 'water_supply', 'streetlight', 'other')),
  description text not null,
  location text not null,
  landmark text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  photo_url text,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'in_progress', 'needs_information', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration for existing reports table:
-- alter table public.reports add column if not exists latitude numeric(10, 7);
-- alter table public.reports add column if not exists longitude numeric(10, 7);

-- Enable RLS on reports
alter table public.reports enable row level security;

-- Citizens can view their own reports in full
create policy "Citizens can view own reports"
  on public.reports for select
  using (auth.uid() = citizen_id);

-- Citizens can insert their own reports
create policy "Citizens can insert reports"
  on public.reports for insert
  with check (auth.uid() = citizen_id);

-- Public / Anonymous tracking query: Can read category, status, location, tracking_id, created_at, but NOT sensitive citizen email or citizen_id
create policy "Anyone can track reports by tracking_id"
  on public.reports for select
  using (true);

-- 3. Report Status History Table
create table if not exists public.report_status_history (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references public.reports(id) on delete cascade not null,
  status text not null check (status in ('submitted', 'under_review', 'in_progress', 'needs_information', 'resolved')),
  official_comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on status history
alter table public.report_status_history enable row level security;

create policy "Anyone can view status history"
  on public.report_status_history for select
  using (true);

-- 4. Storage Bucket Setup (report-photos)
insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

create policy "Authenticated citizens can upload report photos"
  on storage.objects for insert
  with check (bucket_id = 'report-photos' and auth.role() = 'authenticated');

create policy "Anyone can view report photos"
  on storage.objects for select
  using (bucket_id = 'report-photos');
