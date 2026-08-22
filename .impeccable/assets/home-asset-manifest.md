# Memory Uni 首页资产清单

## 依据与边界

- 批准稿：`.impeccable/mocks/hybrid-b.png`，其 `.json` 中 `approved: true`。
- 表面说明：`.impeccable/surfaces/src-components-landingpage-tsx.md` 的 **Fidelity inventory**。
- 最小必要资产结论：批准媒介清单只要求新增一张共享的无缝压花玻璃纹理 raster；其他可见成分已有真实 raster，或必须保持为语义 HTML/CSS、SVG、React 数据与交互状态。

## 产出

| 文件 | 尺寸 / 格式 | 用途 | 透明需求 | 核验 |
|---|---|---|---|---|
| `public/images/memory-glass-texture.png` | 1024×1024；PNG；24-bit RGB | 冷白共享校样桌、大型双层玻璃照片窗、钴蓝上传玻璃板、暗红 Memory Film 终点和上传弹层的低权重材料纹理；由 CSS 控制混合、透明度与颜色 | 不需要 Alpha；纹理本身提供视觉透光与厚度信息，运行时透明度由 CSS 决定；禁止透明孔洞 | 2×2 平铺目视无接缝；左右边缘逐像素平均差 0；上下边缘逐像素平均差 0；无文字、人物、图标、边框、钢框、暖黄或明显方向光 |
| `public/images/memory-glass-texture.prompt.txt` | UTF-8 文本 | 保存可复用、可审计的最终生成意图；同一内容嵌入 PNG 的 `impeccable:prompt` tEXt 元数据 | 不适用 | 通过 `embed-prompt.mjs --read` 回读确认 |

## 生成与整理记录

- 内置 ImageGen 原始选定图保留于：`C:\Users\YeMing\.codex\generated_images\01a00fbc-fb52-78a3-8f12-db876f21ea19\exec-579b7206-fbef-4ca3-afaa-0d01f4b090b5.png`（1254×1254）。
- 最终项目图从该原图高质量缩放至 1024×1024，并仅做低幅度周期边缘校正，使相对边逐像素一致；没有新增图形、文案、框架或 UI。
- 纹理保持低对比背景级，不作为画面主角；真实照片仍是视觉焦点。

## 明确无需生成的资产

| 可见成分 | 保持媒介 | 不生成理由 |
|---|---|---|
| 主标题 | 语义 HTML + CSS 排版 | 文案、响应式换行、可访问性与本地化必须保持可编辑，不可烘焙进位图 |
| “补上一张照片”按钮文字与交互 | 语义 `button` + CSS + Framer Motion + 现有上传状态机 | 必须保留 48px+ 触控、焦点、按压、加载、错误、成功等真实状态 |
| 四年接力轨与四个站点 | 语义按钮 / 链接 + SVG / CSS + 真实数量 | 站点可点击、轨迹可缩放与一次绘制，不能成为背景图案 |
| 定位十字、定位线与汇聚轨迹 | authored SVG / CSS | 需要响应式缩放、可动画和可降级，不可烘焙进 raster |
| Memory Film 链接与终点交互 | 语义链接 + CSS + 玻璃纹理 | 路由、键盘焦点、主动触发与章节过渡必须可工作 |
| 真实毕业合照 | 现有 `public/images/photo-together.jpg` | 产品真相与人物身份是首屏主角，禁止用生成图替换 |
| 外围 3—5 个照片层与浏览照片 | 现有 / 动态真实照片 raster + 语义组件 | 内容来自真实上传数据；灰色 Comp 占位只代表加载或动态内容，不是待生成插图 |
| 上传弹层及全部状态 | 现有 React 逻辑 + 语义 UI + CSS | 上传、裁剪、阶段确认、进度、错误、成功、删除、查看等状态必须保留为真实应用状态 |

## 生产代码范围

- 本资产任务不修改任何 `src` 文件。
- 主标题、上传按钮文字与交互、四年轨道、定位线、Memory Film 链接、真实照片以及所有加载 / 空 / 错误 / 成功 / 禁用状态均继续由语义代码和真实数据承担。
