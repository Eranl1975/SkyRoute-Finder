-- SkyRoute Finder — Supabase Schema
-- Run this in the Supabase SQL editor.
-- Requires: supabase project with auth enabled.

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Roles ────────────────────────────────────────────────────────────────────
-- user_roles: maps auth.users to app roles (user/admin)
create table if not exists public.user_roles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  role        text not null check (role in ('user', 'admin')) default 'user',
  created_at  timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy "Users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admin can manage all roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Search History ───────────────────────────────────────────────────────────
create table if not exists public.search_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  params      jsonb not null,
  result_summary jsonb,           -- compact: flight count, hotel name
  searched_at timestamptz not null default now()
);

create index on public.search_history (user_id, searched_at desc);

alter table public.search_history enable row level security;

create policy "Users can manage own history"
  on public.search_history for all
  using (auth.uid() = user_id);

-- ─── Saved Searches ───────────────────────────────────────────────────────────
create table if not exists public.saved_searches (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text,
  params      jsonb not null,
  saved_at    timestamptz not null default now()
);

alter table public.saved_searches enable row level security;

create policy "Users can manage own saved searches"
  on public.saved_searches for all
  using (auth.uid() = user_id);

-- ─── Favorites ────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('flight', 'hotel')),
  item_id     text not null,
  item_data   jsonb not null,     -- snapshot of the flight/hotel at time of save
  saved_at    timestamptz not null default now(),
  unique (user_id, type, item_id)
);

alter table public.favorites enable row level security;

create policy "Users can manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id);

-- ─── Provider Registry ────────────────────────────────────────────────────────
-- Admin-editable override for trusted-sources.ts config
create table if not exists public.provider_registry (
  id          text primary key,
  name        text not null,
  domain      text not null,
  trust_level text not null check (trust_level in ('official','trusted_partner','limited','unverified','blocked')),
  type        text not null check (type in ('airline','hotel','aggregator')),
  country     text,
  is_active   boolean not null default true,
  is_official boolean not null default false,
  notes       text,
  updated_at  timestamptz not null default now()
);

alter table public.provider_registry enable row level security;

create policy "Public can read active providers"
  on public.provider_registry for select
  using (is_active = true);

create policy "Admin can manage providers"
  on public.provider_registry for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── App Settings ─────────────────────────────────────────────────────────────
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id)
);

-- Seed default settings
insert into public.app_settings (key, value) values
  ('official_only_mode', 'false'),
  ('max_flight_results', '5'),
  ('booking_enabled', 'false'),
  ('cache_ttl_seconds', '300')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

create policy "Public can read settings"
  on public.app_settings for select
  using (true);

create policy "Admin can update settings"
  on public.app_settings for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Feature Flags ────────────────────────────────────────────────────────────
create table if not exists public.feature_flags (
  flag_key    text primary key,
  enabled     boolean not null default false,
  description text,
  updated_at  timestamptz not null default now()
);

insert into public.feature_flags (flag_key, enabled, description) values
  ('booking_enabled',         false, 'Enable automated booking (requires compliance sign-off)'),
  ('price_alerts',            false, 'Price alert notifications'),
  ('flexible_dates',          false, 'Flexible date search'),
  ('cheapest_month_view',     false, 'Show cheapest fares by month'),
  ('hotel_by_attraction',     false, 'Hotel search by proximity to attraction'),
  ('official_sites_only',     false, 'Restrict to official airline sites only')
on conflict (flag_key) do nothing;

alter table public.feature_flags enable row level security;

create policy "Public can read flags"
  on public.feature_flags for select
  using (true);

create policy "Admin can manage flags"
  on public.feature_flags for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Search Analytics ─────────────────────────────────────────────────────────
-- Append-only event log. No PII. Anonymous searches allowed.
create table if not exists public.search_analytics (
  id                  uuid primary key default uuid_generate_v4(),
  origin              text not null,
  destination         text not null,
  passengers          integer not null default 1,
  stopover_preference text not null,
  airline_id          text,
  flights_returned    integer not null default 0,
  hotel_returned      boolean not null default false,
  is_mock_data        boolean not null default true,
  duration_ms         integer,
  status              text not null check (status in ('success','partial','error')),
  searched_at         timestamptz not null default now()
);

create index on public.search_analytics (searched_at desc);
create index on public.search_analytics (origin, destination);

alter table public.search_analytics enable row level security;

-- Anyone can insert (anonymous search tracking)
create policy "Anyone can log searches"
  on public.search_analytics for insert
  with check (true);

-- Only admins can read analytics
create policy "Admin can read analytics"
  on public.search_analytics for select
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Booking Approvals ────────────────────────────────────────────────────────
-- Audit trail for future booking approval workflow
create table if not exists public.booking_approvals (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null check (type in ('flight','hotel')),
  item_snapshot   jsonb not null,
  requested_by    uuid references auth.users(id),
  requested_at    timestamptz not null default now(),
  status          text not null check (status in ('pending','approved','rejected','expired')) default 'pending',
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  rejection_reason text,
  expires_at      timestamptz not null
);

alter table public.booking_approvals enable row level security;

create policy "Users can read own approvals"
  on public.booking_approvals for select
  using (auth.uid() = requested_by);

create policy "Admin can manage all approvals"
  on public.booking_approvals for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );
