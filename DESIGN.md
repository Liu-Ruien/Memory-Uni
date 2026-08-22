---
name: "Memory Uni"
description: "一张由同学共同补全、沿四年轨迹通往 Memory Film 的数字校样桌。"
colors:
  paper: "#f4f8f5"
  ink: "#17332e"
  secondary: "#49675f"
  tertiary: "#58716b"
  cobalt: "#276dd2"
  cobalt-deep: "#1856b1"
  mint: "#4dbca4"
  amber: "#b77a08"
  oxblood: "#c94f60"
  film: "#123b3a"
  film-night: "#061817"
  film-raised: "#0b2421"
  film-mint: "#9edbcb"
  film-coral: "#f06b5d"
  steel: "#7f9993"
typography:
  display:
    fontFamily: "Memory Display, ZCOOL QingKe HuangYou, sans-serif"
    fontSize: "clamp(2.85rem, 7vw, 4.75rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Memory Display, ZCOOL QingKe HuangYou, sans-serif"
    fontSize: "clamp(2.55rem, 6vw, 4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Segoe UI Variable Text, PingFang SC, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Segoe UI Variable Text, PingFang SC, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.035em"
rounded:
  frame: "16px"
  control: "14px"
  viewport: "16px"
  modal: "24px"
  hero: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "48px"
  section: "94px"
components:
  upload-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
    height: "52px"
  upload-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
    height: "52px"
  film-link:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.frame}"
    padding: "16px 20px"
    height: "58px"
  film-start:
    backgroundColor: "{colors.film-coral}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.frame}"
    padding: "10px 24px 10px 12px"
    height: "58px"
  film-start-hover:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.frame}"
    padding: "10px 24px 10px 12px"
    height: "58px"
  relay-stop:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.frame}"
    padding: "14px 18px 14px 22px"
    height: "68px"
  photo-frame:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "5px"
  modal:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: "24px"
  device-notice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.hero}"
    padding: "18px"
---

# Design System: Memory Uni

## Overview

**Creative North Star: "共同校样桌 / The Shared Proof Table"**

Memory Uni 像一张毕业前摊开的共同校样桌：每位同学补上一张照片，照片被校准、归档，再沿连续的四年接力轨走向 Memory Film。界面不是相册应用的卡片集合，而是一套能读出共同劳动、时间递进与最终放映的编辑结构。

整体气质清新、精密而有人情味。薄荷白纸面、纤细青灰边与连续圆角提供明亮秩序，晴空蓝负责推动贡献，薄荷绿、阳光黄和珊瑚红分别标记四年入口与影片终点。真实照片始终占据最大视觉权重；玻璃只在上传、轨道节点、纪念册封套、影片入口和弹层等功能节点出现，并使用 `/images/memory-glass-texture.png` 建立可触摸的厚度。

Memory Film 是同一世界的夜间放映章节，章节方向为 **“一卷会自己重新装订的毕业底片”**。明亮校样桌在这里降为深青黑放映空间，同一批真实照片不被替换，而是连续重组为照片墙、散落片段、横向时间流、记忆环、隧道与最终重聚，再进入四年档案和纸质书信。它改变明度、纵深与节奏，但继续使用相纸、薄荷反光、珊瑚定位和连续圆角，因此不能读成另一个网站。

**Key Characteristics:**

- 一张连续的共享校样桌，而非彼此独立的卡片阵列。
- 清晰的“上传 → 四年 → Memory Film”阅读方向。
- iOS 式连续圆角、纤细定位线与稀疏压花玻璃共同建立柔和但精密的编辑感。
- 日光感主站与深青色影片空间属于同一青春色彩世界，只改变明度与节奏。
- Memory Film 以“一卷会自己重新装订的毕业底片”为夜间章节方向，使用同一批真实照片完成连续重组。
- 真实照片领先于装饰，并为低动态、低透明度偏好提供完整降级。

## Colors

配色以薄荷白纸面与深青墨色为日间基底，让晴空蓝、薄荷绿、阳光黄与珊瑚红像纪念册的年份索引一样明亮、克制且可辨；Memory Film 将同一色彩关系压低到深青黑夜景，以浅薄荷反光和更明亮的珊瑚定位维持亲缘感。

### Primary

- **晴空蓝（Cobalt）：** 用于上传主操作、首个年份入口与明确焦点，是“共同补全”的行动色。
- **深晴空蓝（Cobalt Deep）：** 用于主操作的悬停、按压和高对比边缘，不作为新的信息类别。

### Secondary

