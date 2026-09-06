create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student','mentor','admin')),
  program text default 'ASTRUM',
  mentor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id text primary key,
  title text not null,
  official_source text,
  tier text,
  domain text,
  theme text,
  pathways text,
  core_selective text,
  public_url text,
  phase2 boolean default false,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.source_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_id text not null references public.sources(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  percent integer not null default 0 check (percent between 0 and 100),
  completed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, source_id)
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id),
  week_of date not null,
  source_ids text[] default '{}',
  learning_goal text,
  activities text,
  expected_hours numeric(6,2) default 0,
  dash_deliverable text,
  status text default 'planned' check (status in ('planned','active','completed','reviewed')),
  mentor_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null default current_date,
  source_id text references public.sources(id),
  activity text not null,
  hours numeric(6,2) not null default 0 check (hours >= 0),
  reflection text,
  evidence_url text,
  mentor_review text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Security-definer helpers prevent recursive RLS checks on profiles.
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_mentor_for(student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles
    where id = student and mentor_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.source_progress enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.diary_entries enable row level security;

-- Drop policies so the setup script is safely re-runnable.
drop policy if exists "authenticated read sources" on public.sources;
drop policy if exists "admin manage sources" on public.sources;
drop policy if exists "profile self mentor admin read" on public.profiles;
drop policy if exists "progress self mentor admin read" on public.source_progress;
drop policy if exists "progress self write" on public.source_progress;
drop policy if exists "plans authorized read" on public.weekly_plans;
drop policy if exists "plans authorized insert" on public.weekly_plans;
drop policy if exists "plans authorized update" on public.weekly_plans;
drop policy if exists "diary authorized read" on public.diary_entries;
drop policy if exists "diary student insert" on public.diary_entries;
drop policy if exists "diary authorized update" on public.diary_entries;

create policy "authenticated read sources" on public.sources
for select to authenticated using (true);

create policy "admin manage sources" on public.sources
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "profile self mentor admin read" on public.profiles
for select to authenticated using (
  id = auth.uid() or mentor_id = auth.uid() or public.current_user_role() = 'admin'
);

create policy "progress self mentor admin read" on public.source_progress
for select to authenticated using (
  user_id = auth.uid() or public.is_mentor_for(user_id) or public.current_user_role() = 'admin'
);

create policy "progress self write" on public.source_progress
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "plans authorized read" on public.weekly_plans
for select to authenticated using (
  student_id = auth.uid() or mentor_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
);

create policy "plans authorized insert" on public.weekly_plans
for insert to authenticated with check (
  student_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
);

create policy "plans authorized update" on public.weekly_plans
for update to authenticated using (
  student_id = auth.uid() or mentor_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
) with check (
  student_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
);

create policy "diary authorized read" on public.diary_entries
for select to authenticated using (
  student_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
);

create policy "diary student insert" on public.diary_entries
for insert to authenticated with check (student_id = auth.uid());

create policy "diary authorized update" on public.diary_entries
for update to authenticated using (
  student_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
) with check (
  student_id = auth.uid() or public.is_mentor_for(student_id) or public.current_user_role() = 'admin'
);
