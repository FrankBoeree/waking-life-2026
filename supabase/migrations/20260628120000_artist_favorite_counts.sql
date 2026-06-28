create table public.artist_favorite_counts (
  artist_id text primary key,
  artist_name text,
  favorite_count integer not null default 0 check (favorite_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.artist_favorite_counts enable row level security;

create policy "Anyone can read favorite counts"
  on public.artist_favorite_counts
  for select
  to anon, authenticated
  using (true);

create or replace function public.adjust_artist_favorite_count(
  p_artist_id text,
  p_artist_name text,
  p_delta integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  if p_delta not in (-1, 1) then
    raise exception 'delta must be -1 or 1';
  end if;

  insert into public.artist_favorite_counts (artist_id, artist_name, favorite_count)
  values (p_artist_id, p_artist_name, greatest(p_delta, 0))
  on conflict (artist_id) do update
  set
    favorite_count = greatest(0, artist_favorite_counts.favorite_count + p_delta),
    artist_name = coalesce(excluded.artist_name, artist_favorite_counts.artist_name),
    updated_at = now()
  returning favorite_count into new_count;

  return new_count;
end;
$$;

grant execute on function public.adjust_artist_favorite_count(text, text, integer) to anon, authenticated;