- **薄荷绿（Mint）：** 用于第二学年和主站通透玻璃的生命感，不承担危险或完成含义。
- **阳光黄（Amber）：** 用于第三学年、少量状态和轨道定位，以低透明浅色面出现。
- **归档珊瑚（Oxblood）：** 标记第四学年、主站 Memory Film 入口和危险确认；它是日间叙事终点，不与上传争夺首要权重。
- **影片薄荷反光（Film Mint）：** 只在 Memory Film 中承担焦点、相纸边缘反光、就绪状态和夜间可读性提示，不取代主站薄荷索引。
- **影片珊瑚（Film Coral）：** 只在 Memory Film 中承担开始放映、当前章节定位点和关键动作；比主站归档珊瑚更明亮，以适应深青黑背景。

### Tertiary

- **记录灰（Secondary / Tertiary）：** 承担说明文字、次级标签和非活动状态，以清楚而安静的层级托住照片。

### Neutral

- **薄荷白纸面（Paper）：** 页面、稳定面板及降低透明度后的不透明基底。
- **深青墨色（Ink）：** 标题、正文与主边线的最高对比来源。
- **青灰（Steel）：** 定位线、轨道、分隔边和次级结构。
- **深青功能面（Film）：** 用于主站结尾、影片降低透明度后的不透明功能面，以及夜间章节中需要比底色更清楚的稳定层。
- **影片深青黑（Film Night）：** Memory Film 的完整视口基底，承接放映、暗场与照片之间的最大反差。
- **影片抬升面（Film Raised）：** Memory Film 的功能控制、设备说明和少量抬升深青表面；不能扩张成覆盖照片的普通卡片背景。

**The Fresh Index Rule.** 四种年份色只以浅色索引面、边线或节点出现；深色仅保留给上传与影片主操作，避免把青春感误做成高饱和糖果界面。

**The Photo Color Rule.** 界面颜色负责方向，真实照片负责丰富；年份面板保留低透明浅色底，照片默认保持自然色彩，不再依赖悬停才恢复颜色。

**The Day-to-Night Rule.** 夜间章节通过降低明度、增强纵深和提高薄荷/珊瑚对比进入放映状态；不要另起一套紫蓝、霓虹或与主站无关的品牌色。

## Typography

**Display Font:** 自托管 Memory Display / ZCOOL QingKe HuangYou，后备为 sans-serif。

**Body Font:** Segoe UI Variable Text / PingFang SC，后备为 sans-serif。

**Character:** 窄体展示字像年份编号与校样批注，具有毕业档案的辨识度；系统正文字体保持上传、状态和说明信息易读，不让表现性侵入操作流程。

### Hierarchy

- **Display：** 常规字重、紧凑行高，用于首屏主题句与 Memory Film 章节标题；桌面大而克制，手机端保持约 8—9 个汉字的理想行宽。
- **Headline：** 常规字重，用于四学年与归档段落标题，视觉上与 Display 同源但降低一级。
- **Body：** 常规字重，用于解释、上传反馈与可读叙事；正文行宽控制在约 42—68 个字符。
- **Label：** 半粗字重、轻微字距，用于年份、数量、按钮和状态；中文不强制全大写，英文微标可使用大写。

**The Two-Voice Rule.** 展示字体只说“时间与章节”，正文字体负责“动作与事实”；不要在长正文、错误信息或输入字段中使用展示字体。

## Layout

全站以一张连续校样桌组织空间。桌面内容最大宽度为 1440px，桌面水平留白约 48px，移动端约 14px；主站首屏由叙事与大照片窗形成非对称双列，照片保持主导，随后由一条连续接力轨串起上传、四个学年和 Memory Film。

四年入口在宽屏形成四等分浅彩玻璃墙，中屏改为两列，767px 以下改为单列。四段照片墙使用首尾色完全衔接的低对比渐变，消除学年之间的硬切边；真实照片浏览使用紧凑瀑布流，不用固定等高卡片抹平原始比例，日期在真实数据整理前不显示。移动端的接力轨允许横向滚动并逐站吸附，主要操作触控尺寸不小于 44×44px。

间距采用 4、8、14、24、48px 的紧凑编辑节奏，章节间距可扩展到 94px。密度来自连续边线和清楚对齐，而不是把每块内容包进独立容器。

Memory Film 在电脑端使用完整视口放映空间。准备页把真实毕业合照放在中央，5—7 张真实照片向左右折入成为“照片门”；叙事固定在左下，珊瑚色开始操作固定在右下，底部七等分进度轨在进入播放前即说明影片结构。播放后，同一批照片按“照片墙 → 散落 → 横向时间流 → 记忆环 → 隧道 → 重聚”连续重排，片尾进入四年档案和纸质书信，不切换到无关的页面模板。

