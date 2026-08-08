# 我的回忆

一个关于人生、时间与回忆的个人档案网站，使用 React、TypeScript、Vite、Tailwind CSS、Framer Motion 和 Supabase 构建。网站保留 Landing Page、扇形照片轮播、3:4 图片裁剪、共享图库、全屏照片查看器、主题切换和背景音乐。

## 技术结构

```text
Photo Manager / Carousel / Grid / Viewer
                  ↓
            PhotoStorage
                  ↓
       SupabasePhotoStorage
          ↙              ↘
Supabase Storage      photos table
 图片 WebP 文件          图片元数据
```

`PhotoStorage` 接口仍位于 `src/storage/PhotoStorage.ts`。当前运行时实现是 `SupabasePhotoStorage`；原来的 `LocalPhotoStorage` 文件仍保留，但 App 不再读取 IndexedDB。

## Supabase 配置

### 1. 创建 Supabase Project

在 [Supabase Dashboard](https://supabase.com/dashboard) 创建一个 Project，然后打开 Project Settings / API，取得：

- Project URL
- anon / public key

不要把 `service_role` key 放进前端。浏览器中只能使用 anon key。

### 2. 创建 Storage Bucket 和 photos Table

打开 Supabase Dashboard 的 SQL Editor，复制并执行项目中的：

```text
supabase/setup.sql
```

脚本会创建：

- Public Storage bucket：`memory-photos`
- Database table：`public.photos`
- `created_at` 排序索引
- 匿名查看、上传、单张删除所需的 Database RLS policies
- 匿名上传、删除 `memory-photos` 文件所需的 Storage RLS policies
- Bucket 级别的 10 MB 和 `image/webp` 限制

Bucket 必须是 Public，因为网页使用永久 public URL 展示照片。Public 只代表图片读取公开；上传和删除仍需要 `storage.objects` 上的 RLS policy。

### 3. 数据表结构

| 字段 | 类型 | 规则 |
|---|---|---|
| `id` | `uuid` | Primary key，默认 `gen_random_uuid()` |
| `url` | `text` | 图片公开访问地址，非空 |
| `title` | `text` | 默认 `未命名回忆` |
| `location` | `text` | 可空 |
| `date` | `text` | 可空 |
| `created_at` | `timestamptz` | 默认 `now()` |
| `storage_path` | `text` | Storage 对象路径，非空且唯一 |

`storage_path` 是 Database 与 Storage 的稳定关联字段。删除照片时先从该字段取得对象路径，再调用 Storage `remove([storage_path])`，成功后删除对应的 Database row。

### 4. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
VITE_SUPABASE_URL=https://你的-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=你的-anon-key
```

Vite 只会把 `VITE_` 开头的变量提供给浏览器。`.env.local` 已加入 `.gitignore`，不要提交真实配置。

如果未配置环境变量，静态归档照片仍能显示，但共享图库会显示明确的配置错误，上传按钮也会被禁用。

### 5. 安装并启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 上传流程

```text
选择一张或多张照片
        ↓
类型和 10 MB 校验
        ↓
固定 3:4 裁剪
        ↓
浏览器生成 1200 × 1600 WebP
        ↓
Supabase Storage: memory-photos/photos/YYYY-MM/<uuid>.webp
        ↓
取得 public URL
        ↓
写入 public.photos
        ↓
Carousel、Grid、Viewer 立即更新
```

如果 Storage 上传成功但 Database 写入失败，适配器会尝试删除刚刚上传的文件，避免产生孤立对象。多图上传中任意一张失败时，也会逐张回滚本批次已经创建的记录和对象。

## 删除流程

网页只提供单张删除，每次都必须确认：

```text
点击单张照片删除
        ↓
浏览器确认弹窗
        ↓
读取 photos.storage_path
        ↓
删除 Supabase Storage 对象
        ↓
删除 public.photos 记录
        ↓
更新当前页面状态
```

项目没有“一键删除全部”或批量删除 UI，`SupabasePhotoStorage.deletePhoto()` 也只接受一个照片 ID。

## 当前匿名权限的重要限制

本阶段没有登录系统，并按产品要求允许任何访客上传和删除共享照片。因此 `anon` 角色必须拥有相应的 RLS 权限。

这意味着：

- 访客不能通过 anon key 修改数据库结构；DDL 权限不会暴露给浏览器。
- 网页不会提供批量删除功能，每次删除都有单张确认。
- 但匿名公开写入无法证明“谁上传了哪张照片”。熟悉 Supabase API 的恶意访客可能绕过网页、重复发起删除请求，RLS 本身也无法判断请求是否来自页面按钮。
- 如果这个网站要公开发布，建议下一阶段加入 Supabase Auth、所有者字段和受控的 Edge Function；至少还应增加速率限制、滥用防护和备份。

## 静态归档照片

网站自带照片仍放在 `public/photos/`，元数据位于 `src/data/photos.ts`。这些照片随网站一起发布并保持只读，不会写入 Supabase，也不会出现在照片管理器的可删除列表中。

## 背景音乐

音乐配置位于 `src/config/music.ts`：

```ts
export const musicConfig = {
  src: '/audio/background.wav',
  title: 'Background Music',
  volume: 0.35,
  fadeDuration: 450,
}
```

要更换音乐，只需要替换 `public/audio/` 中的文件并更新 `musicConfig.src`。访客只能播放或暂停，无法从页面更换音乐。

播放偏好继续保存在浏览器 `localStorage` 的 `archive-music-enabled` 键中；照片不再使用 IndexedDB。

## 未来增加登录系统

建议增加 Supabase Auth，并进行以下修改：

1. 为 `photos` 增加 `owner_id uuid references auth.users(id)`。
2. 上传时把当前 `auth.uid()` 写入 `owner_id`。
3. 把 Storage 路径改为 `<user-id>/<uuid>.webp`。
4. 将 Database 和 Storage DELETE policy 改为仅允许所有者删除。
5. 在 Header 增加登录状态，在 Photo Manager 中只对当前用户拥有的照片显示删除按钮。
6. 如果仍需管理员管理全站照片，使用服务端 Edge Function 和 `service_role`，绝不能把 `service_role` 暴露到前端。
