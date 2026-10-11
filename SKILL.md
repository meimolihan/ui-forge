---
name: ui-forge
description: "Design, build, optimize, and review interfaces with a design-judgment workflow backed by a searchable rule library. Explores distinct visual directions, checks them against real screenshots, and applies concrete UX rules (accessibility, touch targets, typography, contrast, motion, forms). Covers new interface design, style comparison, visual polish, screenshot recreation, and UI/UX review for websites, apps, dashboards, admin panels, and components. 设计、构建、优化和评审网站、App、后台与组件的界面：以设计判断流程为主干，以可检索规则库为支撑。先探索真正不同的视觉方向，再基于真实截图打磨，并落地可访问性、触控尺寸、字体、对比度、动效与表单等具体规则。适用于新界面设计、多风格同屏比较、视觉精修、截图还原与界面评审。不用于纯业务逻辑、接口、构建部署，或无界面行为变化的代码整理。"
---

# ui-forge

界面好不好看和任务走不走得通，分开验收、分开取证。
**方向**由设计判断决定，**达标**由规则库和真实画面决定。

方法分两层，各管一段：

| 层 | 做什么 | 怎么用 |
| --- | --- | --- |
| **判断层**（步骤 1–2） | 定方向、认品类、拆标杆、拉开差异 | 读本文件的流程与 `references/` 的方法篇 |
| **规则层**（步骤 3） | 可访问性、触控尺寸、对比度、字体、行高、动效时长、表单反馈 | 查 `scripts/search.py` 的规则库，有据可依 |

不要用规则库代替设计判断：规则能告诉你「对比度要 4.5:1」，不能告诉你
「这个产品该是什么气质」。也不要用设计判断代替规则：眼睛觉得「还行」，
实测可能 3.0:1。**两层都要走。**

**第一次用，或不确定从哪下手，读 [使用手册](references/how-to-use.md)**：
它把两条路——优化现有 UI、创建新项目——拆成可以照着敲的步骤，
含可直接复制的命令、manifest 模板和实测踩过的坑。

---

## 0. 开始前

需要 Python 3（跑检索脚本）。规则库检索是可选的：
纯视觉方向探索不依赖它，但涉及可访问性、密度、表单、图表时应当查。

**存量项目改 UI 前，先查规则库**——这比凭经验改更可靠：

```bash
python <本目录>/scripts/search.py "<你怀疑的问题>" --domain ux
```

常见的落点：

| 你要解决 | 查什么 |
| --- | --- |
| 键盘能 Tab 到但看不出焦点在哪 | `focus visible keyboard navigation ring --domain ux` |
| 按钮太小 / 密集排列容易误点 | `icon only button touch target size --domain ux` |
| 状态只有颜色能区分 | `color alone convey meaning status --domain ux` |
| 表格挤、溢出、窄屏乱 | `data table dense scanning row height --domain ux` |
| 想知道某个品类成熟的配色 | `search.py "<品类>" --domain color` |
| 想知道同类的字体搭配 | `search.py "<气质>" --domain typography` |
| 未知技术栈的实现提示 | `search.py "<关键词>" --stack <stack>` |

技术栈必须从项目里检测（`package.json`、`pubspec.yaml`、`*.xcodeproj` 等），
检测不到就问用户，**不要假设**——猜错栈会让每条建议都跑偏。

规则库读数时的三条纪律：

1. **验证命中**。看返回的 domain/category 和 top result 是否真的对题。
2. **零结果不编**。换更窄的词重查一次；仍为空就明说「规则库无匹配」，
   再退回通用默认值，并标注这是默认值不是查到的。
3. **规则是建议不是命令**。仓库规范和用户要求优先。

截图、录屏、状态并排图和遮字图用 `scripts/shoot.mjs`，写法见
[工具](references/tools.md)。不为取证另写浏览器脚本，不为截图另装浏览器 Skill。

---

## 1. 认品类，定方向

风格从这个页面的品类、首屏的主角和这个品牌里推出来，不从默认模板里长出来。
动手前回答三件事：这是什么品类；用户来首屏看什么、做什么；
同类最好的产品在首屏和控件上怎么做的。

详细方法读 [设计方向](references/design-direction.md)；
说服型页面的骨架读 [说服型骨架](references/direction-persuasion.md)。

**新界面或明确要求重新探索时，先做三个风格不同的首屏。** 每个方向一个 HTML、
一个视口、只有主状态；共用同一份示例文字；结构和样式各写各的，
不用同一个模板换几组 CSS 生成。放进对比页请用户挑，这一轮到此结束。
细节与例外读 [设计方向](references/design-direction.md) 与
[风格对比页](references/style-explorer.md)。

**用户已给参考图、品牌规范或说清风格时**（含存量项目优化 UI），
风格已定：三个首屏都留在这个风格里，只在骨架、主视觉和页面结构上拉开；
或者按下面的「存量项目」路径直接从步骤 2 进入。

---

## 2. 建立视觉与交互结构

按当前决策按需读取，不预先加载全部参考：