Memory Film 是明确的仅电脑端功能。设备门禁使用稳定设备信号，而不是当前视口宽度：手机和平板（包括旋转后的横屏）在主站点击入口时留在相册页并打开设备提示；直达 `/memory-film` 时只渲染设备说明和返回相册，不请求远程照片、不创建音频节点、不挂载准备页或 Stage。矮横屏设备说明在 520px 高度以内允许页面滚动，并重排为设备示意与说明两栏。

**The One-Table Rule.** 同一页面的模块必须共享边线、轨道或对齐基准；不要把上传、年份和影片拆成三个互不相干的落地页区块。

**The Desktop Film Boundary Rule.** 仅电脑端是 Memory Film 的产品与功能边界，不是通用设计系统原则；不得据此隐藏主站上传、浏览或其他移动端核心能力。

## Elevation & Depth

深度是“纤细青灰边 + 功能玻璃厚度 + 纪念册纸页 + 真实照片层”的混合系统。主站大多数表面保持平坦，1px 外边与内部分隔承担结构；仅纪念册封套、悬停照片、上传节点、年份入口、影片入口与弹层使用低扩散阴影。`/images/memory-glass-texture.png` 只出现在功能节点，并通过高光边、低透明浅彩底色和纹理建立材料感，不依赖泛化的透明模糊卡片。

Memory Film 用真正的 Z 轴编排照片：相纸边为 6—10px 的视觉厚度，方向性柔影和薄荷边缘反光让照片在深青黑中前后分层。玻璃在夜间章节更克制，只属于退出、开始/重播、进度与设备提示关闭等功能层；照片门、场景平面、档案与书信依靠相纸、边线、深青色差和方向影建立深度，不能用无偏移彩色光晕替代。

### Shadow Vocabulary

- **照片静置：** 极轻的短距离阴影，让纸面照片与桌面分离而不漂浮。
- **照片悬停：** 中等扩散阴影配合最多 2px 的上移，只用于可点击照片且仅在精确指针设备出现。
- **功能玻璃：** 内侧 1px 高光叠加低扩散色影；上传使用晴空蓝色影，年份使用浅彩色影，影片入口使用珊瑚色影。
- **影片相纸：** 深青黑上的 6—10px 温润相纸边配双层方向影；镜头越近，纸边、圆角和边缘反光越清楚，但不额外覆盖彩色滤镜。
- **影片功能玻璃：** 深青抬升面配 1px 冷白/薄荷高光，只用于退出、开始、重播、进度和关闭等控制；珊瑚色影只跟随主动作与当前定位。
- **弹层：** 单层较宽环境影，配合 12px 系统圆角；移动端落为底部面板时只保留上沿厚度。

**The Functional Glass Rule.** 玻璃必须对应可操作、可到达或可确认的功能节点；在 Memory Film 中只保留给退出、播放、进度、重播和设备提示控制，纯装饰背景与整片场景不得使用玻璃纹理。

**The Stable Fallback Rule.** 在 `prefers-reduced-transparency: reduce` 下移除纹理、透明与 backdrop filter；主站使用不透明薄荷白表面，Memory Film 使用更实的深青功能面，两者都用清晰青灰或相纸边保留层级。

## Shapes

核心形态是偏 iOS 的连续圆角校样框：微型状态与缩略单元使用 10px，按钮和输入控制使用 14px，照片与功能卡使用 16px，弹层使用 24px，大型主照片窗与设备提示使用 28px。圆角大小跟随表面面积与层级，而不是把所有元素统一做成药丸；成组的四年墙和接力轨只圆外轮廓，内部仍以精细分隔保持档案秩序。边线在桌面和移动端保持相同视觉重量，以 1px 外边、分隔和玻璃高光为主。

Memory Film 的照片与书信使用 16—24px 连续圆角，让相同实体在重排过程中保持物理连续性；系统级播放、关闭等单一图标可以为圆形，时间码和小型状态可以为 pill。照片可轻微错位、旋转或进入纵深，任何变形都不能遮挡人物面部、破坏相纸边或干扰点击目标。

**The Continuous Corner Rule.** 圆角必须反映层级：小控件紧、内容卡适中、大型玻璃面更舒展；相邻层之间保持至少 2—4px 的圆角差，避免每个元素都像独立气泡。

## Components

### Primary Upload

