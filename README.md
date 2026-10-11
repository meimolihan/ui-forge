# ui-forge

界面设计与优化 Skill。界面好不好看和任务走不走得通，**分开验收、分开取证**。

方法分两层，各管一段：

| 层 | 做什么 | 怎么用 |
| --- | --- | --- |
| **判断层** | 定方向、认品类、拆标杆、拉开差异 | 步骤 1–2，读 `references/` 的方法篇 |
| **规则层** | 可访问性、触控尺寸、对比度、字体、行高、动效时长、表单反馈 | 步骤 0/3，查 `scripts/search.py` 的规则库，有据可依 |

不要用规则库代替设计判断：规则能告诉你「对比度要 4.5:1」，不能告诉你
「这个产品该是什么气质」。也不要用设计判断代替规则：眼睛觉得「还行」，
实测可能 3.0:1。**两层都要走。**

## 按任务性质选路

| 场景 | 走哪条 |
| --- | --- |
| 新页面、要重新定视觉方向 | 步骤 1 方向探索 → 步骤 2 建结构 |
| 存量项目优化 UI | 先查规则库找系统性问题 → 按 `legacy-refactor.md` 分批改 |
| 无障碍、触控、密度、表单有问题 | 步骤 0 规则库 → 步骤 3 实测 |
| 后台、仪表盘、管理面板 | 读 `workspace-layout.md` 选布局 → 步骤 2 建结构 |
| 截图还原 | 步骤 2 建结构 → 每轮用 `shoot.mjs --compare` 比对 |
| 只做评审 | 步骤 4 诊断，交付证据与建议 |

## 安装

```bash
git clone <this-repo> ~/.workbuddy/skills/ui-forge
```

需要 Python 3（跑规则库检索）。无 Node 也可用，但 `verify_focus.mjs` 需要 Node。

## 怎么用

完整的分步说明在 [`references/how-to-use.md`](references/how-to-use.md)，
含可直接复制的命令和 manifest 模板。两条路在这里：

### 优化现有 UI

```text
说清诉求（视觉 / 流程 / 新功能）
  → 查规则库找系统性问题     ← 最容易跳过，也最值钱
  → 留基线截图（深浅 + 手机 + 有数据状态）
  → 分批改（可读性 → 布局 → 层级 → 动效），每批改完重新截图
  → 实测验证（焦点环 / 对比度 / 溢出）
  → 交付说明写清没验证什么
```

改动落点从上往下：设计变量 → 共享组件 → 页面 → 行内。
新样式集中追加在末尾并注明原因，不动既有规则。

### 创建新项目

```text
认品类、拆标杆（拿真实画面，不凭记忆）
  → 定三个风格真正不同的方向
  → 组装对比页交给用户挑 ← 这一轮到此为止
  → 选定后建视觉与交互结构
  → 取证、评审、交付
```

```bash
python scripts/build_explorer.py <任务目录>/manifest.json --output <任务目录>/style-explorer.html
```

`concept`、`typography`、`traits` 是必填项，HTML 候选必须是带完整 `<head>`
的文档——写错时生成器会一次列出所有要改的地方，且不动旧产物。

## 快速上手

查规则（最常用）：

```bash
python scripts/search.py "focus visible keyboard" --domain ux
python scripts/search.py "dashboard" --domain color
python scripts/search.py "ops console" --design-system --density 8 -p "Ops"
python scripts/search.py "rounded modal" --stack shadcn
```

截图取证：

```bash
node scripts/shoot.mjs page.html --size 1440x900 --out shots
node scripts/shoot.mjs page.html --evidence --states idle,done --out shots
```

验证键盘焦点：

```bash
node scripts/verify_focus.mjs page.html
# 缺焦点环时退出码为 1，可直接接CI
```

风格对比页：

```bash
python scripts/build_explorer.py --help
```

## 目录