| 要解决的问题 | 参考 | 也要查规则库 |
| --- | --- | --- |
| 视觉层级、字体、色彩、空间、图标、风格统一、减法精修 | [视觉语言](references/visual-language.md) | `typography`、`color` |
| 图从哪来、承担什么、素材与生成提示词、实时 3D 与视频 | [素材](references/media.md) | `icons` |
| 三处基本动效、手感、界面过渡、首屏动画、时长 | [动效](references/motion.md) | `gsap` |
| 小游戏、抽奖、计时养成、强手感操控 | [游玩](references/play.md) | `gsap` |
| 落地页/品牌页的滚动动效、区块出场、滑动驱动叙事 | [滚动叙事](references/scroll-narrative.md) | `gsap` |
| 控件六态、加载/空/错、危险操作确认、动效时长 | [交互与状态](references/interaction-states.md) | `ux` |
| 表单分组、校验时机、错误位置、提交反馈 | [表单](references/forms.md) | `ux` |
| 后台布局、状态区、表格、密度、移动端降级 | [工作区布局](references/workspace-layout.md) | `product`、`chart` |
| 存量项目改造流程、层叠陷阱、验证方式 | [存量改造](references/legacy-refactor.md) | `ux` |
| 图表与数据可视化 | 项目自身图表库 | `chart` |

**先查规则库再动手**，尤其是触控尺寸、焦点可见性、对比度这三项——
它们有明确的数字标准，不该靠感觉。

产品界面要做出主要内容的层级和关键操作流程，不只做一个漂亮的默认状态。
**静态好看不等于能用**：凡是可点的控件都要走一遍
[交互与状态](references/interaction-states.md) 的六态，
有输入的地方都走一遍 [表单](references/forms.md)。
新界面和改动了操作流程时按 [动效](references/motion.md) 做出三处基本动效；
落地页类页面还必须读 [滚动叙事](references/scroll-narrative.md)。

### 存量项目里优化 UI

**先分清用户要的是视觉、流程还是新功能**，三者做法不同，混着做两头不讨好。
完整流程读 [存量改造](references/legacy-refactor.md)：
盘点 → 留基线 → 查规则找系统性问题 → 分批改 → 实测验证。

可以重新决定偶然形成的视觉默认值，**品牌资产保留**。
优先改设计变量和共享选择器，不为一次调整另造设计系统，
也不把无关代码重构混进视觉工作。

**老项目的问题多是系统性的**：所有输入框都 `outline:none`、
所有 tag 颜色都没过对比度、所有按钮都小于触控尺寸。
这类问题逐个看发现不了，必须先查一轮规则库。

层叠是存量改造的高发陷阱，三条已经踩过的：

- **别用 `:where()`**——特异性为 0，压不过项目原有规则，造成「本来有焦点环，
  改完反而没了」。特异性不够时用带类名的选择器。
- **别用 `opacity` 压暗辅助文字**——它把文字和底色一起混算，
  对比度可能反而掉到标准以下。直接指定一个达标色值。
- **别按列序写选择器**（`nth-child(5)`）——不同页签列序不同，会误伤其他表格。
  用 `first-child`/`last-child` 或语义类名。

这三类问题**看代码判断不了，必须实测**。

---

## 3. 取得实际证据

**截图保存成功不等于已经看过。** 平时只看一眼，改完一批再截；
送评审前和交付前用 `--evidence` 一次取齐。命令和选项见 [工具](references/tools.md)。

- 示例内容按真实产品的样子写。模拟数据、生成图片、未接入的动作写在交付说明里，
  **不写进界面**：画面上不出现「示例」「示意图」「按钮未接入」这类制作说明。
- 在实际阅读尺寸检查中文多行标题、正文和窄屏换行。文字重叠、被裁切
  或靠大量小字才装得下时，回到内容和布局修，不靠缩放掩盖。
- 截图工具每次会列出「默认做法提示」：可读性几项（对比度、正文字号、行高、
  停在透明状态）**要改**；眉标、单侧色条、卡片套卡片、渐变文字这类模型默认做法，
  改掉或在交付说明里逐条写出理由。
- 规则库和截图工具都会误报。误报在交付说明里写一句，不假装通过，也不为了
  让检查变绿去改不该改的东西。

### 验证键盘焦点这类「看不见」的东西

`:focus-visible` 只在**真实键盘导航**时匹配。用脚本调 `element.focus()`
去验证会得到**不稳定且错误**的结果——程序化聚焦不算键盘意图。

用 CDP 派发真实按键遍历，参考本目录 `scripts/verify_focus.mjs`：

```bash
node <本目录>/scripts/verify_focus.mjs <页面地址或 HTML 文件>
```

它会按 Tab 遍历所有可操作控件，报告哪个缺可见焦点环。
**这类结论必须有实测支撑，不能只看 CSS 就下判断。**

---

## 4. 独立评审与修正

交接规则见 [视觉评审派发协议](references/visual-review.md)，
评审者按 [评审手册](references/reviewer-manual.md) 执行：