- **Shape:** 连续圆角控制（14px），最小高度 52px，触控目标不少于 44px。
- **Color:** 晴空蓝底配白色文字；悬停转深晴空蓝，按压最多下沉 1px。
- **Material:** 可使用玻璃纹理和内侧高光，因为它是整条体验的起点；焦点必须有可见的双层高对比轮廓。
- **Behavior:** 点击即时反馈后进入既有上传、裁剪、比例识别与学年确认流程，不用装饰性等待动画拖延状态。

### Header Navigation

- **Style:** 单一 16px 连续圆角钢框内放置品牌、年份/影片入口与上传操作；滚动后可增加轻玻璃层，未滚动时保持纸面感。
- **Responsive:** 手机端保留品牌标记和上传图标，隐藏辅助英文与次级链接文字；图标按钮保持 40px 视觉尺寸和 44px 可点击区域。

### Relay Stop

- **Style:** 四个学年是同一条 16px 外轮廓轨道上的浅彩玻璃站点，不是四张独立卡片；晴空蓝、薄荷绿、阳光黄、珊瑚红提供无需悬停即可识别的年份索引。
- **State:** 默认态保留可见浅色底与彩色节点；悬停只增强顶部色线和玻璃色密度，键盘焦点与悬停具有同等清晰度。

### Year Pane

- **Style:** 大号年份数字、默认自然彩色照片预览与数量共享一块 24px 外轮廓的浅彩玻璃面板；宽屏四列、中屏两列、手机单列，内部分隔不重复堆叠圆角。
- **Content:** 不展示未经整理的拍摄日期；加载、空、错误状态与真实内容占据同一几何位置，避免布局跳动。

### Photo Frame

- **Style:** 首屏主照片使用 28px 玻璃封套、叠页阴影、暖白相纸内衬和 18px 照片圆角，明确呈现纪念册而非普通图片容器；瀑布流照片使用 16px 连续圆角，尊重原始比例并避免裁脸。
- **Behavior:** 精确指针设备悬停最多上移 2px、图像最多放大约 1.2%；触控设备不依赖悬停表达可用性。

### Film Entry & Device Guard

- **Style:** 主站入口以归档珊瑚 16px 功能玻璃与独立圆形播放孔径形成“放映入口”；它是明亮校样桌通往夜间章节的终点，不预演整段影片构图。
- **Desktop Behavior:** 电脑端进入 `/memory-film` 准备页；只有用户主动点击“开始放映”后才尝试全屏与音乐，任一请求失败都允许影片继续，并始终保留退出、重播和返回相册。
- **Blocked-device Behavior:** 手机和平板点击入口时阻止导航、留在当前相册位置并打开设备提示；设备门禁依据稳定设备信号，旋转或仅改变视口宽度不能解锁影片。

### Memory Film Intro

- **Composition:** 中央使用真实毕业合照，左右各由真实相册照片折入形成照片门；左下为“把四年，重新放映一次”的叙事，右下为珊瑚开始操作，底部为七章进度轨。
- **Truthful State:** 顶栏显示真实照片数量和约 01:15 时长；加载、照片不足、错误与就绪状态占据同一操作区，未就绪时开始按钮保持禁用并显示真实进度。
- **Chapters:** 固定使用“共同校样、散落片段、时间向前、重新相遇、穿过四年、重回一处、写给我们”，不能用示意稿文案替换。

### Memory Film Stage

- **Sequence:** 同一批真实照片连续重组为照片墙、散落、横向时间流、记忆环、隧道与重聚；照片消散后进入四年档案、纸质书信、最终致谢和重播/返回。
- **Motion Grammar:** 动效命题为“同一张相纸在七章之间连续交接”。共同校样由中心向外归位，散落在位置之后补上旋转与纵深，时间流使用加速—巡航—减速，记忆环只在相纸内层强调焦点而不打断外层轨道，隧道保持向前动量，重聚使用接近目标—轻微回正落定；片尾档案与书信按阅读顺序物理进入。镜头只围绕这些交接进行小幅靠近、退让、侧向反漂移与最终静止，不能每章重复同一种缩放。
- **Continuity:** 入口从照片墙中抽取同一张真实照片作为中央照片门；开始放映时只有这组有边界的相纸向镜头前进，完整视口仅交叉叠化。章节转换允许约 0.3 秒的预备重叠，下一章从照片当前呈现值与速度接手；不得先复位到逻辑目标再重新播放。画面尘埃保存连续坐标并平滑改变速度场，不能在章节回调时切换公式而瞬移。
- **HUD:** 退出、品牌、已播放时间、约 01:15 总时长与七章轨同步；进度轨是只读叙事状态，不冒充可拖动控件。精确指针静止约 1.75 秒后 HUD 可退场，指针移动或键盘焦点进入时恢复。
- **Motion Fallback:** `prefers-reduced-motion` 保留完整章节顺序，以静态构图和短交叉淡入替代三维位移、缩放、环绕和长轨迹；不能删掉内容或让影片无法到达片尾。
- **Visual Fallback:** `prefers-reduced-transparency` 使用不透明深青功能面；`prefers-contrast: more` 提升正文、照片纸边、控件和档案边界的对比。

