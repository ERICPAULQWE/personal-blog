import React from "react";
// 1. 引入你的实际组件
// 假设你的计数器组件位于 labs/counter/index.tsx
import Counter from "./counter";

// 2. 更新类型定义，增加 component 字段
export type Lab = {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    component: React.ComponentType; // 关键：这是渲染交互舞台所需的组件引用
};

export const labs: Lab[] = [
    {
        slug: "counter",
        title: "Counter Experiment",
        description: "一个最小交互示例：包含平滑数字过渡与弹性动画的计数器。",
        date: "2026-01-12",
        tags: ["React", "Framer Motion"],
        component: Counter, // 3. 将组件挂载到这里
    },
    // 未来在这里添加更多组件...
];