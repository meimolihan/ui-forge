# 明暗双主题

深浅两套不是把颜色反过来调亮调暗，是**两套各自独立验过的配色**。
这一篇讲怎么搭、怎么切、怎么验。

---

## 目录导航

- [令牌：两套值，一个语义名](#令牌两套值一个语义名)
- [浅色不能由深色反推](#浅色不能由深色反推)
- [切换按钮](#切换按钮)
- [防闪烁：脚本必须在 head 里](#防闪烁脚本必须在-head-里)
- [跟随系统与手动选择的优先级](#跟随系统与手动选择的优先级)
- [切主题要触发什么](#切主题要触发什么)
- [自查](#自查)

---

## 令牌：两套值，一个语义名

一套语义名，两处赋值。不要给元素写具体色值。

```css
:root {                      /* 深色为默认 */
  --bg:#0E1013; --panel:#15181D; --panel-2:#101317;
  --line:#262B33; --text:#EDEFF2; --muted:#98A1AC;
  --run:#34D399; --warn:#FBBF24; --stop:#F87171;
  --nav-bg:rgba(14,16,19,.86);
}
:root[data-theme="light"] {   /* 浅色覆写同名令牌 */
  --bg:#F7F8F7; --panel:#FFFFFF; --panel-2:#F1F3F2;
  --line:#DDE1DE; --text:#1A1D21; --muted:#525A63;
  --run:#0F7A52; --warn:#8A5A00; --stop:#B3261E;
  --nav-bg:rgba(247,248,247,.86);
}
```

规则：

- 元素只写 `var(--token)`。验收标准很简单：`grep -c 'var(--'` 的数量
  应该接近硬编码色值的 0 倍，硬编码色值剩 0 个（图标 `currentColor`、
  纯白/纯黑这类极端值除外）。
- **半透明叠加也要令牌化**：`--nav-bg`、`--hover`、`--sel-bg`、
  `--brand-dot-glow` 这类 `rgba` 同样两套各一份。半透明是主题切换最容易漏的
  一类，因为它不像色值那样扎眼。
- 状态色是语义名不是颜色名：`--run`/`--warn`/`--stop`，不是 `--green`/`--yellow`。
  两套里它们可能一个亮一个暗，但语义不变。
- 一屏里出现的表面层级不超过三档（页面底 / 面板 / 面板内的次级区）。
  层级多了，两个主题都会显脏。

---

## 浅色不能由深色反推

**深色的达标色值，调亮 60% 一定不达标。** 深色底上的对比度靠底色低、明度高；
浅色底上明度高就等于对比度低。把 `--run:#34D399` 拉浅成 `#5FE0B0` 放到白底上，
对比度会掉到 2:1 上下。

浅色的一套要**重新选值**，按浅色底重新算：

| 语义 | 深色 | 浅色 | 浅色底上的对比度 |
| --- | --- | --- | --- |
| `--run` 绿 | `#34D399` | `#0F7A52` | 5.0:1 |
| `--warn` 黄 | `#FBBF24` | `#8A5A00` | 5.6:1 |
| `--stop` 红 | `#F87171` | `#B3261E` | 6.1:1 |
| `--muted` 灰 | `#98A1AC` | `#525A63` | 6.6:1 |
| `--dim` 更弱 | `#7C8592` | `#666D77` | 4.9:1 |

三条经验：

- **浅色的状态色要往深里调，不是往浅里调**。饱和的绿、蓝在白底上尤其不达标。
- **浅色底上「弱化文字」不等于「调浅」**。深色主题的弱化文字是压低明度，
  浅色主题的弱化文字是调低明度但不能低于 4.5:1——通常落在 `#666D77` 一档，
  而不是 `#9AA0A6`。
- **带底色的元素要单独验**。列表选中行、时间戳、日志正文落在
  `--panel-2` 而不是 `--bg` 上，同样的色值在两处对比度不同，两处都算一遍。

**用户给成套色板时，先算一遍再决定怎么用。** 现成的调色板（如品牌色、
设计系统导出）常常是**为某个单一底色设计的**，不是双主题通用的。
实测过一套八色板：深底上七色通过（4.5–16:1），白底上只有两色通过，
Light Pink / Neon Green / Pale Lavender 三色在白底上只有 1.3–1.4:1——
直接搬进浅色主题会整片失效。

这种情况的处理顺序：

1. **先算底色通过率**。逐色算两套底上的对比度，明确「深色可用 n 个、浅色可用 m 个」。
2. **深色主题用原色**。色板原样铺开即可。
3. **浅色主题逐档加深，不另配色相**。以原色为基准乘一个系数（0.5–0.75）得到深色版本，
   保持色相不变，每个角色单独定系数而非统一乘。参考值：
   正文类 ×0.72、次要类 ×0.6、状态色 ×0.5–0.6、强调 ×0.74。
4. **加深后复算**。系数是估的，必须重新验一遍才算数。
5. **半透明叠加跟着换**。色板给了实色不代表给了 `rgba`，叠加层仍要各配一套。

按色相走不换色相，是这条规则的重点——用户挑的是一套配色关系，
不是六个孤立色值。加深不改变它们的比例关系，只是整体压暗到可用区间。

**验收必须两主题各跑一次截图**。只在深色下验对比度，等于没验。

---

## 切换按钮

一颗滑块在两态间移动，比两个图标各亮各的更容易读懂当前状态——
滑块在左是深色，在右是浅色，位置本身就是状态。

```css
.theme { position:relative; width:58px; height:30px; min-height:30px;
  border:1px solid var(--line-2); background:var(--panel-2);
  border-radius:15px; cursor:pointer; padding:0;
  display:flex; align-items:center; }
.theme__thumb { position:absolute; top:2px; left:2px;
  width:24px; height:24px; border-radius:50%;
  background:var(--text); color:var(--bg);
  transition:transform .26s cubic-bezier(.2,.7,.3,1); }
:root[data-theme="light"] .theme__thumb {
  transform:translateX(28px); background:var(--run); color:#FFF; }
```

要点：

- **滑块移动用 `transform`**，不用 `left`。`left` 会触发布局，动画会抖。
- 时长 0.2–0.3s，用带一点回弹的缓动。超过 0.4s 就显得卡。
- **图标在滑块里，两态图标各自 `display:none/block` 互斥**。不要让两个图标
  并排灰着，那样按钮会变成两个状态而不是一个开关。
- **触控目标 ≥24px**（工具默认会查），但滑块是 24px 时按钮容器不要正好 24px，
  留出余量：58×30 是好用的尺寸。
- **按钮要有 `aria-label`**，且随当前主题更新（「切换到浅色主题」/「切换到深色主题」），
  读屏用户听不出当前处于哪一态。标签文案描述**动作**不是状态。
- 顺带给一个 hover 提示（文字或 `title`），让不确定的用户知道这能点什么。

---

## 防闪烁：脚本必须在 head 里

页面在脚本跑之前就已经按默认深色画过一遍了。用户本地存的是浅色时，
他会先看到一帧深色再跳到浅色。

解法是在 `<head>` 里、**样式和内容之前**同步解析一次：

```html
<head>
  <style>/* ... */</script>
  <script>
    (function () {
      var KEY = 'x-theme';
      var root = document.documentElement;
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      root.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));
    })();
  </script>
</head>
```

要点：

- 这段代码**不能等 DOMContentLoaded**。它必须同步、在首帧之前跑完。
- 读 `localStorage` 必须 `try/catch`。隐私模式下 `getItem` 会抛异常，
  不包会让整个脚本挂掉，主题永远不切换。
- 按钮的事件绑定可以放在 `DOMContentLoaded` 里，但**设置属性必须在 head 里**。
  两件事分开写，别一起等到 DOMContentLoaded。
- 顺手用同一个 head 脚本顺手把 favicon 补上（内联 `data:` 的 SVG），
  省一次 404。

---

## 跟随系统与手动选择的优先级

规则只有一条：**用户手动选过之后，不再跟随系统**。

```js
var saved = read();
root.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));
if (!saved) {                       // 只有没手动选过才跟随
  mq.addEventListener('change', function (e) {
    root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
  });
}
```

用户特意调过的主题，被系统日夜切换无声改回去是恼人的。
`matchMedia` 的监听要兼容 `addEventListener` 与旧的 `addListener`。
手动切换后写回 `localStorage`，写入同样 `try/catch`。

---

## 切主题要触发什么

切的是 `data-theme` 属性，所有 `var(--token)` 会自动跟着变——**前提是没有
硬编码色值漏在外面**。切完检查这几类：

- `::selection` 背景与文字
- 半透明叠加层（导航底、hover 底、选中行底）
- 主按钮（`--primary-btn` 这类语义别名要两套各一份）
- `box-shadow` / `text-shadow`（里面写死的 `rgba` 是暗色假设）
- SVG 图标的 `fill`/`stroke`（用 `currentColor`，别写死）
- 渐变的两端色

**主题切换不触发滚动动效的重算**。GSAP 时间线里的颜色值如果写死了，
切主题后那几帧还是旧色。要么把颜色也令牌化让 CSS 过渡接手，
要么在切换回调里调 `ScrollTrigger.refresh()`。

---

## 自查

- [ ] `grep -c 'var(--'` 覆盖全部颜色，`rgba` 硬编码剩 0
- [ ] 两个主题各截一次图，两份都过对比度
- [ ] 用户给的成套色板**算过底色通过率**，深浅各用各的，不是原样铺两遍
- [ ] 浅色加深不换色相（保持配色关系），加深后复算过
- [ ] 浅色状态色是重新选的，不是深色值调亮
- [ ] 带底色的元素（选中行、日志区、次级面板）在两种底色上各算一遍
- [ ] 切换按钮有 `aria-label` 且随状态更新，触控目标 ≥24px
- [ ] head 里的同步脚本能防首帧闪烁，读 localStorage 有 try/catch
- [ ] 手动选过之后系统日夜切换不再改回来
- [ ] `::selection`、半透明叠加、主按钮、阴影、图标颜色在两主题下都对
- [ ] 切完主题滚动一整页，没有残留旧颜色的区块