create table if not exists public.match_plan_cache (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.vibe_matches(id) on delete cascade,
  mission_instance_id uuid,
  plan jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_match_plan_cache_match
  on public.match_plan_cache(match_id);

create index if not exists idx_match_plan_cache_expires
  on public.match_plan_cache(expires_at);
