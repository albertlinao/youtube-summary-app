-- YTSummary schema

create table if not exists public.url_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now(),
  count integer not null default 1,
  video_duration integer not null default 0,
  unique (user_id, url)
);

create table if not exists public.summary_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.url_summary_table (
  url_id uuid not null references public.url_table (id) on delete cascade,
  summary_id uuid not null references public.summary_table (id) on delete cascade,
  is_favorite boolean not null default false,
  primary key (url_id, summary_id)
);

alter table public.url_table enable row level security;
alter table public.summary_table enable row level security;
alter table public.url_summary_table enable row level security;

create policy "Users manage their urls"
  on public.url_table
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their summaries"
  on public.summary_table
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage url summary links"
  on public.url_summary_table
  for all
  using (
    exists (
      select 1
      from public.url_table
      where public.url_table.id = public.url_summary_table.url_id
        and public.url_table.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.url_table
      where public.url_table.id = public.url_summary_table.url_id
        and public.url_table.user_id = auth.uid()
    )
  );