| 改动 | 评审 |
| --- | --- |
| 方向探索阶段的对比页 | 先交给用户，不派评审 |
| 新界面、整体改版，选定方向之后 | 初版稳定时评审，10 分制 |
| 已有界面润色一整页以上 | 「存量已有界面润色评审」，一轮，不打分 |
| 小改动、局部低风险修改 | 主 Agent 自己看，不派评审者 |

有隔离、能看图的执行者时派一个没有历史上下文的评审者；没有就自检，
并标明未独立评审。评审者只看当前画面、任务和约束，不看制作过程和代码。

---

## 5. 验证与交付

检查深度跟着改动走：小改动只看改动处和相邻元素；
精修和基线做前后对比；新页面、改版和局部重构做下面全部检查。

- 交互从真实入口走到可观察结果；保存后重新读取。
- 项目或任务目录里有验证脚本时，交付前连续跑 3 次，3 次都通过才算通过。
- 只跑项目的类型检查和 lint，不跑生产构建和全量测试。
  构建失败、接口报错这类和画面无关的环境问题，交付说明里记一行后绕过，
  不排查、不改项目配置。
- 单独做一次减法：每一屏只有一个主角，其余安静；逐区块删一轮文字，
  只放回删了会影响理解的。对象名称、判断依据、当前状态和主动作必须留下。
- 交付说明逐项写到：选定的方向和理由；改了什么、哪些没做及为什么；
  **查了规则库的哪几条、命中没有**；评审了几轮及方式；删掉了哪些文字；
  证据文件在任务目录的哪里。

  设计说明、素材、截图和评审记录放在**任务目录**，不写进 Skill 安装目录。

---

## 能力边界

看不了图时，可以写设计说明和实现代码，但要写明「未验证实际视觉」，不给视觉打分。
没有可运行的环境时，不能说交互已经通过。

规则库查不到就说查不到，不用通用常识冒充数据库命中。
只用任务已授权的服务和配置，不因为缺素材自己接入付费服务。
本 Skill 不管密钥、不装工具、不发布网站。

---

## 参考文件索引

**先读**

- [使用手册](references/how-to-use.md) — 优化现有 UI 与创建新项目两条路的完整可执行流程

**方法篇**（设计判断）

- [设计方向](references/design-direction.md) — 认品类、拆标杆、定调性、起方向、差异检验
- [说服型骨架](references/direction-persuasion.md) — 首屏骨架选择
- [视觉语言](references/visual-language.md) — 层级、字体、色彩、空间、图标、减法
- [素材](references/media.md) — 选图、生成提示词、实时 3D 与视频
- [动效](references/motion.md) — 三处基本动效、手感、时长与检查
- [滚动叙事](references/scroll-narrative.md) — 落地页区块出场与滑动驱动叙事
- [游玩](references/play.md) — 小游戏、手感、状态检查
- [布局与视口](references/layout-and-viewport.md) — 断点、视口、精准还原
- [交互与状态](references/interaction-states.md) — 控件六态、反馈四类、危险操作确认、动效时长
- [表单](references/forms.md) — 分组、每字段四件事、错误三硬要求、校验时机
- [工作区布局](references/workspace-layout.md) — 后台骨架、状态区、表格、密度、移动端降级
- [存量改造](references/legacy-refactor.md) — 老项目改 UI 的分批流程、层叠陷阱、验证方式

**证据篇**

- [工具](references/tools.md) — 截图与录屏工具的完整用法
- [视觉评审派发协议](references/visual-review.md) · [评审手册](references/reviewer-manual.md)
- [风格对比页](references/style-explorer.md) — 多方向并排比较页

**规则库篇**（`references/uxdata/`）

- [快速参考](references/uxdata/quick-reference.md) — 119 条 UX 规则全文，按类分节
- [Pro 规则](references/uxdata/pro-rules.md) — 图标纪律、交互反馈、明暗对比、交付清单

**规则库检索**

```bash
python <本目录>/scripts/search.py "<query>" --domain <domain> [-n <结果数>]
python <本目录>/scripts/search.py "<query>" --stack <stack>
python <本目录>/scripts/search.py "<query>" --design-system [-p "项目名"] [--variance 1-10] [--motion 1-10] [--density 1-10]
```

domain（共 13 个，实测可用）：
`ux` `style` `color` `typography` `google-fonts` `chart` `icons` `gsap` `product` `landing` `web` `react`

stack（共 22 个，实测可用）：
`react` `nextjs` `vue` `svelte` `astro` `nuxtjs` `nuxt-ui` `angular` `laravel` `swiftui`
`react-native` `flutter` `jetpack-compose` `threejs` `javafx` `wpf` `winui` `avalonia`
`uno` `uwp` `html-tailwind` `shadcn`

domain 可省略，脚本会自动判别，但自动判别在重叠词上会误路由
（例如 `font` 同时命中 `typography` 与 `google-fonts`），结果不对就显式传 `--domain`。
**注意没有 `motion` 这个 domain**，动效相关的可检索项在 `gsap` 里。

`--density 8–10` 适合后台与仪表盘，`--density 1–3` 适合落地页。
`--persist --output-dir <项目根>` 可把设计系统落盘复用，
已有 `MASTER.md` 时默认不覆盖，需 `--force` 才会重写。