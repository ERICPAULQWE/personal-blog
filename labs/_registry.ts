import React from "react";

export type Lab = {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    fullScreen?: boolean; // 新增字段：是否开启全屏沉浸模式
};

export const labs: Lab[] = [
    {
        slug: "counter",
        title: "Counter Experiment",
        description: "一个最小交互示例：包含平滑数字过渡与弹性动画的计数器。",
        date: "2026-01-12",
        tags: ["React", "Framer Motion"],
        fullScreen: false,
    },
    {
         slug: "fire-calculator",
         title: "FIRE 计算器",
         description: "纯 React 构建的交互式计算工具。",
         date: "2026-01-14",
         tags: ["Tool", "Finance"],
         fullScreen: true, // 开启全屏模式
    },
];