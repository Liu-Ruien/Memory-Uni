---
version: 1
slug: "src-features-memory-film-memoryfilmpage-tsx"
primary_target: "src/features/memory-film/MemoryFilmPage.tsx"
related_targets: ["src/features/memory-film/components/FilmIntro.tsx","src/features/memory-film/components/FilmStage.tsx","src/features/memory-film/components/FilmMobileUnavailable.tsx","src/features/memory-film/components/MemoryFilmBackground.tsx","src/features/memory-film/memoryFilm.css","src/features/memory-film/config/filmTextScenes.ts","src/components/MobileFilmNoticeDialog.tsx","src/utils/memoryFilmAvailability.ts"]
---

# Memory Film Surface Brief

## Scope and mode

- Scope: `/memory-film` 的准备、播放、字幕、时间线、片尾、重播与返回体验。
- Visitor mode: Experience；真实照片从第一视口开始证明体验，而不是由抽象氛围代替内容。
- Audience: 一起经历大学四年的十几位同学；电脑浏览器完整观看，手机和平板继续上传/浏览相册并获得明确的电脑端观看提示。

## Job, action, proof and constraints

- 电脑端第一动作：确认真实照片已经就绪并按下“开始放映”；终点：看完一段由同一批照片持续重组的共同回忆，并可重播或返回相册。手机端第一动作：理解该体验需要电脑，并继续浏览相册。
- 证明内容：真实照片数量、真实毕业合照、七段镜头路径、音乐、全屏、重播、退出与现有 Supabase 数据。
- 保留当前全部数据加载、优先预载、响应式照片调度、GSAP 场景、音频淡出、全屏与减少动态支持。
- 手机和平板（包括横屏）不得进入播放分支：主页入口保留当前路径并弹出设备提示，直达路由不请求 Supabase 照片、不创建音频、不渲染 Film Stage，只呈现设备说明和返回相册。
- 不复制参考视频的平台外壳、紫色霓虹或装饰爱心；视频只提供照片重组、镜头纵深、时间线和书信收束的叙事方法。

## Approved direction

- Direction: **一卷会自己重新装订的毕业底片**。
- Approved comp: `.impeccable/mocks/memory-film-a.png`；由用户的“全权负责”授权后，依据任务清晰度、真实内容证明与移动端可转译性选择。
- Memorable moment: 同一批照片从校样墙散开，穿过时间带、记忆环与纵深隧道，最后重新聚成 2022—2026；照片消散后，四句话落到一张真实可触的毕业信纸上。
- Signature interaction: 首屏的照片放映门在点击后直接成为第一幕照片墙；播放期间七章轨迹、进度线和场景名同步推进，控制条在静止时退场、指针回来时恢复。

## Composition record

- Component grammar: 一个全屏放映空间、一座真实照片构成的放映门、一条七章进度轨、一个主播放控制；不使用常规网站导航和卡片仪表盘。
- Corner language: 照片与书信 16—24px 连续圆角；小型系统控制为胶囊或圆形；所有圆角服务于物理对象，不把全屏场景装进大玻璃卡片。
- Line weights: 照片纸边 6—10px 视觉厚度；功能玻璃高光 1px；章节轨与波形 1px；珊瑚定位点为唯一高亮。
- Elevation: 照片使用有方向的柔影与边缘反光；功能玻璃保留折射和透光；禁止无偏移彩色光晕替代深度。
- Type ramp: 有性格的窄体中文标题约 48—88px 桌面、34—52px 手机；场景标题 18—28px；正文 14—17px；时间码与章节标签 11—13px，数字使用等宽表格特性。
- Palette: 深青黑 `#061817` / `#0B2421`，温润相纸 `#F4F8F5`，浅薄荷 `#9EDBCB`，珊瑚 `#F06B5D`，柔钢 `#7F9993`。不引入紫蓝 AI 渐变。
- 不应字面化：生成构图中的额外人物照片、错误章节文案、键盘快捷键和精确时长只是构图示意；实现只使用真实数据与现有可工作行为。

## Fidelity inventory

| Visible ingredient | Commitment | Medium |
|---|---|---|
| 深青黑夜间放映空间 | 全屏、沉浸、照片优先，纹理由胶片光雾与低密度尘埃承担 | CSS 色场 + Canvas 粒子 |
| 首屏照片放映门 | 真实毕业合照居中，5—7 张真实照片向两侧弯入纵深，桌面约占 62% 宽 | Existing raster data + semantic React/CSS transforms |
| 主叙事与开始放映 | 标题在左下，主操作在右下或移动端底部；进入前即有珊瑚底色 | Semantic HTML + existing GlassButton + CSS |
| 七章影片轨 | 播放进度、章节名、当前定位点同步；非交互时不冒充可拖动控件 | Semantic labels + CSS + GSAP |
| 照片重组场景 | 墙、散落、时间带、环、隧道、重聚完整保留并重新调色 | Existing GSAP layouts + React photo cards |
| 时间线档案 | 四年条目在片尾形成一张深色档案页 | Semantic `dl` + CSS + GSAP |
| 写给我们的信 | 四段现有文案逐页/逐段显现在温润相纸上 | Semantic HTML + CSS + existing text timeline |
| 退出、重播、返回 | 电脑端指针出现时随时可见；键盘焦点和点击区域完整 | Semantic buttons/anchors + functional glass |
| 手机设备交接 | 入口提示与直达说明使用同一文案和电脑屏幕意象；顶部关闭、Esc、背景关闭、焦点圈定与归还完整，矮横屏允许滚动/两栏重排 | Semantic dialog + shared device capability guard + responsive CSS |

## Unresolved decisions

- 现有背景音乐继续使用；未来若重新剪辑音乐，再依据节拍微调七章时长。
- 日期元数据仍可能变化，本轮不把逐张日期写进电影叙事。
