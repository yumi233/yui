# yui

安静的纸面与墨色设计系统：设计变量、`yui-*` 组件和两个小脚本。无框架、无构建、无外部字体。来自木生（`yumi233/SD-Chinese-style-furniture`）的 v3 界面。

- 组件库在线预览：<https://yumi233.github.io/yui/>
- 组件规则：[docs/RULES.md](docs/RULES.md)

## 文件

| 文件 | 作用 |
| --- | --- |
| `dist/tokens.css` | 颜色、字体、间距、圆角、阴影、动效变量；日间写在 `:root`，夜间写在 `[data-theme="night"]` |
| `dist/components.css` | 全部 `yui-*` 组件，以及复选框、滑杆、文件选择、`<dialog>` 的统一样式 |
| `dist/select.js` | 可选。原生 `<select>` 自动变成带列表的 `.yui-picker`，代码照常读写原生 select |
| `dist/fluid-motion.js` | 可选。分段、标签页的滑动高亮；对话框从打开它的按钮处展开 |

顺序固定：先 `tokens.css`，再 `components.css`，再项目自己的页面样式。

## 用法

**纯 HTML（CDN，固定版本）**

```html
<html data-theme="day">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/yumi233/yui@v1.0.0/dist/tokens.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/yumi233/yui@v1.0.0/dist/components.css" />
<script type="module" src="https://cdn.jsdelivr.net/gh/yumi233/yui@v1.0.0/dist/select.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/yumi233/yui@v1.0.0/dist/fluid-motion.js"></script>

<button class="yui-button" data-variant="primary">生成</button>
```

**npm 项目（React、Astro、Vite 等）**

```sh
npm install github:yumi233/yui#v1.0.0
```

```js
import "@yumi233/yui/tokens.css";
import "@yumi233/yui/components.css";
import "@yumi233/yui/select.js";        // 可选
import "@yumi233/yui/fluid-motion.js";  // 可选
```

**只能放静态文件的项目**：把 `dist/` 复制到项目的静态目录（木生用 `npm run ui:sync` 从固定版本同步到 `public/vendor/yui/`，测试保证两边一致）。

## 换强调色

只改这三个变量，日夜各一套，其余组件质感保持不变：

```css
:root { --olive: #3E5C8A; --sage: #8AA4C8; --sage-soft: #E3EAF4; }
[data-theme="night"] { --olive: #A8C0E6; --sage: #8AA4C8; --sage-soft: #1F2A3A; }
```

## 主题

`<html data-theme="day">` 或 `"night"`。语言切换等改了选项文字后，在 `window` 上派发 `new Event("yui:refresh")`，下拉会同步。

## 版本

按语义化版本发布 tag（`v1.0.0`）。改组件外观或类名是大版本，新增组件是小版本，修正是补丁。改动前先读 [docs/RULES.md](docs/RULES.md)，新组件同时加进 `index.html` 组件库页面；`npm test` 会检查组件库只用真实存在的类名、组件文件不混入项目专用类名。

## 许可

GPL-3.0，与木生一致。
