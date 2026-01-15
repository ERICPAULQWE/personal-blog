# personal-blog（个人博客与交互实验室）· 简略版开发与使用手册

> 面向非专业读者的“整体理解版”。  
> 站点核心是：把写在仓库里的 Markdown/React 代码，渲染成可浏览的网站；后台（Admin）只是“带权限的写回 GitHub 工具”，没有传统数据库。

---

## 1. 这是什么？（一句话）

这是一个 **以 GitHub 仓库为唯一数据源** 的个人创作系统：  
- **Notes**：用 Markdown 写文章/笔记  
- **Labs**：用 React 做交互实验（可配套 Markdown/MDX 文档）  
- **Admin**：登录后在线编辑/发布，最终写回 GitHub  
- **部署**：GitHub 写入 → 触发 Vercel 重新构建/部署（无数据库、天然可回溯）

---

## 2. 快速开始（本地跑起来）

前置：
- Node.js 建议 >= 18（实际以 `package.json` 的 engines 为准）
- 包管理器：npm / pnpm / yarn 均可

启动：
```bash
npm install
npm run dev
# 浏览器打开：
# http://localhost:3000
```

---

## 3. Notes：怎么写文章/笔记

### 3.1 放在哪里？URL 怎么来？
- 笔记放在：`content/notes/`（支持多级子目录）
- 路径会映射为页面地址（slug）：
  - `content/notes/foo.md` → `/notes/foo`
  - `content/notes/foo/bar.md` → `/notes/foo/bar`

### 3.2 头部信息（Frontmatter）
v2.0 手册里给了“必填”版本（含 `date/description/status`）；当前代码与补丁（Part B）里也给了“推荐/常用”版本（含 `published/createdAt/updatedAt`）。如果两者不一致，以 Part B 为准。

v2.0 示例（含草稿/发布状态）：
```yaml
---
title: "文章标题"
date: "2026-01-14"
description: "一句话摘要，用于列表与 SEO"
tags: ["React", "Next.js"]
status: "published" # published | draft
---
```

Part B 常用字段示例（含 published/时间字段）：
```yaml
---
title: "标题（可选，不写就用文件名）"
tags: ["tagA", "tagB"]   # 可选
published: true          # 可选；显式 false 会被当作草稿隐藏
createdAt: "2025-01-01"  # 可选；不写会用文件系统时间
updatedAt: "2025-02-01"  # 可选；不写会用文件系统时间
---
```

另外一个很重要的约定：
- **文件夹名会自动变成标签（tags）**。例如 `content/notes/ai/rl/ppo.md` 会自动追加 `ai`、`rl` 这两个标签。

### 3.3 Markdown 能力（你在文里能直接用的东西）
- 数学公式：
  - 行内：$E = mc^2$
  - 块级（单独一行）：

$$
\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}
$$
- Obsidian Callout（提示块/警告块等）：
  > [!info]
  > 提示内容
- 图片：
  - 支持标准 Markdown 图片
  - 也支持 Obsidian 风格图片语法与“带宽度的图片”（如 `![[filename.jpg|200]]`）

图片最终会通过站内接口 `/api/content/images/...` 提供：你只要把图片放进 `content/` 并在文中引用即可。

---

## 4. Labs：怎么做交互实验

### 4.1 Labs 的基本组成（三件套）
| 文件 | 是否必须 | 作用 |
| --- | --- | --- |
| `labs/_registry.ts` | 必须 | 实验注册表（元信息/配置） |
| `labs/[slug]/index.tsx` | 必须 | 实验 React 组件 |
| `content/labs/[slug].md` | 可选 | 实验说明文档 |

### 4.2 两种常见展示模式
- **混合模式（默认）**：上面是组件“舞台”，下面渲染 Markdown 文档
- **全屏模式（fullScreen: true）**：适合 Canvas/WebGL/复杂交互；组件根节点通常需要 `w-full h-full`

### 4.3 Labs 开发硬性规则（最容易踩坑的）
- 组件必须是 **默认导出**：`export default function MyLab() {}`
- 文件顶部必须有：`"use client";`（Labs 运行在浏览器端）
- 禁止引入 `fs/path/process/server-only` 或任何后端私密 token（会导致 build/运行失败）
- 发布前建议跑一次 `npm run build` 自检

---

## 5. Admin：后台能做什么、谁能进？

### 5.1 谁能登录？
- 使用 NextAuth + GitHub OAuth
- 通过 `ADMIN_GITHUB_USER` 做白名单：只有指定 GitHub 用户能登录成功

### 5.2 后台发布的本质是什么？
后台做的事非常“朴素”：
- 读取/编辑文件 → 调用管理接口 → **把文件写回 GitHub 仓库**
- 写回后是否“立刻生效”，取决于部署平台是否触发了新的构建/部署、以及缓存/ISR 策略

典型接口（概念）：
- 读文件：`/api/admin/repo-file`
- 发布写入：`/api/admin/publish`（可一次写多个文件，包含图片 base64）
- 删除：`/api/admin/delete`（限制必须在 `content/notes` 下，防止误删/越权）

---

## 6. 部署、搜索、评论（你可能关心的三个点）

### 6.1 部署（Vercel）
- 常见链路：GitHub Commit → Vercel 自动构建/部署
- 如果发布成功但前台没更新：优先检查是否触发新构建、是否被缓存、是否需要 revalidate

### 6.2 搜索（build-time）
- 搜索索引通常在 **构建阶段** 生成
- 因此内容更新后，需要重新构建/部署，索引才会更新

### 6.3 评论（Giscus）
- 需要一个启用 Discussions 的 GitHub 仓库
- 在站点里配置 giscus 参数（repo / repoId / category / categoryId 等）

---

## 7. 环境变量（线上部署常用）
```env
NEXTAUTH_SECRET=xxxx
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx
ADMIN_GITHUB_USER=你的GitHub用户名

GITHUB_ACCESS_TOKEN=xxxx
GITHUB_REPO_OWNER=ERICPAULQWE
GITHUB_REPO_NAME=personal-blog
GITHUB_BRANCH=main
NEXTAUTH_URL=线上域名（Part B 中提到需要配置）
```

---

## 8. 常见问题（快速排查）
- **后台登录失败**：检查 `ADMIN_GITHUB_USER`、OAuth 回调地址、`NEXTAUTH_URL`
- **发布失败（500）**：查看服务端日志（常见是 GitHub Token 权限不足、路径非法、图片 base64 错）
- **发布成功但前台不更新**：检查 Vercel 是否重新构建、是否缓存、是否需要 revalidate/webhook
- **搜索不更新**：属于 build-time 搜索的正常表现——需要重新构建后索引才更新