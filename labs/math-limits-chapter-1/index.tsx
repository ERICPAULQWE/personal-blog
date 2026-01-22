"use client";

import React, { useState, useMemo } from "react";
// 请确保你的项目中存在该组件，通常路径为 @/components/markdown
import { Markdown } from "@/components/markdown";

// --- 静态内容定义 (放在组件外以避免 TSX 解析歧义) ---

const MD_PART1 = `
## 一、 变量与函数

### 1. 常量与变量
* **常量**：在某一过程中数值保持不变的量。
* **变量**：在过程中数值变化的量。

### 2. 实数系
* **有理数集**：具有**稠密性**。
* **实数集 $\\mathbb{R}$**：具有**连续性**，实数点铺满了整个数轴。

---

## 二、 集合、区间与邻域

### 1. 邻域 (Neighbourhood)
* **定义**：设 $a$ 与 $\\delta$ 是两个实数，且 $\\delta > 0$。数集 $\\{x \\mid |x - a| < \\delta\\}$ 称为点 $a$ 的 $\\delta$ 邻域，记作 $U(a, \\delta)$。
  * 中心：$a$；半径：$\\delta$。
  * 去心邻域：$\\dot{U}(a, \\delta)$。
`;

const MD_PART2 = `
---

## 三、 函数的概念与特性

### 1. 函数定义
设数集 $D \\subset \\mathbb{R}$，如果对 $\\forall x \\in D$，按对应法则 $f$，总有唯一确定的值 $y$ 与之对应，记为 $y = f(x)$。

### 2. 函数的特性
* **有界性**：存在 $M > 0$，使 $|f(x)| \\le M$。
* **奇偶性**：偶函数 $f(-x) = f(x)$；奇函数 $f(-x) = -f(x)$。

---

## 四、 数列的极限

### 1. 精确定义 ($\\epsilon-N$ 语言)
设 $\\{x_n\\}$ 为一数列，$a$ 为一常数。如果对于**任意**给定的正数 $\\epsilon$，总存在正整数 $N$，使得对于 $n > N$ 时的一切 $x_n$，不等式
$$|x_n - a| < \\epsilon$$
恒成立，则称常数 $a$ 是数列 $\\{x_n\\}$ 的**极限**。
`;

const MD_PART3 = `
---

## 五、 函数的极限

### 1. 自变量趋于定值 ($x \\to x_0$)
若对于任意给定的 $\\epsilon > 0$，总存在 $\\delta > 0$，使得当 $0 < |x - x_0| < \\delta$ 时，恒有 $|f(x) - A| < \\epsilon$。

---

## 六、 无穷小与无穷大

### 1. 无穷小 (Infinitely Small)
* **定义**：以零为极限的变量称为**无穷小量**。
* **定理**：$\\lim f(x) = A \\iff f(x) = A + \\alpha(x)$ (其中 $\\alpha$ 为无穷小)。

### 2. 无穷小的比较
* **等价无穷小**：若 $\\lim \\frac{\\beta}{\\alpha} = 1$，则称 $\\alpha \\sim \\beta$。
  * 常用替换：$\\sin x \\sim x, \\ln(1+x) \\sim x, e^x-1 \\sim x$。
`;

const MD_PART4 = `
---

## 七、 极限存在准则及两个重要极限

### 1. 两个重要极限
* $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$
* $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e$

---

## 八、 函数的连续性

* **定义**：若 $\\lim_{x \\to x_0} f(x) = f(x_0)$，则称函数在点 $x_0$ 处连续。
* **间断点**：第一类（可去、跳跃）与第二类（无穷、振荡）。
`;

// --- 辅助 UI 组件 ---

const InteractionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="my-8 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-neutral-900">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-neutral-500 dark:text-neutral-400">INTERACTIVE LAB</span>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{title}</span>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// --- 交互子组件 ---

const NeighborhoodDemo = () => {
    const [a, setA] = useState(2);
    const [delta, setDelta] = useState(0.5);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-neutral-500">{`中心点 a: ${a}`}</span>
                    <input type="range" min="-3" max="3" step="0.5" value={a} onChange={(e) => setA(parseFloat(e.target.value))} className="w-40 accent-blue-500" />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-neutral-500">{`半径 δ: ${delta}`}</span>
                    <input type="range" min="0.1" max="2" step="0.1" value={delta} onChange={(e) => setDelta(parseFloat(e.target.value))} className="w-40 accent-emerald-500" />
                </div>
            </div>
            <div className="relative h-20 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center px-8 overflow-hidden">
                <div className="absolute w-full h-0.5 bg-neutral-300 dark:bg-neutral-600"></div>
                {[-4, -2, 0, 2, 4].map(tick => (
                    <div key={tick} className="absolute h-3 w-0.5 bg-neutral-300 top-1/2 -translate-y-1/2 text-xs text-neutral-400 flex flex-col items-center justify-end pt-6" style={{ left: `${((tick + 5) / 10) * 100}%` }}>
                        {tick}
                    </div>
                ))}
                <div className="absolute h-8 bg-emerald-500/20 border-x-2 border-emerald-500 flex items-center justify-center transition-all duration-300 ease-out" style={{ left: `${((a - delta + 5) / 10) * 100}%`, width: `${((delta * 2) / 10) * 100}%`, top: '50%', transform: 'translateY(-50%)' }}>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">{`U(${a}, ${delta})`}</span>
                </div>
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300" style={{ left: `${((a + 5) / 10) * 100}%` }}></div>
            </div>
        </div>
    );
};

