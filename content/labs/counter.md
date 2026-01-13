---
title: "Counter Experiment"
date: "2026-01-12"
description: "探索 React 状态与 Framer Motion 布局动画的结合。"
---

## 实验原理

这个计数器主要演示了 **Layout Animation** 的平滑性。当数字发生变化时，并不是简单的文本替换，而是利用 `framer-motion` 的 `key` 属性触发了重排动画。

### 核心代码片段

我们使用了 `AnimatePresence` (隐式) 或 `key` 变化来触发重渲染动画：

```tsx
<motion.div
    key={count} // 关键：key 变化触发动画
    initial={{ scale: 0.9, opacity: 0.3 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300 }}
>
    {count}
</motion.div>

```

### 状态逻辑

根据数值的不同范围，我们计算出了不同的 "Vibe" 状态：

> [!info] Vibe Check
> * **Calm**: Count <= 0
> * **Warm**: 0 < Count < 10
> * **Electric**: Count >= 10
> 
> 

尝试点击 `+1` 按钮直到超过 10，观察底部标签的变化。

```

---

### 注意事项
1.  **路径别名**：代码中使用了 `@/labs/...` 和 `@/components/...`。如果你在运行 `npm run dev` 时遇到 "Module not found" 错误，请确保你的 `tsconfig.json` 中配置了 `"paths": { "@/*": ["./*"] }`（Next.js 默认通常是有的）。如果不行，请将其改为相对路径（如 `../../../labs/...`）。
2.  **无需修改 `lib/content.ts`**：我看过你上传的文件，你的 `lib/content.ts` 已经包含了 `getLabDoc` 函数，所以不需要修改它。

完成以上步骤后，刷新页面，你应该能看到上方是交互组件，下方是带有代码高亮和 Callout 的详细文档。

```
