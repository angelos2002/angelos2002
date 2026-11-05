-- Street Food Rey — Supabase schema
-- Run in the Supabase SQL editor. The site talks to these tables from the
-- server using the service role key, so RLS can stay locked down.

create extension if not exists "pgcrypto";

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  location    text not null check (location in ('zakaki', 'leontiou', 'guaba')),
  rating      smallint not null check (rating between 1 and 5),
  name        text not null check (char_length(name) between 1 and 60),
  comment     text not null check (char_length(comment) between 10 and 1000),
  hidden      boolean not null default false,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index if not exists reviews_location_idx on public.reviews (location, hidden, created_at desc);
create index if not exists reviews_ip_idx on public.reviews (ip_hash, created_at desc);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Lock everything down: only the service role (server) can read/write.
alter table public.reviews      enable row level security;
alter table public.enquiries    enable row level security;
alter table public.applications enable row level security;
alter table public.orders       enable row level security;

-- Optional: allow public read of visible reviews (e.g. for a future client-side widget).
drop policy if exists "public read visible reviews" on public.reviews;
create policy "public read visible reviews" on public.reviews
  for select using (hidden = false);

-- Store open/closed overrides set from /admin
create table if not exists public.store_status (
  id         text primary key,            -- location id (zakaki, leontiou, guaba)
  mode       text not null default 'auto' check (mode in ('auto', 'open', 'closed')),
  paused     text[] not null default '{}', -- order types paused: delivery, takeaway, dinein
  updated_at timestamptz not null default now()
);
alter table public.store_status enable row level security;

-- CVs uploaded with job applications (private bucket, server-only access)
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false) on conflict (id) do nothing;