const EpsilonNDemo = () => {
    const [epsilon, setEpsilon] = useState(0.1);
    const sequence = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ n: i + 1, val: 1 + (Math.pow(-1, i) / (i + 1)) })), []);
    const N = useMemo(() => Math.floor(1 / epsilon) + 1, [epsilon]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">{`设定 ε: ${epsilon.toFixed(3)}`}</span>
                    <input type="range" min="0.05" max="0.5" step="0.01" value={epsilon} onChange={(e) => setEpsilon(parseFloat(e.target.value))} className="w-64 accent-rose-500" />
                </div>
                <div className="text-right">
                    <div className="text-xs text-neutral-500">{"必须存在的 N 为："}</div>
                    <div className="text-2xl font-bold text-rose-500">{`N > ${N - 1}`}</div>
                </div>
            </div>
            <div className="relative h-64 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <div className="absolute w-full h-px bg-blue-500 z-10" style={{ top: '50%' }}></div>
                <div className="absolute w-full bg-rose-500/10 z-0 transition-all duration-300 border-y border-rose-500/30" style={{ top: '50%', height: `${epsilon * 200}px`, transform: 'translateY(-50%)' }}>
                    <span className="absolute right-2 top-0 text-[10px] text-rose-500">{"a + ε"}</span>
                    <span className="absolute right-2 bottom-0 text-[10px] text-rose-500">{"a - ε"}</span>
                </div>
                <div className="absolute h-full w-px bg-rose-500/50 border-l border-dashed border-rose-500 z-20 transition-all duration-300" style={{ left: `${(N / 30) * 100}%` }}>
                    <span className="absolute top-2 left-1 text-xs font-bold text-rose-500">{`N=${N}`}</span>
                </div>
                {sequence.map((pt) => (
                    <div key={pt.n} className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-300 ${pt.n >= N ? (Math.abs(pt.val - 1) < epsilon ? 'bg-emerald-500' : 'bg-red-500') : 'bg-neutral-400'}`} style={{ left: `${(pt.n / 30) * 100}%`, top: `${50 - (pt.val - 1) * 100}%`, transform: 'translate(-50%, -50%)' }}></div>
                ))}
            </div>
        </div>
    );
};

const ImportantLimitsDemo = () => {
    const [x, setX] = useState(1);
    const val1 = Math.pow(1 + 1 / x, x);
    const t = 1 / x;
    const sinVal = Math.sin(t) / t;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
                <h4 className="font-bold text-neutral-700 dark:text-neutral-300 border-b pb-2">
                    {`极限 II: $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e$`}
                </h4>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg font-mono text-sm space-y-2">
                    <div className="flex justify-between">
                        <span>{`x = ${x}`}</span>
                        <span className="text-neutral-500">{"自变量"}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-blue-600">
                        <span>{`${val1.toFixed(7)}...`}</span>
                        <span>{"Result"}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <h4 className="font-bold text-neutral-700 dark:text-neutral-300 border-b pb-2">
                    {`极限 I: $\\lim_{t \\to 0} \\frac{\\sin t}{t} = 1$`}
                </h4>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg font-mono text-sm space-y-2">
                    <div className="flex justify-between">
                        <span>{`t = 1/${x} ≈ ${t.toFixed(4)}`}</span>
                        <span className="text-neutral-500">{`变量 t $\\to$ 0`}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-emerald-600">
                        <span>{`${sinVal.toFixed(7)}...`}</span>
                        <span>{"Result"}</span>
                    </div>
                </div>
            </div>
            <div className="col-span-1 md:col-span-2">
                <input type="range" min="1" max="1000" step="1" value={x} onChange={(e) => setX(parseInt(e.target.value))} className="w-full accent-purple-500" />
            </div>
        </div>
    );
};

// --- 主导出组件 ---

export default function MathChapter1Lab() {
    return (
        <div className="w-full flex justify-center bg-white dark:bg-neutral-950 min-h-screen">
            <div className="w-full max-w-4xl px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-neutral-900 dark:text-neutral-100">
                        {"第一章：函数与极限"}
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        {"微积分学习的基石：从直观理解到严格的定义。"}
                    </p>
                </div>

                <Markdown source={MD_PART1} />
                <InteractionCard title="邻域可视化演示">
                    <NeighborhoodDemo />
                </InteractionCard>

                <Markdown source={MD_PART2} />
                <InteractionCard title="ε-N 极限定义动态演示">
                    <EpsilonNDemo />
                </InteractionCard>

                <Markdown source={MD_PART3} />
                <InteractionCard title="两个重要极限数值逼近">
                    <ImportantLimitsDemo />
                </InteractionCard>

                <Markdown source={MD_PART4} />
            </div>
        </div>
    );
}