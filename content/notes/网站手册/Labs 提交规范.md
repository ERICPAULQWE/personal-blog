---
title: "Labs 提交规范"
date: "2026-01-14"
description: "Labs 组件开发内容的提交规范详细介绍"
tags: ["React", "Next.js","Labs"]
status: "published" # published | draft
---

# Labs 提交规范

## 1) Admin 发布器到底做了什么

当你在 `/admin/labs` 点“发布到 GitHub”时，本质上会**一次性提交 2～3 类文件**：

1. `labs/<slug>/index.tsx`

   * 你的实验 React 组件源码（必须）
2. `labs/_registry.ts`

   * 自动在数组里追加一条 meta（必须）
3. `content/labs/<slug>.md`

   * 实验说明文档（可选；混合模式推荐写，全屏模式可空）

这三者共同决定：

* 实验是否出现在列表
* `/labs/<slug>` 是否能访问
* 页面是**混合模式**还是**全屏模式**

---

## 2) Admin 发布实验的正确使用流程

### Step A：填写元信息

* **Title**：展示标题
* **Slug**：URL 与目录名（`/labs/<slug>` + `labs/<slug>/index.tsx`）
* **Description**：列表/SEO 的一句话说明
* **Tags**：用于分类/检索（逗号分隔即可）
* **Date**：排序与展示日期

**Slug 建议规则**

* 小写 + `-` 分隔
* 不要中文（可以，但路径与工具链更易踩坑）
* 不要改来改去（会造成旧链接失效）

### Step B：选模式

* **混合模式**：上方 React 组件 + 下方 Markdown 文档
* **纯 React 全屏**：沉浸式应用（更适合工具/仪表盘/Canvas/独立交互笔记）

> 选择模式会写入 registry 的 `fullScreen` 字段（全屏为 `true`）。

### Step C：写组件代码（默认空）

你现在的发布器是：**默认组件代码为空**，这是正确的产品设计（防止误发布 demo）。

你有两种方式：

* 自己写
* 点击“重置为模板”生成一个最小可运行模板，再改

### Step D：写文档（可选）

* 混合模式：强烈建议写（用户需要理解实验）
* 全屏模式：可不写，但建议至少写一点“使用说明/快捷键/注意事项”

### Step E：发布

* 成功后：等待 Vercel 自动部署完成（新文件进入构建产物后才可访问）

---

## 3) Admin 提交的 Lab 组件硬性规范（不满足就会炸）

### 3.1 路径必须固定

必须生成：

```
labs/<slug>/index.tsx
```

### 3.2 必须是默认导出

✅

```tsx
export default function MyLab() { ... }
```

❌ 不要用命名导出当入口（否则动态加载拿不到 default）

### 3.3 必须是 Client Component

文件第一行（或最前面）必须有：

```tsx
"use client";
```

即使你的系统有“自动补”，也建议你主动写好（更清晰、更少歧义）。

### 3.3 在 Labs 组件中复用 Markdown 组件的指南（如果你需要使用markdown渲染的话）
你可以在任何 Lab 组件（例如 labs/counter/index.tsx）中直接导入并使用该组件。

示例代码：

TypeScript
// labs/counter/index.tsx
"use client";

import React from "react";
// 1. 引入你现有的 Markdown 组件
import { Markdown } from "@/components/markdown";

export default function CounterLab() {
  // 定义包含 LaTeX 的 Markdown 字符串
  const formula = `
  ### 核心公式
  这里演示了如何在 React 组件中渲染数学公式：
  
  行内公式：$E = mc^2$
  
  块级公式：
  $$
  f(x) = \\int_{-\\infty}^{\\infty} \\hat f(\\xi)\\,e^{2\\pi i \\xi x} \\,d\\xi
  $$
  `;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">计数器实验</h2>
      
      {/* 2. 像使用普通 React 组件一样使用它 */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <Markdown source={formula} />
      </div>
      
      {/* 你的其他交互组件 */}
      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        Count +1
      </button>
    </div>
  );
}

---

## 4) 全屏模式 vs 混合模式的布局规范

### 混合模式（推荐布局）

目标：组件“好看地放在舞台里”，不要撑爆高度，也不要抢占文档区。

推荐：

```tsx
return (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-3xl">
      ...
    </div>
  </div>
);
```

### 全屏模式（关键：必须占满）

全屏模式如果你根节点不写 `w-full h-full`，看起来就不会“全屏”。

必须：

```tsx
return (
  <div className="w-full h-full">
    ...
  </div>
);
```

**常见坑**

* 只在内部元素写 `h-full`，外层没撑开 → 无效
* 用 `min-h-screen` → 可能造成页面滚动与舞台布局冲突

---

## 5) 代码风格与工程约定（建议严格执行）

### 命名

* Slug：`kebab-case`
* 组件名：`PascalCase`
* Hook：`useXxx`
* 复杂逻辑拆分：内部组件 + hooks（同文件也可以）

### TypeScript

* 尽量不要 `any`
* 数据结构先定义类型
* 大段计算用 `useMemo`

### Tailwind / Dark mode

* 必须兼容 dark：`dark:*`
* 尽量用 neutral 系列（和站点统一）
* 避免引入自定义 css（除非必要）

---

## 6) 安全与可维护性红线（Admin 发布尤其要注意）

因为 Admin 发布会**直接写进 GitHub 仓库并部署公开**，所以：

### 禁止提交敏感信息

❌ 不要写：

* Token / API Key
* 私人接口地址
* 含隐私数据的样例

### 禁止引入 server-only 模块

Lab 在浏览器运行，不能引：

* `fs`
* `path`
* 任何 server-only 依赖

### 外部请求要克制

可以 `fetch`，但建议：

* 加 loading/error UI
* 防抖/缓存
* 注意 CORS
* 不要把请求变成 “页面一打开就狂刷接口”

---

## 7) 发布前自检清单（建议你贴在发布器旁边）

* [ ] `labs/<slug>/index.tsx` 存在
* [ ] 顶部有 `"use client";`
* [ ] `export default` 正确
* [ ] 全屏模式根节点 `w-full h-full`
* [ ] 没有敏感信息
* [ ] `npm run build` 本地能过（建议）
* [ ] 文档（混合模式）写了至少“如何使用/做了什么”

---

## 8) 推荐的“实验写法”模板策略

为了让未来可维护，建议你把实验分成三类来写：

1. **展示型（Hybrid）**

* 交互组件 + 解释文档
* 重在可读、可复用

2. **工具型（FullScreen）**

* 类小应用
* 做好布局、状态管理、快捷操作

3. **可视化/重依赖型（FullScreen + 懒加载）**

* 图表/Canvas/three 等
* 必须做动态加载，避免拖慢整个站。

------------------------------------------------------------------------

© Personal Blog · Labs System