-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles table (for user data)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Changed owner_id to user_id for consistency with other tables
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  age integer,
  weight numeric,
  color text,
  medical_info text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Locations table (for GPS tracking)
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  latitude numeric not null,
  longitude numeric not null,
  address text,
  created_at timestamptz default now()
);

-- Alerts table (for emergency alerts)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references pets(id) on delete set null,
  title text not null,
  description text,
  severity text default 'medium',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sleep tracking table
create table if not exists public.sleep_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_minutes integer,
  quality text,
  notes text,
  created_at timestamptz default now()
);

-- Videos table (for uploaded pet videos)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid references pets(id) on delete set null,
  url text not null,
  file_path text not null,
  uploaded_at timestamptz default now()
);

-- Video analysis table (for AI analysis results)
create table if not exists public.video_analyses (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  behavior_description text,
  mood text,
  activity_level text,
  concerns text,
  analyzed_at timestamptz default now()
);

-- Contact submissions table (simple form storage)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.locations enable row level security;
alter table public.alerts enable row level security;
alter table public.sleep_records enable row level security;
alter table public.videos enable row level security;
alter table public.video_analyses enable row level security;
alter table public.contacts enable row level security;

-- ============ RLS POLICIES ============

-- Profiles policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles: users can select themselves'
  ) then
    create policy "Profiles: users can select themselves" on public.profiles
      for select
      using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles: users can update themselves'
  ) then
    create policy "Profiles: users can update themselves" on public.profiles
      for update
      using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Profiles: service role can insert'
  ) then
    create policy "Profiles: service role can insert" on public.profiles
      for insert
      with check (auth.role() = 'service_role' or auth.uid() = id);
  end if;
end $$;

-- Updated pets policies to use user_id instead of owner_id
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pets' and policyname = 'Pets: users can select their own'
  ) then
    create policy "Pets: users can select their own" on public.pets
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pets' and policyname = 'Pets: users can insert their own'
  ) then
    create policy "Pets: users can insert their own" on public.pets
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pets' and policyname = 'Pets: users can update their own'
  ) then
    create policy "Pets: users can update their own" on public.pets
      for update
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pets' and policyname = 'Pets: users can delete their own'
  ) then
    create policy "Pets: users can delete their own" on public.pets
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Locations policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'locations' and policyname = 'Locations: users can select their own'
  ) then
    create policy "Locations: users can select their own" on public.locations
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'locations' and policyname = 'Locations: users can insert their own'
  ) then
    create policy "Locations: users can insert their own" on public.locations
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Alerts policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'alerts' and policyname = 'Alerts: users can select their own'
  ) then
    create policy "Alerts: users can select their own" on public.alerts
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'alerts' and policyname = 'Alerts: users can insert their own'
  ) then
    create policy "Alerts: users can insert their own" on public.alerts
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'alerts' and policyname = 'Alerts: users can update their own'
  ) then
    create policy "Alerts: users can update their own" on public.alerts
      for update
      using (auth.uid() = user_id);
  end if;
end $$;

-- Sleep records policies
do $$ begin
  begin
    create policy "Sleep: users can select their pet's records" on public.sleep_records
      for select
      using (
        pet_id in (
          select id from pets where user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;
end $$;

do $$ begin
  begin
    create policy "Sleep: users can insert for their pets" on public.sleep_records
      for insert
      with check (
        pet_id in (
          select id from pets where user_id = auth.uid()
        )
      );
  exception when duplicate_object then
    null;
  end;
end $$;

-- Videos policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'videos' and policyname = 'Videos: users can select their own'
  ) then
    create policy "Videos: users can select their own" on public.videos
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'videos' and policyname = 'Videos: users can insert their own'
  ) then
    create policy "Videos: users can insert their own" on public.videos
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'videos' and policyname = 'Videos: users can delete their own'
  ) then
    create policy "Videos: users can delete their own" on public.videos
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Video analyses policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'video_analyses' and policyname = 'Analyses: users can select their own'
  ) then
    create policy "Analyses: users can select their own" on public.video_analyses
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'video_analyses' and policyname = 'Analyses: service role can insert'
  ) then
    create policy "Analyses: service role can insert" on public.video_analyses
      for insert
      with check (auth.role() = 'service_role' or auth.uid() = user_id);
  end if;
end $$;

-- Contacts policies (service role access only by default)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'contacts' and policyname = 'Contacts: service role can insert'
  ) then
    create policy "Contacts: service role can insert" on public.contacts
      for insert
      with check (auth.role() = 'service_role');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'contacts' and policyname = 'Contacts: service role can select'
  ) then
    create policy "Contacts: service role can select" on public.contacts
      for select
      using (auth.role() = 'service_role');
  end if;
end $$;
