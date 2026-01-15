---
title: "开发与使用手册"
date: "2026-01-14"
description: "本博客系统的详细介绍"
tags: ["React", "Next.js"]
status: "published" # published | draft
---

# 个人博客与交互实验室 · 开发与使用手册（合并整理版 v3.1）

## 文档合并说明

本文件将以下两份 Markdown 文档合并整理为一份连续可读的手册，并仅做结构重组、逻辑合并、衔接性过渡与 Markdown 格式统一：

- 《个人博客系统开发与使用手册v3.1.md》
- 《PartB_B2-B3_更细更长版本.md》（其内容与上份文档中的 B-2/B-3 完全一致，已在本合并版中去重合并）

注意：原文已明确说明——若某条规则与 v2.0 不一致，请以 Part B 为准（尤其是：环境变量、鉴权、路由结构、Notes/Labs、搜索、部署）。

---

## 个人博客与交互实验室 · 开发与使用手册（v3.0 增量修订补充）

date: 2026-01-15  
description: 基于 ERICPAULQWE/personal-blog 仓库当前代码的增量修订补充内容；与 v2.0 原文合并发布（v2.0 原文保持不变，仅在末尾追加补丁）。

---

## Part B：基于当前代码库的增量修订与补充（v3.0）

> 本部分用于补充/修订 v2.0 手册中过时或缺失的内容。  
> 若某条规则与 v2.0 不一致，请以本 Part B 为准（尤其是：**环境变量、鉴权、路由结构、Notes/Labs、搜索、部署**）。

---

### B-0 你当前仓库的定位（从 README 归纳）

这是一个基于 **Next.js App Router** 的“现代个人博客 + 知识库”，核心目标是：

- 📚 Notes：来自 Obsidian 的 Markdown/MDX 笔记体系（标签、归档、系列）
- 🧪 Labs：React 驱动的交互实验与演示（配套 MDX 文档）
- 🔍 Search：构建时全文搜索
- 💬 Comments：Giscus（GitHub Discussion）
- 🌓 Dark Mode：系统主题切换
- 🚀 Deploy：Vercel + 自定义域名

> 这意味着：你的站点是“内容驱动 + 静态/半静态输出为主”，不依赖传统数据库后台。

---

### B-1 快速开始（本地开发）

**B-1.1 前置条件**

- Node.js：建议 >= 18（实际以 `package.json` engines 为准）
- 包管理器：npm / pnpm / yarn 均可

**B-1.2 安装与启动**

```bash
npm install
npm run dev
# 浏览器打开：
# http://localhost:3000
```

---

### B-2 技术栈与架构（你现在已经不是 v2.0 那套结构）

> 目标：用“从请求进来 → 找内容 → 渲染成页面 → 静态/动态输出”的视角，把整个站点跑起来所需的关键模块、数据流、目录约定、渲染管线都讲清楚。看完你应该能：  
> 1）知道任何一个页面/接口对应的源码位置；2）知道笔记从 `content/` 进入系统后经历了哪些处理；3）知道图片/Callout/数学公式/目录 TOC 等能力是在哪里实现的；4）知道“哪些是构建期做的、哪些是请求期做的”。

**B-2.1 技术栈与运行时边界（你需要先知道的“基础事实”）**

- 框架：Next.js（App Router）+ React（Server Component 为主，局部 Client Component）。  
- 语言与构建：TypeScript；Node.js 版本要求以 `package.json` 的 engines 为准（建议本地/CI/生产一致）。  
- 站点内容与渲染：主要以 Markdown 为内容源；通过 Unified/Remark/Rehype 的流水线把 Markdown 编译成 HTML，再由 React 组件注入到页面中。  
- 鉴权与后台：NextAuth（GitHub Provider）做登录，API Route 里用 `getServerSession` 做鉴权。  
- 发布：后台把编辑后的内容写回到 GitHub 仓库（同 repo）——本质就是对 repo 文件做 create/update/delete（Octokit）。

> 你可以把这个项目理解为两条主链路：  
> **阅读链路（Public）**：读取 `content/` → 解析 frontmatter → Markdown 渲染 → 页面输出  
> **管理链路（Admin）**：登录鉴权 → 读取/编辑 → 调用 API → 写回 GitHub → 刷新站点

---

**B-2.2 目录结构与“职责分层”——按功能把代码拆开看**

为了理解工程，不要按“文件夹看起来像啥”去记，而要按“职责层”去看：

1) **路由层（app/）**  
负责 URL → 页面/接口。  
- `app/**/page.tsx`：页面路由  
- `app/api/**/route.ts`：接口路由（Next.js Route Handler）

