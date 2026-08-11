-- 已经执行过 setup.sql 的线上项目，只需在 Supabase SQL Editor 中执行本文件一次。
-- 现有照片保持 academic_year = null，前端会继续根据 taken_at 自动归档。

alter table public.photos
  add column if not exists academic_year text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'photos_academic_year_check'
      and conrelid = 'public.photos'::regclass
  ) then
    alter table public.photos
      add constraint photos_academic_year_check
      check (
        academic_year is null
        or academic_year in ('freshman', 'sophomore', 'junior', 'senior')
      );
  end if;
end $$;
