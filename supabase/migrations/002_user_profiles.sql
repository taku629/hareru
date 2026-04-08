-- user_profiles: display name and avatar per user
create table if not exists user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);

create policy "Users can delete own profile" on user_profiles
  for delete using (auth.uid() = id);

-- Auto-update updated_at on changes
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();
