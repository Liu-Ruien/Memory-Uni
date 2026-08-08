-- 已经执行过旧版 setup.sql 的项目，只需在 Supabase SQL Editor 执行本文件一次。
alter table public.photos
  add column if not exists taken_at date;
