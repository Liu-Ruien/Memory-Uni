---
version: 1
slug: "src-components-landingpage-tsx"
primary_target: "src/components/LandingPage.tsx"
related_targets: ["src/components/Header.tsx","src/components/MemoryTimeline.tsx","src/components/YearMemoryGallery.tsx","src/components/PhotoManager.tsx","src/App.tsx","src/index.css"]
---

# Memory Uni Home Surface Brief

## Scope and mode

- Scope: `/` 首页、四学年入口、学年照片浏览与上传入口的共享视觉世界。
- Visitor mode: Experience；真实照片从第一视口开始主导体验。
- Audience: 十几位共同经历大学四年的同学，主要使用手机或桌面浏览器。

## Job, action, proof and constraints

- 第一动作：补上一张照片；第二动作：自由浏览四年；终点：进入 Memory Film。
- 证明内容：真实毕业合照、现有照片、四学年真实数量与可工作的上传流程。
- 保留全部上传、裁剪、大学阶段确认、删除、查看与 Memory Film 行为。
- 当前拍摄日期不可信：浏览页与照片管理缩略图暂不显示日期，日期元数据继续保留给编排逻辑。

## Approved direction

- Direction: **透光接力轨**——叠印桌的空间结构与光谱玻璃的材质系统合并为一个世界。
- Approved comp: `.impeccable/mocks/hybrid-b.png`（`.impeccable/mocks/hybrid-b.json` 标记 approved）。
- Memorable moment: 用户按下钴蓝“补上一张照片”时，上传端玻璃节点即时受压点亮；四年接力轨把这次贡献的去向连接到 Memory Film。
- Signature motion: 玻璃层在进入时物化而非淡入；照片校样片小幅错位归位；接力轨沿真实阅读方向一次绘制。动效可中断，减少动态时改为短交叉淡入。

## Composition record

- Component grammar: 一张共享校样桌、一个大型主照片窗、少量待对齐照片层、一条连续四年接力轨；不使用 Bento 卡片阵列。
- Corner language: 核心结构与照片窗为近直角（0—3px）；上传玻璃板与影片终点同样近直角；只有系统级小触控按钮可使用圆形。
- Line weights: 主钢边 2px，内部轨道与定位线 1px，玻璃高光边 1px；移动端保持相同视觉重量，不按比例变粗。
- Elevation: 压花玻璃纹理 + 真实高光边 + 低扩散阴影；大玻璃面比小节点更厚，绝不叠加浅玻璃卡片。
- Type ramp: 窄体/压缩型无衬线用于品牌、标题与学年数字；系统工作字体用于说明与状态。标题约 56—76px 桌面、38—50px 手机；正文 13—16px；微标 10—12px。
- Palette: 冷白 `#EEF0EC` / `#F5F6F2`，石墨钢 `#111514`，钴蓝 `#183FAE`，琥珀 `#D58A00`，暗红 `#6F1728`。
- 不应字面化：Comp 中的灰色照片占位必须替换为真实动态照片或加载状态；生成图里的汉字误差、假菜单图标、具体阴影噪点不作为产品文案或交互要求。

## Fidelity inventory

| Visible ingredient | Commitment | Medium |
|---|---|---|
| 冷白共享校样桌 | 覆盖首屏与浏览世界，微纹理可见但不脏 | CSS 色场 + 生成的无缝压花玻璃纹理 raster |
| 真实毕业合照 | 首屏最大焦点，桌面约 58% 宽，不裁脸 | Existing raster `public/images/photo-together.jpg` |
| 大型双层玻璃照片窗 | 近直角、2px 石墨钢边、厚玻璃高光 | Semantic HTML/CSS + 玻璃纹理 raster |
| 3—5 个外围照片层 | 使用真实动态照片，降低饱和度与对比，保持稀疏 | Existing/dynamic photo raster + semantic HTML/CSS |
| 定位十字与汇聚轨迹 | 可缩放、可一次绘制、不可烘焙进背景 | Authored SVG/CSS |
| 钴蓝上传主操作 | 48px+ 触控，高对比，按下即时受压 | Semantic button + glass texture raster + CSS + Framer Motion |
| 四年接力轨 | 一个连续结构，四个可点击站点，真实数量 | Semantic buttons/anchors + SVG/CSS |
| 暗红 Memory Film 终点 | 接力轨的明确终点，权重低于上传 | Semantic link + glass texture raster + CSS |
| 下一折四年浏览 | 首屏底部露出开头；滚动后沿同一轨道进入真实照片 | Existing React data/components, redesigned in shared grammar |
| 照片浏览卡 | 真实照片优先，近直角边，默认不显示日期 | Existing dynamic raster + semantic button/CSS |
| 上传弹层 | 保留完整状态机，材质继承钢边与压花玻璃 | Existing React logic + restyled semantic UI |

## Unresolved decisions

- 真实拍摄日期未来如何整理仍未决定；本轮只隐藏呈现，不删除元数据或上传校验。
- Memory Film 内部场景的完整同世界重构可在首页稳定后继续；本轮保证入口与章节过渡属于同一视觉语言。