2) **内容与数据层（lib/ + content/）**  
- `content/`：内容源（笔记、图片、草稿等）  
- `lib/content.ts`：内容读取与结构化（解析 frontmatter、收集 tags、排序、过滤等）  
- `lib/tree.ts`：把“扁平文件列表”组装成树（用于左侧目录树/文件树）

3) **渲染层（components/）**  
- `components/markdown.tsx`：Markdown 编译/渲染核心（支持 Obsidian 图片、Callout、KaTeX、GFM 等）

4) **样式/主题层（Tailwind + next-themes）**  
- `app/layout.tsx` + `components/theme-provider.tsx`：全局布局与主题切换（dark/light/system）

> 一句话总结：  
> **app/** 决定“你访问什么”；**lib/** 决定“从哪里拿到什么数据”；**components/** 决定“拿到数据后怎么显示”。

---

**B-2.3 内容源 content/ 的约定：文件怎么组织会影响站点行为**

**1）笔记的根目录约定**

站点的“笔记内容”来自 `content/notes/`（递归读取）。你可以按任意层级建文件夹，文件名建议使用英文/数字/短横线，避免奇怪字符引起 URL 编码问题。

**2）Frontmatter 字段（最常用）**

每篇笔记顶部可以写 YAML frontmatter，例如：

```yaml
---
title: "标题（可选，不写就用文件名）"
tags: ["tagA", "tagB"]   # 可选
published: true          # 可选；显式 false 会被当作草稿隐藏
createdAt: "2025-01-01"  # 可选；不写会用文件系统时间
updatedAt: "2025-02-01"  # 可选；不写会用文件系统时间
---
```

> 站点会把这些字段结构化成 Note 对象，供列表页、详情页、标签页、索引接口等使用。

**3）“文件夹名会自动变成标签”这个约定（很重要）**

站点会把“该笔记相对 `content/notes` 的路径里所有文件夹名”自动追加到 tags 里。  
例如：`content/notes/ai/rl/ppo.md`  
- frontmatter tags: `["paper"]`  
- folder tags: `["ai", "rl"]`  
最终 tags = `["paper","ai","rl"]`

这意味着：你可以用文件夹来做“天然分类”，但在系统里它仍然表现为 tags 维度。

---

**B-2.4 内容读取与结构化：lib/content.ts 做了什么**

`lib/content.ts` 的核心职责是：把磁盘上的 `.md` 文件变成站点可用的结构化数据（数组/对象）。

**1）递归收集所有 Markdown 文件**

它会从 `content/notes` 递归遍历，收集所有以 `.md` 结尾的文件，生成扁平列表。

**2）解析 frontmatter + 生成 Note 对象**

每个文件都会：
- `gray-matter` 解析 YAML frontmatter 与正文内容
- `title`：优先 frontmatter.title，否则用文件名（去掉 `.md`）
- `tags`：frontmatter.tags + folder tags 去重合并
- `published`：默认 true；如果 frontmatter 明确写 `published: false` 则视为草稿
- `createdAt/updatedAt`：优先 frontmatter；否则用文件系统的 ctime/mtime

**3）排序与筛选**
- `getAllNotes()` 默认只返回 published 的笔记（草稿不出现在公开列表）  
- 列表排序默认按更新时间（updatedAt）倒序（没有 updatedAt 时用 createdAt）

**4）常用派生函数**

除了全量获取外，还会提供：
- `getNotesByTag(tag)`：按 tag 过滤  
- `groupNotesByMonth(notes)`：按月份分组（用于归档/时间线视图等）

---

**B-2.5 页面与接口是如何“消费”这些内容的（关键数据流）**

下面用几条典型链路把内容如何流到页面讲透：

**链路 A：笔记列表页 /notes（目录树 + 列表）**

1. `/notes` 页面（Server Component）调用 `getAllNotes()` 拿到全部 note 列表。  
2. 同时用 `buildFileTree(notes)` 把扁平列表变成树结构，方便渲染左侧“文件夹/文件”导航。  
3. 把 `notes` 与 `tree` 作为 props 交给 `NotesClient`（Client Component）处理交互（筛选/高亮/折叠等）。

> 你可以把 /notes 理解为：**Server 负责拿数据 + 组树；Client 负责交互体验**。

**链路 B：笔记详情页 /notes/[...slug]（静态参数 + Markdown 渲染 + TOC）**

1. `generateStaticParams()` 会枚举所有笔记的 slug（通常用于 SSG/预生成）。  
2. 访问某篇笔记时，根据 URL slug 去 `getAllNotes()` 里找到对应 note。找不到就 `notFound()`。  
3. 使用 `getTableOfContents(note.content)` 生成目录（TOC），用于右侧/顶部的目录导航。  
4. 正文渲染使用 `components/markdown.tsx`：把 Markdown 编译成 HTML，然后注入到页面中。

**链路 C：用于“全文检索/快速预览”的索引接口 /api/notes-index**

1. 这个接口同样调用 `getAllNotes()` 获取笔记列表。  
2. 对每篇笔记的 Markdown 正文做一次“去 Markdown 语法”处理（stripMd），生成纯文本 preview。  
3. 返回 JSON：每条包含 `slug/title/tags/updatedAt/preview`，前端可用来做搜索框联想、列表摘要等。

---

**B-2.6 Markdown 渲染管线：为什么你能写 Obsidian 图片/Callout/公式**

`components/markdown.tsx` 是“内容体验”的核心。它基于 unified 的插件链路做了下面这些能力：

**1）标准 Markdown + GFM**
- `remark-parse`：解析 Markdown AST  
- `remark-gfm`：支持表格、删除线、任务列表等 GitHub Flavored Markdown  
- `remark-breaks`：把“单换行”也渲染成 `<br>`（更贴近 Obsidian 的手感）  
- `remark-math` + `rehype-katex`：支持 `$$`/`$` 数学公式并用 KaTeX 渲染

**2）Obsidian 图片语法 + “带宽度的图片”**

项目实现了一个 `remarkSmartImage` 插件，兼容两种写法：

- Obsidian wiki-link：`![[filename.jpg|200]]`  
- 标准 Markdown 图片但带宽度：`![](./path/filename.jpg|200)`

处理逻辑要点：
- 只要图片 URL 不是 http 开头，就会被重写到站内接口：`/api/content/images/<filename>`  
- 如果带 `|200`，会被解析为 width，并写入 `style: width: 200px; height: auto;`  
- 自动附加 className（圆角、阴影、margin 等），保证整体风格一致

**3）Obsidian Callout**

实现了 `remarkObsidianCallout`：识别 blockquote 里开头的 `[!NOTE]`、`[!TIP]` 等语法，并转换为更语义化的 HTML 结构：
- 普通 callout → `<div class="callout" data-callout="note">...`
- 可折叠 callout（带 `+/-`）→ `<details open>...<summary>...</summary>...</details>`

**4）HTML 注入（支持少量自定义 HTML）**

渲染链路里开启了 `allowDangerousHtml` + `rehype-raw`，意味着 Markdown 正文里出现的 HTML 片段会被渲染进页面。  
这让你更自由，但也意味着：**内容源必须可信（自己写的内容 OK；不应渲染用户提交的陌生内容）**。

---

**B-2.7 图片服务：为什么最终能访问 /api/content/images/xxx.png**

Markdown 里所有“站内图片”都会被重写到 `/api/content/images/...`，这个接口的职责是：

1. 根据 URL 参数（`imagePath`）拿到图片文件名/路径段  
2. 在 `content/` 下递归查找匹配文件（找不到就 404）  
3. 根据扩展名决定 Content-Type（png/jpg/jpeg/gif/webp）  
4. 以二进制 body 返回，同时设置缓存头（Cache-Control）

> 你写内容时只需要关心：把图片放进 `content/` 里，并在 Markdown 里引用它。路由和 MIME 类型这些脏活都由接口完成。

---

**B-2.8 构建期 vs 请求期：性能与刷新机制（务必理解）**

- **构建期（build）**：  
  - `generateStaticParams()` 枚举 slug → 支持静态生成  
  - Next.js 会尽可能把页面预渲染成静态 HTML  
- **请求期（runtime）**：  
  - API Route（如 `/api/notes-index`、`/api/content/images`）按请求运行  
  - 后台写回 GitHub 后，站点是否立即生效取决于部署平台的构建/缓存策略（例如 Vercel 重新构建、ISR revalidate 等）

> 如果你发现“后台发布后页面没更新”，第一优先排查：部署平台是否触发了新的构建/部署，或是否需要显式 revalidate。

---

**B-2.9 你改动一个功能通常要去哪里找（快速定位表）**

- **内容读取逻辑（frontmatter、tags、排序、是否隐藏草稿）** → `lib/content.ts`  
- **左侧目录树（树结构生成、排序）** → `lib/tree.ts`  
- **Markdown 渲染（图片/Callout/公式/换行）** → `components/markdown.tsx`  
- **笔记列表页 UI/交互** → `app/notes/*`（Server + Client）  
- **索引/搜索接口** → `app/api/notes-index/route.ts`  
- **图片接口** → `app/api/content/images/[...imagePath]/route.ts`

### B-3 权限与鉴权（非常关键的更新）

> 目标：把“谁能进后台、后台能做什么、一次发布到底发生了哪些网络请求/代码调用、出现错误怎么排查”讲清楚。  
> 这一节建议你边看边对照源码，因为它就是“运维 + 编辑 + 发布”的主入口。

---

**B-3.1 后台入口与路由分布（你从哪里进来）**

后台相关页面通常放在 `app/admin/**` 下（例如编辑、导入、管理等）。  
这些页面本质都是普通的 Next.js 路由，只是它们会在渲染时做一次 session 检查：没有登录/无权限就跳转或提示。

典型行为（以删除页为例）：
- 页面渲染时调用 `getServerSession()` 获取 session
- 没有 session → `redirect("/api/auth/signin")`
- 有 session → 展示后台 UI（例如列表、按钮、确认对话框等）

---

**B-3.2 鉴权机制：只有“指定 GitHub 用户”可以登录成功**

项目使用 NextAuth + GitHub Provider 做登录，并且在 `signIn` 回调里做了“白名单限制”：

- 环境变量 `ADMIN_GITHUB_USER` 指定允许登录的 GitHub 用户名（login）。  
- 当用户 OAuth 完成后，NextAuth 会把 GitHub 的 profile 交给 `callbacks.signIn()`：  
  - 如果 `profile.login === ADMIN_GITHUB_USER` → 允许登录  
  - 否则直接返回 false（登录失败）

因此：**不是随便一个 GitHub 账号都能进后台**；除非你把它加入白名单（改环境变量/改逻辑）。

> 这套机制的优点：简单、成本低、和 GitHub 账号体系绑定。  
> 缺点：如果未来需要多人协作（多 admin），要把逻辑改成数组/组织/团队校验。

---

**B-3.3 API 侧鉴权：所有敏感接口都必须“二次校验 session”**

后台页面的 UI 端做 session 检查只是“体验层”；真正的安全边界必须在 API Route 里。  
本项目的管理接口普遍会在 handler 开头做：

1. `getServerSession(authOptions)`  
2. 没拿到 session → 返回 401 Unauthorized  
3. 拿到 session → 继续处理（读/写/删仓库文件）

这样就算有人直接 curl 请求接口（绕开页面），也拿不到权限。

---

**B-3.4 “读取仓库文件”接口：/api/admin/repo-file**

用途：后台编辑器需要先把某个 Markdown 文件的内容读出来展示给你改。  
该接口的典型流程：

1. 从 query string 读取 `path` 参数（例如 `content/notes/xxx.md`）  
2. 做 `decodeURIComponent()` 避免 URL 编码带来的路径问题  
3. `getServerSession(authOptions)` 鉴权，失败则 401  
4. 调用 `readRepoFile(filePath)` 从 GitHub 仓库读取文件内容  
5. 返回 JSON：`{ content, sha }`  
   - `content`：文件内容（字符串）  
   - `sha`：GitHub blob sha（后续更新用来做并发控制/更新目标）

> 这个接口是“编辑器读数据”的基础能力；只要你要在后台打开一个现有文件，就会走它。

---

**B-3.5 “发布/写入”接口：/api/admin/publish（核心）**

用途：把后台编辑器里的改动“写回 GitHub 仓库”。  
它支持一次写多个文件（比如：一篇笔记 Markdown + 多张图片）。

**1）请求体结构（概念模型）**

接口预期 JSON 里包含一个 files 数组，每个元素类似：

```json
{
  "files": [
    { "path": "content/notes/xxx.md", "content": "...markdown..." },
    { "path": "content/images/a.png", "content": "<base64>", "isBase64": true }
  ]
}
```

其中：
- `path`：要写入仓库的目标路径（相对 repo 根目录）  
- `content`：内容字符串；如果是二进制（图片），用 base64 字符串  
- `isBase64`：可选；true 表示 content 已经是 base64，需要按二进制写入 GitHub

**2）接口内部做了什么（一步一步）**

一次 publish 请求内部会：

1. `getServerSession(authOptions)`：鉴权（没 session → 401）  
2. `req.json()`：解析 payload  
3. 遍历 `files`：对每个文件分别写入  
   - 如果 `isBase64`：把 base64 字符串转成 Buffer，再转回 base64（确保格式正确）  
   - 否则：把文本内容直接当作 UTF-8 写入  
4. 对每个文件调用 `updateRepoFile(path, content, message)`：  
   - message 默认形如 `Update <path>`  
   - 由 GitHub API 创建或更新文件内容  
5. 全部成功 → 返回 `{ success: true }`  
6. 任意失败 → 记录 `GitHub Upload Error` 并返回 500（包含 error 信息）

> 也就是说：publish 接口本质是“批量 updateRepoFile 的薄封装”，它不关心 Markdown 语法，也不关心你写的是笔记还是图片，它只关心“路径 + 内容”。

---

**B-3.6 “删除”接口：/api/admin/delete（防止误删的关键安全带）**

用途：删除某篇笔记文件、或删除某个目录（连同目录下所有文件）。  
它做了两层关键保护：

**1）路径规范化与目录限制（防 path traversal）**
- 把传入的 path 用 `path.normalize()` 规范化  
- 明确要求必须以 `content/notes` 开头  
- 否则直接拒绝（403）

这可以避免有人传入类似 `../../.env` 这种路径去删仓库敏感文件。

**2）按类型选择删除方式**
- 如果是文件：`deleteRepoFile(path)`  
- 如果是目录：`deleteRepoDirRecursive(path)`（递归列出目录下所有内容并逐个删除）

同时，接口会把错误记录成 `GitHub Delete Error` 并返回 500，便于排查。

---

**B-3.7 GitHub 读写的底层封装：lib/github.ts**

后台所有“对 GitHub 仓库的真实操作”都集中在 `lib/github.ts`，常见方法包括：

- `readRepoFile(path)`：读取文件内容与 sha  
- `updateRepoFile(path, contentBase64OrUtf8, message)`：创建/更新文件  
  - 内部通常会先尝试读旧文件拿 sha（存在则更新，不存在则创建）  
- `deleteRepoFile(path)`：删除单个文件  
- `deleteRepoDirRecursive(dir)`：递归删除目录下所有文件/子目录  
  - 需要调用 GitHub API 列目录（contents API），并对每个子项递归处理

把 GitHub 操作封装起来的好处：
- API Route 更“薄”（只做鉴权、参数解析、错误处理）  
- GitHub 交互逻辑集中可复用，也更容易改动（比如将来换成别的存储）

---

**B-3.8 一次“编辑并发布”到底发生了什么（把链路串起来）**

以“编辑一篇笔记并发布”为例：

1. 你进入后台编辑页  
2. 页面请求 `/api/admin/repo-file?path=content/notes/xxx.md`  
   - API 校验 session  
   - GitHub 返回 content + sha  
3. 你在编辑器里修改内容并点击发布  
4. 页面请求 `/api/admin/publish`，payload 里带上：
   - Markdown 文件的新内容（UTF-8 文本）  
   - 可能还有图片（base64）  
5. publish API 校验 session → 逐个 updateRepoFile  
6. GitHub 创建 commit（或更新文件内容）  
7. 前端提示成功，并可能触发页面刷新/跳转（例如回到 /notes）

> 站点能否“立刻看到新内容”，取决于部署平台是否会在仓库更新后触发重新构建/重新部署。  
> 如果你部署在 Vercel 并且开启了 GitHub 自动部署，通常会自动触发。

---

**B-3.9 常见故障排查（很实用）**

**1）后台登录失败**
- 检查 `ADMIN_GITHUB_USER` 是否配置正确  
- 检查 OAuth App 的回调地址/Client ID/Secret 是否正确  
- 看 NextAuth 日志：`signIn` 回调返回 false 时通常会直接拒绝

**2）发布失败（500）**
- 看 server log：通常会出现 `GitHub Upload Error`，里面包含 GitHub API 的错误原因  
- 常见原因：
  - Token 权限不够（缺 contents:write）  
  - 写入路径非法/不存在（或被 GitHub 拒绝）  
  - base64 内容不合法（图片编码错误）

**3）删除失败（500）**
- 看 `GitHub Delete Error` 日志  
- 常见原因：
  - 目录递归删除中途遇到特殊文件类型/权限问题  
  - 传入 path 不在 `content/notes` 下（会被 403 拒绝）

**4）发布成功但前台没更新**
- 排查部署平台是否触发新构建  
- 排查页面是否被缓存（ISR/静态资源）  
- 如果需要“立即生效”，考虑加 revalidate 逻辑或在后台发布后触发 webhook

---

**B-3.10 安全提示与改进方向（可选，但建议写在手册里）**

- 当前安全模型依赖 GitHub 登录白名单 + session 校验，适合个人站点/小团队。  
- 如果未来多人协作：
  - `ADMIN_GITHUB_USER` 改成允许多个用户（数组/逗号分隔）  
  - 或用 GitHub Org/Team 做权限判断  
- 如果未来开放“用户投稿/评论”等 UGC：  
  - 需要严格收紧 Markdown 里的 raw HTML（目前允许 `rehype-raw`）  
  - 需要在存储层做隔离（不要让外部用户影响 repo 内容）

### B-4 目录结构与路由地图（以当前仓库为准）

关键结构（以 README 描述为准）：

- `src/app/`：App Router 页面与 layouts
- `src/components/`：复用组件
- `src/lib/`：内容与工具逻辑
- `src/content/notes/`：Notes 内容（md/mdx）
- `src/content/labs/`：Labs 文档（md/mdx）
- `public/`：静态资源

**B-4.1 站点主要页面路由（基于结构的常见映射）**

通常会包含（后续你若需要更细，我可以继续按代码逐个补全到页面级别）：

- `/notes`：笔记列表
- `/notes/[...slug]`：笔记详情（多级目录 slug）
- `/labs`：实验列表
- `/labs/[slug]`：实验详情（组件 + 文档）
- `/tags`：标签聚合
- `/archive`：归档
- `/search`：搜索页

---

### B-5 Notes 内容系统（写作/组织方式的“正确姿势”）

**B-5.1 路径 = slug（多级目录就是多级 URL）**

你现在的内容系统是典型 “filesystem routing” 思路：

- `content/notes/foo.md` -> `/notes/foo`
- `content/notes/foo/bar.md` -> `/notes/foo/bar`

✅ 建议做法：用文件夹组织主题，形成天然导航结构。

**B-5.2 frontmatter 约定（推荐）**

> 具体字段会在 `lib/content` 的实现里使用；以下是实践最稳的一套。

```yaml
---
title: 标题
date: 2026-01-15
description: 一句话摘要（用于列表/SEO）
tags:
  - 标签1
  - 标签2
status: published # draft / published
---
```

建议规则：

- 草稿：`status: draft`（避免进入列表/索引）
- 标签：尽量统一英文/拼音，避免同义不同写
- 日期：尽量 `YYYY-MM-DD`

---

### B-6 Labs 交互实验室（已成为仓库核心模块之一）

**B-6.1 Labs 的基本组成（推荐结构）**

每个实验通常包含：

1) 实验组件（React）  
2) 实验文档（MDX/Markdown）

典型组织：

- `labs/<slug>/...`：实验源代码
- `content/labs/<slug>.md(x)`：实验说明文档

**B-6.2 全屏实验与交互复杂度（建议）**

如果实验是：

- Canvas / WebGL / 音频 / 复杂交互  
建议做“全屏或舞台优先布局”。

如果实验是：

- 文档解释为主 + 小演示  
建议保持普通布局（文档优先）。

---

### B-7 搜索系统（build-time full-text search）

说明：

- 搜索索引通常在构建阶段生成（避免运行时扫描全量内容）
- 优点：快、无需数据库
- 缺点：内容更新必须触发重新构建/部署才能更新索引

建议：

- Notes/Labs 更新走 Git commit -> Vercel 自动构建
- 如果后续你启用 Admin UI 在线发布，也要确保发布后触发重新构建（或改为 runtime index）

---

### B-8 评论系统（Giscus）

你需要准备：

- 一个用于承载评论的 GitHub 仓库（可就是本仓库，或单独 comments 仓库）
- 开启 Discussions
- 在站点里配置 giscus 参数（repo / repoId / category / categoryId 等）

---

### B-9 部署（Vercel + 自定义域名）

**B-9.1 Vercel 环境变量**

在 Vercel Project -> Settings -> Environment Variables 里至少配置：

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_GITHUB_USER`

**B-9.2 验证清单**

部署后至少验证：

- `/notes` 是否能正常显示内容
- `/labs` 是否能正常加载实验
- `/search` 是否有索引结果
- `/api/auth/*` 登录流程是否正常（Admin）

---

### B-10 故障排查（第一批）

**B-10.1 Admin 登录失败 / 无权限**

检查：

- `ADMIN_GITHUB_USER` 是否等于你登录的 GitHub 用户名（大小写不敏感，但别拼错）
- OAuth callback URL 是否与域名一致
- `NEXTAUTH_URL` 是否设为线上域名

**B-10.2 搜索不更新**

这是 build-time 搜索的正常表现：

- 内容更新 -> 需要重新构建 -> 索引才更新  
如果你希望“发布即更新搜索”，需要改为 runtime index 或增量索引。

---

### B-11 后续可继续追加的“超详细补全清单”（可选）

为了达到“非常长、非常详细、覆盖方方面面”的目标，后续可继续按仓库逐文件补齐：

1) Notes 的 content helper 实现（如何读取、过滤 draft、排序、series/标签聚合）  
2) Markdown/MDX 渲染链（remark/rehype 插件、数学公式、Callout、Obsidian 图片语法支持）  
3) 图片与静态资源策略（public vs content 内资源，路径与转换规则）  
4) Labs 注册表、动态加载、全屏、路由参数约束  
5) Search 索引生成脚本、索引结构、前端检索逻辑、性能优化  
6) giscus 评论组件的配置与安全注意  
7) 全站布局与主题系统（dark mode、字体、排版、阅读设置）  
8) SEO、sitemap、RSS、OpenGraph、metadata  
9) Admin 发布/删除能力（若已实现：API route、GitHub 写入、提交策略、失败回滚）  
10) 代码贡献规范、目录约定、组件规范、测试与 lint

---

## 附录：v2.0 手册原文（信息点不删减，格式统一）

## 个人博客与交互实验室 · 开发与使用手册

**项目名**：personal-blog\
**版本**：v2.0\
**适用对象**：开发者 / 内容创作者 / 未来维护者\
**核心架构**：Next.js App Router + TypeScript + Tailwind CSS +
NextAuth + GitHub API + Vercel\
**更新机制**：GitHub 写入 → 自动部署（无数据库架构）
---
### 一、项目设计目标

本项目并非传统博客，而是一个 **以 GitHub
为唯一数据源的个人创作系统**，支持：

-   📘 Markdown 驱动的技术文章（Notes）
-   🧪 React 驱动的交互实验（Labs）
-   🛠 带权限的 Admin 内容生产后台
-   🚀 无数据库、零运维、可版本回溯的发布链路

设计核心原则：

-   **内容即代码**
-   **Git 即数据库**
-   **Registry 控制可见性**
-   **部署即发布**
---
### 二、目录结构总览

    personal-blog/
    ├─ app/                    # Next.js App Router（页面与 API）
    │  ├─ page.tsx             # 首页
    │  ├─ notes/               # Notes 页面
    │  ├─ labs/                # Labs 页面
    │  ├─ admin/               # 管理后台
    │  └─ api/                 # API Route Handlers
    │
    ├─ content/                # Markdown 内容库
    │  ├─ notes/               # 博客文章
    │  └─ labs/                # Labs 文档说明
    │
    ├─ labs/                   # Labs React 代码库
    │  ├─ _registry.ts         # 实验注册表（核心）
    │  └─ [slug]/index.tsx     # 单个 Lab 的 React 组件
    │
    ├─ components/             # 通用 UI 组件
    ├─ lib/                    # 工具库（Auth / GitHub 等）
    └─ public/                 # 静态资源
---
### 三、Notes（标准笔记）使用指南

**3.1 Notes 的定位**

Notes 用于：

-   技术文章
-   学习笔记
-   经验总结
-   理论性 / 阅读型内容

它是 **阅读优先** 的内容形态。
---
**3.2 文件位置**

所有笔记必须放在：

    content/notes/

-   支持多级子目录
-   目录结构会映射为 URL 与标签

示例：

    content/notes/ai/llm.md
    → /notes/ai/llm
---
**3.3 Frontmatter 规范（必填）**

``` yaml
---
title: "文章标题"
date: "2026-01-14"
description: "一句话摘要，用于列表与 SEO"
tags: ["React", "Next.js"]
status: "published" # published | draft
---
```

-   `draft` 状态不会出现在前台
-   日期格式必须为 `YYYY-MM-DD`
---
**3.4 Markdown 增强支持**

**数学公式（LaTeX）**

-   行内：$E = mc^2$
-   块级：

    $$
    \sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}
    $$

**Obsidian Callout**

> [!info]
> 提示内容

> [!warning]
> 注意事项

**图片**

推荐使用标准 Markdown：

``` md
![alt](/images/example.png)
```
---
### 四、Labs（交互实验）系统【重点】

**4.1 Labs 的核心定位**

Labs 是本项目的核心特色，用于：

-   算法与数据结构可视化
-   交互式工具
-   原型验证
-   沉浸式前端应用

Labs = **React 组件 +（可选）Markdown 文档**


**4.2 Labs 的三件套**

| 文件                       | 是否必须 | 作用       |
| ------------------------ | ---- | -------- |
| labs/\_registry.ts       | 必须   | 注册与元数据   |
| labs/\[slug\]/index.tsx  | 必须   | React 组件 |
| content/labs/\[slug\].md | 可选   | 文档说明     |

### 五、LAB 代码开发规范与注意事项（详细）

**5.1 路径与加载机制（硬性）**

-   Lab 组件路径 **必须是**：

```html
<!-- -->
```
    labs/<slug>/index.tsx

-   前台通过动态导入：

``` ts
dynamic(() => import(`@/labs/${slug}/index`), { ssr: false })
```

路径或导出错误将导致 **Component not found**。
---
**5.2 导出与 Client Component 规范（硬性）**

**必须是默认导出**

``` tsx
export default function MyLab() {}
```

**必须包含 Client 指令**

``` tsx
"use client";
```

原因：

-   Labs 全部运行在浏览器端
-   依赖 hooks / DOM / 交互
-   不支持 Server Component
---
**5.3 混合模式 vs 全屏模式**

**混合模式（默认）**

-   组件在舞台区域展示
-   下方渲染 Markdown 文档

推荐结构：

``` tsx
<div className="w-full flex justify-center">
  <div className="max-w-3xl w-full">
    {/* UI */}
  </div>