```
ui-forge/
├── SKILL.md                  主流程
├── data/                     规则库数据（配色/字体/UX规则/技术栈…）
├── scripts/
│   ├── search.py             规则库检索（BM25）
│   ├── core.py               检索引擎
│   ├── design_system.py      设计系统生成
│   ├── shoot.mjs             截图与录屏
│   ├── build_explorer.py     风格对比页生成器
│   └── verify_focus.mjs      键盘焦点可见性验证
├── references/
│   ├── how-to-use.md         两条路的使用手册（先读）
│   ├── design-direction.md   方向探索方法
│   ├── visual-language.md    视觉层级与减法
│   ├── motion.md             动效
│   ├── media.md              素材与生成
│   ├── interaction-states.md 控件六态、反馈、危险操作
│   ├── forms.md              表单分组与校验
│   ├── workspace-layout.md   后台布局、表格与密度
│   ├── legacy-refactor.md    存量项目改造流程
│   ├── tools.md              截图工具完整用法
│   ├── reviewer-manual.md    评审手册
│   └── uxdata/               119 条 UX 规则全文
└── assets/                字体、对比页模板
```

## 判断层覆盖了什么

规则库有零散规则，缺一层把它们组织成工作流的判断。这四篇补的是这一层：

| 文件 | 补的是什么 |
| --- | --- |
| `interaction-states.md` | 规则库有零散的 hover/focus 规则，但没有「一个控件要写全六态」的检查表。补齐六态、loading 不改按钮尺寸、hover 要包 `@media (hover:hover)`、危险操作确认怎么写、动效时长表|
| `forms.md` | 规则库有 11 条 Forms 规则，但没给组织顺序。补齐先分组再画框、每字段四件事、错误三硬要求、校验时机表 |
| `workspace-layout.md` | 补齐后台布局按「用户第一动作」分类、状态区不超过 4 项、表格四要点、密度取舍、移动端降级 |
| `legacy-refactor.md` | 补齐老项目改 UI 的分批流程，以及四条只能实测发现的层叠陷阱 |

## 四个实战坑（写进 SKILL.md 了）

**`:where()` 会把修复变成制造 bug。** 用 `:where(button, input)` 写焦点环，
特异性为 0，压不过项目原有的 `.toolbar input{outline:none}`，
结果是焦点环被盖掉、键盘焦点比改之前更不可见。特异性不够时用带类名的选择器。

**验证 `:focus-visible` 必须派发真实按键。** 用 `element.focus()` 验证会得到
不稳定且错误的结果——程序化聚焦不算键盘意图，`:focus-visible` 不生效，
同样代码两次跑会给出不同的 MISS 列表。用 CDP `Input.dispatchKeyEvent` 派发
真正的 Tab 键。`verify_focus.mjs` 就是这么做的。

**别按列序写选择器。** `td:nth-child(5)` 在不同页签的表格里指向不同的列，
会误伤别的表格。用 `first-child`/`last-child` 或语义类名。

**别用 `opacity` 压暗辅助文字。** 它把文字和底色一起混算，对比度可能反而掉到
标准以下。直接指定一个达标色值——而且要按实际底色算：同一色压在白卡上达标，
压在斑马纹上可能不达标。

## 可用的检索域

实测共 **13 个 domain**：`ux` `style` `color` `typography` `google-fonts` `chart`
`icons` `gsap` `product` `landing` `web` `react`

**没有 `motion` 这个 domain**，动效相关的可检索项在 `gsap` 里。

stack 共 22 个：`react` `nextjs` `vue` `svelte` `astro` `nuxtjs` `nuxt-ui` `angular`
`laravel` `swiftui` `react-native` `flutter` `jetpack-compose` `threejs` `javafx`
`wpf` `winui` `avalonia` `uno` `uwp` `html-tailwind` `shadcn`

## 许可

本项目采用 MIT 协议发布。目录中保留了完整的第三方许可声明文件：

- `LICENSE.oil-ui`
- `LICENSE.uupm`

`data/` 下的规则库数据、字体数据与 `assets/fonts/` 内的字型均来自上述
MIT 授权来源，各字型的 OFL 条款见 `assets/fonts/instrument-serif/OFL.txt`。
