-- 在 Supabase Dashboard 的 SQL Editor 中执行一次。
-- 当前产品不使用账号：anon 与 authenticated 都可查看、上传和单张删除共享照片。

create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default '未命名回忆',
  location text,
  date text,
  created_at timestamptz not null default now(),
  storage_path text not null unique
);

create index if not exists photos_created_at_idx
  on public.photos (created_at desc);

alter table public.photos enable row level security;

grant select, insert, delete on table public.photos to anon, authenticated;
revoke update on table public.photos from anon, authenticated;

drop policy if exists "Anyone can view shared photos" on public.photos;
create policy "Anyone can view shared photos"
  on public.photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can add one shared photo" on public.photos;
create policy "Anyone can add one shared photo"
  on public.photos
  for insert
  to anon, authenticated
  with check (
    storage_path like 'photos/%'
    and length(storage_path) <= 220
    and length(url) <= 2048
  );

drop policy if exists "Anyone can delete a shared photo" on public.photos;
create policy "Anyone can delete a shared photo"
  on public.photos
  for delete
  to anon, authenticated
  using (true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'memory-photos',
  'memory-photos',
  true,
  10485760,
  array['image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload memory photos" on storage.objects;
create policy "Anyone can upload memory photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'memory-photos'
    and name like 'photos/%'
  );

-- Storage 的 remove API 在执行 DELETE 前还需要通过 SELECT 找到对象。
-- 当前 bucket 本身就是公开图库，photos 表中的公开记录也已包含这些路径。
drop policy if exists "Anyone can find memory photos for deletion" on storage.objects;
create policy "Anyone can find memory photos for deletion"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'memory-photos'
    and name like 'photos/%'
  );

drop policy if exists "Anyone can delete one memory photo" on storage.objects;
create policy "Anyone can delete one memory photo"
  on storage.objects
  for delete
  to anon, authenticated
  using (
    bucket_id = 'memory-photos'
    and name like 'photos/%'
  );
