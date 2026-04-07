-- ユーザーは Supabase Auth が管理（auth.users）

-- 日次記録
create table daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  morning_message text,
  hare_points int default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- モヤモヤエントリー
create table moyamoya_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  daily_record_id uuid references daily_records(id) on delete cascade,
  text text not null,
  reframe text not null,
  created_at timestamptz default now()
);

-- 良かったことエントリー
create table yokatta_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  daily_record_id uuid references daily_records(id) on delete cascade,
  items text[] not null,
  story text not null,
  created_at timestamptz default now()
);

-- RLS（Row Level Security）有効化
alter table daily_records enable row level security;
alter table moyamoya_entries enable row level security;
alter table yokatta_entries enable row level security;

-- ポリシー：自分のデータのみ読み書き可能
create policy "自分のデータのみ" on daily_records for all using (auth.uid() = user_id);
create policy "自分のデータのみ" on moyamoya_entries for all using (auth.uid() = user_id);
create policy "自分のデータのみ" on yokatta_entries for all using (auth.uid() = user_id);
