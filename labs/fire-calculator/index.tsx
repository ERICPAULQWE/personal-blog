"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Target, Calendar } from "lucide-react";

// --- 工具函数：格式化货币 ---
const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);

export default function FireCalculator() {
    // --- 状态管理 ---
    const [currentAge, setCurrentAge] = useState(25);
    const [currentSavings, setCurrentSavings] = useState(50000);
    const [annualcontribution, setAnnualContribution] = useState(20000);
    const [returnRate, setReturnRate] = useState(7);
    const [annualExpenses, setAnnualExpenses] = useState(40000);

    // --- 核心计算逻辑 ---
    const calculation = useMemo(() => {
        const fireNumber = annualExpenses * 25; // 4% 法则：目标 = 年支出 * 25
        const data = [];
        let balance = currentSavings;
        let age = currentAge;
        let freedomAge = null;

        // 模拟未来 60 年的数据
        for (let i = 0; i <= 60; i++) {
            if (balance >= fireNumber && freedomAge === null) {
                freedomAge = age;
            }
            data.push({ age, balance });

            // 下一年复利计算
            balance = balance * (1 + returnRate / 100) + annualcontribution;
            age++;
        }

        return { fireNumber, freedomAge, data };
    }, [currentAge, currentSavings, annualcontribution, returnRate, annualExpenses]);

    const { fireNumber, freedomAge, data } = calculation;

    // --- 图表数据标准化 ---
    const maxBalance = Math.max(fireNumber * 1.5, data[data.length - 1].balance);
    const chartHeight = 300;
    const chartWidth = 600; // SVG 内部坐标系宽度

    // 生成 SVG 路径点
    const points = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = chartHeight - (d.balance / maxBalance) * chartHeight;
            return `${x},${y}`;
        })
        .join(" ");

    const targetY = chartHeight - (fireNumber / maxBalance) * chartHeight;

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans">

            {/* --- 左侧：控制面板 --- */}
            <div className="w-full lg:w-[400px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-8 overflow-y-auto custom-scrollbar">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">FIRE Calculator</h1>
                        <p className="text-xs text-neutral-500 font-medium">FINANCIAL INDEPENDENCE</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <InputGroup
                        label="当前年龄"
                        value={currentAge}
                        onChange={setCurrentAge}
                        min={18}
                        max={80}
                        step={1}
                        unit="岁"
                        icon={<Calendar size={16} />}
                    />
                    <InputGroup
                        label="当前存款"
                        value={currentSavings}
                        onChange={setCurrentSavings}
                        min={0}
                        max={1000000}
                        step={5000}
                        unit="$"
                        prefix
                        icon={<DollarSign size={16} />}
                    />
                    <InputGroup
                        label="年储蓄额 (投资)"
                        value={annualcontribution}
                        onChange={setAnnualContribution}
                        min={0}
                        max={200000}
                        step={1000}
                        unit="$"
                        prefix
                        icon={<TrendingUp size={16} />}
                    />
                    <InputGroup
                        label="年均收益率"
                        value={returnRate}
                        onChange={setReturnRate}
                        min={1}
                        max={15}
                        step={0.1}
                        unit="%"
                    />
                    <InputGroup
                        label="预期年支出 (退休后)"
                        value={annualExpenses}
                        onChange={setAnnualExpenses}
                        min={10000}
                        max={200000}
                        step={1000}
                        unit="$"
                        prefix
                        icon={<Target size={16} />}
                    />
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <h3 className="text-sm font-medium text-neutral-500 mb-1">你的 FIRE 目标金额</h3>
                    <div className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        {formatMoney(fireNumber)}
                    </div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                        根据 4% 安全提取法则，你需要存够年支出的 25 倍才能实现财务自由。
                    </p>
                </div>
            </div>

            {/* --- 右侧：可视化图表 --- */}
            <div className="flex-1 relative flex flex-col p-6 lg:p-12 overflow-hidden">

                {/* 结果概览卡片 */}
                <div className="z-10 mb-8 flex flex-col sm:flex-row gap-6">
                    <ResultCard
                        label="财务自由年龄"
                        value={freedomAge ? `${freedomAge} 岁` : "Never"}
                        sub={freedomAge ? `还有 ${freedomAge - currentAge} 年` : "需增加投入"}
                        highlight={!!freedomAge}
                    />
                    <ResultCard
                        label="60 岁时总资产"
                        value={formatMoney(data.find(d => d.age === 60)?.balance || 0)}
                        sub="复利的力量"
                    />
                </div>

                {/* SVG 交互图表容器 */}
                <div className="flex-1 w-full min-h-[300px] bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 relative shadow-inner">
                    <div className="absolute top-6 left-6 text-xs font-mono text-neutral-400">
                        ASSET GROWTH PROJECTION
                    </div>

                    {/* SVG Chart */}
                    <div className="w-full h-full flex items-end relative">
                        <svg
                            className="w-full h-full overflow-visible"
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            preserveAspectRatio="none"
                        >
                            {/* 渐变定义 */}
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* 目标线 (FIRE Line) */}
                            <motion.line
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, y1: targetY, y2: targetY }}
                                x1="0" x2={chartWidth}
                                stroke="currentColor"
                                strokeOpacity="0.2"
                                strokeDasharray="4 4"
                                strokeWidth="2"
                            />
                            <text x="0" y={targetY - 10} fill="currentColor" opacity="0.4" fontSize="12" fontWeight="bold">
                                FIRE TARGET: {formatMoney(fireNumber)}
                            </text>

                            {/* 面积填充 */}
                            <motion.path
                                d={`M 0 ${chartHeight} L ${points} L ${chartWidth} ${chartHeight} Z`}
                                fill="url(#chartGradient)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            {/* 曲线本体 */}
                            <motion.polyline
                                points={points}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />

                            {/* 自由点标记 (Freedom Point) */}
                            {freedomAge && (
                                <motion.circle
                                    cx={(data.findIndex(d => d.age === freedomAge) / (data.length - 1)) * chartWidth}
                                    cy={targetY}
                                    r="6"
                                    fill="#10b981"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.8, type: "spring" }}
                                />
                            )}
                        </svg>

                        {/* X 轴标签 */}
                        <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-neutral-400 font-mono mt-2 select-none">
                            <span>{currentAge}岁</span>
                            <span>{currentAge + 30}岁</span>
                            <span>{currentAge + 60}岁</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 子组件：输入组 ---
function InputGroup({
    label, value, onChange, min, max, step, unit, prefix = false, icon
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number; max: number; step: number; unit: string; prefix?: boolean; icon?: React.ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    {icon && <span className="text-neutral-400">{icon}</span>}
                    {label}
                </label>
                <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    {prefix ? unit : ""}{value}{!prefix ? unit : ""}
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
        </div>
    );
}

// --- 子组件：结果卡片 ---
function ResultCard({ label, value, sub, highlight = false }: { label: string; value: string; sub: string; highlight?: boolean }) {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex-1 p-6 rounded-2xl border ${highlight
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                } shadow-sm transition-colors`}
        >
            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${highlight ? "opacity-60" : "text-neutral-500"}`}>
                {label}
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
            <div className={`text-sm ${highlight ? "text-green-400 dark:text-green-600" : "text-neutral-400"}`}>
                {sub}
            </div>
        </motion.div>
    );
}