### Desktop-only Device Notice

- **Main-site Dialog:** 高完成度薄荷白设备提示覆盖在相册之上；顶部圆形关闭目标为 44×44px，提供明确焦点圈定、Esc 关闭、背景点击关闭、打开时滚动锁，并在关闭后把焦点归还给触发入口。
- **Direct Route:** 受限设备直达 `/memory-film` 时仅显示深青夜景中的设备说明、真实毕业合照屏幕示意和“返回四年相册”；不得请求远程照片、创建 `audio` 或渲染 Film Intro/Stage。
- **Short Landscape:** 矮横屏允许纵向滚动，将设备示意与说明重排为两栏，返回操作跟随说明列；内容不能因固定视口而被裁掉。

### Modal

- **Style:** 24px 连续圆角、不透明度较高的薄荷白玻璃面，清晰青灰边和单层环境影；桌面居中，手机落为仅保留上方圆角的底部面板。
- **States:** 上传进度、错误、禁用与删除确认均使用文字和图标双重表达，不单靠色相；关闭与主要操作支持键盘。

**The Honest State Rule.** 所有加载、空、错误、完成和禁用状态都必须保留原组件尺寸与真实操作路径，不用伪照片或虚构数据填充。

## Do's and Don'ts

### Do:

- **Do** 让每个视口先读到真实照片，再读到钢框、纹理和动效。
- **Do** 用晴空蓝上传、四色浅彩接力轨和珊瑚影片终点维持完整且可回退的体验顺序。
- **Do** 只在上传、纪念册封套、年份入口、影片入口和弹层等功能节点使用 `/images/memory-glass-texture.png`。
- **Do** 让相邻学年的背景渐变端点完全一致，并让结尾影片章节至少占满一个视口。
- **Do** 维持 1px 精细钢边，并按 10/14/16/24/28px 使用分层连续圆角。
- **Do** 为 `prefers-reduced-motion` 提供短交叉淡入或即时状态，为 `prefers-reduced-transparency` 提供不透明表面。
- **Do** 保持主要触控目标至少 44×44px，并让键盘焦点与悬停同样清晰。
- **Do** 让 Memory Film 使用深青黑、抬升深青、相纸白、影片薄荷、影片珊瑚和青灰构成同一产品的夜间章节。
- **Do** 保持约 01:15 的七章真实顺序，并让同一批真实照片在墙、散落、时间流、环、隧道和重聚之间连续变形。
- **Do** 在受限设备进入任何影片数据或媒体路径之前完成门禁，并让主站提示与直达说明都能清楚返回相册。
- **Do** 为设备提示保留 44×44px 关闭、焦点圈定、Esc/背景关闭、滚动锁、焦点归还和矮横屏滚动重排。

### Don't:

- **Don't** 使用通用 Bento 网格把共同校样桌拆成一组独立卡片。
- **Don't** 把所有按钮、筛选器、导航和标签都做成 pill；大多数控件应使用 14—16px 连续圆角。
- **Don't** 使用紫蓝 AI 渐变、霓虹光晕或大面积彩色玻璃制造“高级感”。
- **Don't** 把玻璃纹理铺满页面、覆盖真实照片，或叠加多层浅色玻璃卡片。
- **Don't** 机械复制 Apple 页面；只借鉴信息层级、材质克制、直接反馈和无障碍原则。
- **Don't** 在数据尚未校正时显示拍摄日期，也不要虚构照片、评价或用户证据。
- **Don't** 把 Memory Film 的照片门、左下叙事和右下开始按钮泛化为所有页面必须采用的构图。
- **Don't** 在影片场景、照片墙、档案或书信外再套一层大玻璃卡片；夜间玻璃只属于退出、播放、进度、重播和设备提示控制。
- **Don't** 让手机或平板因横屏、缩放或视口变宽而绕过设备门禁，也不要在受限设备上请求远程照片、创建音频或挂载 Stage。
- **Don't** 把“仅电脑端”扩张成全站原则；主站上传、四年浏览、照片查看和设备提示继续完整支持移动端。