</div>
```

**全屏模式（fullScreen: true）**

-   注册表中设置 `fullScreen: true`
-   组件根节点必须 `w-full h-full`

``` tsx
<div className="w-full h-full">
  {/* App */}
</div>
```

常见错误：

-   只给内部元素 `h-full`
-   使用 `min-h-screen` 破坏舞台布局
---
**5.4 代码风格与工程约定**

-   TypeScript 优先，避免 `any`
-   组件使用 PascalCase
-   hooks 使用 `useXxx`
-   Tailwind 使用 neutral 系列
-   dark 模式必须同步支持
---
**5.5 禁止事项（非常重要）**

Labs 组件 **禁止引入**：

-   fs / path
-   process / server-only
-   后端私密 token

否则会导致 build 或运行失败。
---
**5.6 浏览器 API 使用建议**

-   window / document / localStorage
-   建议放在 `useEffect` 中
-   避免首次渲染不一致
---
**5.7 性能与体积建议**

-   重型库建议懒加载
-   使用 `useMemo` / `useCallback`
-   避免首屏阻塞计算
---
**5.8 发布前自检清单**

-   [ ] labs/<slug>/index.tsx 存在
-   [ ] 文件顶部包含 `"use client";`
-   [ ] 默认导出组件
-   [ ] 全屏模式使用 `w-full h-full`
-   [ ] 未引入 server-only 模块
-   [ ] 无敏感信息
-   [ ] `npm run build` 通过
---
**5.9 最小模板**

**混合模式**

``` tsx
"use client";

