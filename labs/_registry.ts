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
         title: "财富自由计算器",
         description: "纯 React 构建的交互式计算工具。",
         date: "2026-01-14",
         tags: ["Tool", "Finance"],
         fullScreen: true, // 开启全屏模式
    },
    {
        slug: "wechat-sim",
        title: "微信聊天记录生成器",
        description: "高保真复刻 iOS 版微信聊天界面，支持自定义头像、文字、图片及高清长图导出。",
        date: "2026-01-13",
        tags: ["React", "工具", "仿真"],
        fullScreen: true,
    },
    {
        slug: "fourier-playground",
        title: "傅里叶变换视觉实验室",
        description: "集成谐波合成器、音频引擎与高级滤波器的全能 DSP 实验平台。",
        date: "2026-01-14",
        tags: ["DSP", "Visualization", "Canvas", "Audio"],
        fullScreen: true, // 必须为 true 以启用全屏布局
    },
    {
        slug: "z-transform-viz",
        title: "Z-变换交互单位圆",
        description: "可视化探索系统稳定性与零极点对频域特性的影响。",
        date: "2026-01-14",
        tags: ["DSP", "Math", "Interactive"],
        fullScreen: false, // 混合模式
    },
    {
        slug: "emoji-merge",
        title: "Emoji 合成大西瓜",
        description: "EMOJI合成大西瓜",
        date: "2026-01-14",
        tags: ["Game", "Physics", "Matter.js"],
        fullScreen: true,
    },
    {
        slug: "pathfinding", // URL 与目录名，使用小写加连字符
        title: "寻路算法可视化", // 页面显示的标题
        description: "演示启发式搜索如何在复杂地形中找到最短路径", // 用于列表页与 SEO 的摘要
        date: "2026-01-14", // 排序与展示日期，格式必须为 YYYY-MM-DD
        tags: ["Algorithm", "React", "Visualization"], // 分类标签
        fullScreen: false, // 混合模式设置为 false，组件将在舞台区域展示
    },
    {
        slug: "math-limits-chapter-1",
        title: "第一章：函数与极限（交互笔记）",
        description: "重构微积分第一章笔记，包含邻域可视化、ε-N 语言动态演示及重要极限的数值逼近实验。",
        date: "2026-01-22",
        tags: ["Math", "Calculus", "Visualization", "Note"],
        fullScreen: true, 
    },
];