export default function Lab() {
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-3xl w-full p-6 border rounded-xl">
        Hello Lab
      </div>
    </div>
  );
}
```

**全屏模式**

``` tsx
"use client";

export default function Lab() {
  return (
    <div className="w-full h-full p-6">
      Full Screen Lab
    </div>
  );
}
```
---
### 六、Admin 管理后台

**6.1 权限模型**

-   NextAuth + GitHub OAuth
-   登录后校验 GitHub 用户名
-   未授权用户无法访问 `/admin/*`
---
**6.2 Labs 发布流程**

1.  访问 `/admin/labs`
2.  填写元信息（title / slug / tags）
3.  选择模式（混合 / 全屏）
4.  编写组件代码（默认空）
5.  可选填写 Markdown 文档
6.  发布 → GitHub Commit → Vercel 自动部署
---
### 七、GitHub 写入与部署机制

-   所有发布通过 GitHub API 写入仓库
-   每次发布对应一次 commit
-   Vercel 自动监听并重新部署
-   无数据库、天然版本控制
---
### 八、环境变量（Vercel）

``` env
NEXTAUTH_SECRET=xxxx
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx
ADMIN_GITHUB_USER=你的GitHub用户名

GITHUB_ACCESS_TOKEN=xxxx
GITHUB_REPO_OWNER=ERICPAULQWE
GITHUB_REPO_NAME=personal-blog
GITHUB_BRANCH=main
```
---
### 九、设计理念总结

-   内容即代码
-   Git 即数据库
-   Admin 是内容生产工具
-   Labs 是长期演进的实验平台
---
---
