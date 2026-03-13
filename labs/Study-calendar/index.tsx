"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";

/**
 * ✅ Labs 兼容版（全屏 A）：单文件、零外部 UI 依赖、TypeScript 严格模式通过
 * - 不依赖 shadcn：移除 @/components/ui/*
 * - 不强依赖 lucide-react：用内置 SVG 小图标
 * - 解决 TS7006/TS7053 等：完整类型标注 + 索引签名
 * - 复制：Clipboard API 可能被 Permissions Policy 禁用 → 自动弹窗手动复制/下载
 */

// -----------------------------
// Types
// -----------------------------

type SubjectKey = "math" | "english" | "signals" | "politics";

type WeekPlan = {
    subjects: Record<SubjectKey, string>;
    outputs: string[];
    notes: string[];
};

type Week = {
    weekNo: number;
    weekStartISO: string;
    weekEndISO: string;
    phaseId: string;
    phaseName: string;
    phaseTip: string;
    plan: WeekPlan;
};

type CopyModalState = {
    open: boolean;
    title: string;
    description: string;
    text: string;
    suggestedFilename: string;
    suggestedMime: string;
};

type ClipboardResult =
    | { ok: true; method: "clipboard" | "execCommand" }
    | { ok: false; method: "clipboard" | "execCommand" | "none"; error: string };

type Prefs = {
    reviewDayIndex: number; // 0..6
    showDailyTemplate: boolean;
};

type DoneState = Record<
    number,
    {
        outputsDone?: boolean[];
        customDone?: boolean[];
    }
>;

type CustomTasksState = Record<number, string[]>;

// -----------------------------
// Tiny UI primitives (Tailwind only)
// -----------------------------

function cn(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(" ");
}

function Icon({ name, className }: { name: "calendar" | "copy" | "download" | "search" | "info" | "spark" | "check" | "filter"; className?: string }) {
    const common = cn("inline-block align-middle", className);
    // Minimal inline SVGs (no dependency)
    switch (name) {
        case "calendar":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
            );
        case "copy":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            );
        case "download":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M12 15V3" />
                </svg>
            );
        case "search":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
            );
        case "info":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            );
        case "spark":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l1.2 5.2L18 8l-4.8 1.1L12 14l-1.2-4.9L6 8l4.8-.8L12 2z" />
                    <path d="M5 13l.7 3L9 17l-3.3.9L5 21l-.7-3L1 17l3.3-1L5 13z" />
                </svg>
            );
        case "check":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            );
        case "filter":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9v7l4 2v-9l8-9z" />
                </svg>
            );
    }
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm", className)}>{children}</div>;
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-4 md:p-5", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("px-4 pb-4 md:px-5 md:pb-5", className)}>{children}</div>;
}

function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled,
    className,
    type = "button",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "outline" | "secondary";
    size?: "sm" | "md";
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
}) {
    const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed";
    const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
    const styles =
        variant === "primary"
            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            : variant === "secondary"
                ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                : "border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-900";
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={cn(base, sizes, styles, className)}>
            {children}
        </button>
    );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border border-white/10", className)}>
            {children}
        </span>
    );
}

function Input({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}) {
    return (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={cn(
                "h-10 w-full rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white",
                className
            )}
        />
    );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full border transition",
                checked
                    ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white"
                    : "bg-slate-200 border-slate-200 dark:bg-neutral-800 dark:border-neutral-800"
            )}
            aria-pressed={checked}
        >
            <span
                className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-950 transition",
                    checked ? "translate-x-5" : "translate-x-1"
                )}
            />
        </button>
    );
}

function Separator() {
    return <div className="h-px w-full bg-slate-200 dark:bg-neutral-800" />;
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3 py-1 rounded-full text-sm border transition",
                active
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                    : "bg-white dark:bg-neutral-950 hover:bg-slate-50 dark:hover:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
            )}
        >
            {children}
        </button>
    );
}

function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl">
                <div className="p-4 md:p-5">
                    <div className="text-base font-semibold text-slate-900 dark:text-white">{title}</div>
                    {description ? <div className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{description}</div> : null}
                </div>
                <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>
                {footer ? <div className="px-4 pb-4 md:px-5 md:pb-5 flex justify-end gap-2">{footer}</div> : null}
            </div>
        </div>
    );
}

function Tabs({
    tabs,
    active,
    onChange,
}: {
    tabs: Array<{ key: string; label: string }>;
    active: string;
    onChange: (key: string) => void;
}) {
    return (
        <div className="inline-flex rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    onClick={() => onChange(t.key)}
                    className={cn(
                        "px-3 py-2 text-sm rounded-2xl transition",
                        active === t.key
                            ? "bg-slate-900 text-white dark:bg-white dark:text-neutral-900"
                            : "text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-900"
                    )}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

function Accordion({ items }: { items: Array<{ title: string; bullets: string[] }> }) {
    const [openIdx, setOpenIdx] = useState<number | null>(0);
    return (
        <div className="space-y-2">
            {items.map((it, idx) => {
                const open = openIdx === idx;
                return (
                    <div key={idx} className="rounded-3xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenIdx(open ? null : idx)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-900"
                        >
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                <Icon name="check" className="h-4 w-4" /> {it.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-neutral-400">{open ? "收起" : "展开"}</span>
                        </button>
                        {open ? (
                            <div className="px-4 pb-4">
                                <ul className="space-y-2">
                                    {it.bullets.map((b, i) => (
                                        <li key={i} className="text-sm leading-relaxed text-slate-700 dark:text-neutral-200">
                                            • {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------
// Utils
// -----------------------------

const pad2 = (n: number): string => String(n).padStart(2, "0");

function toISODate(d: Date): string {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function parseISODate(iso: string): Date {
    const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
    return new Date(y, m - 1, d);
}

function addDays(d: Date, days: number): Date {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + days);
    return dt;
}

function formatCNDate(d: Date): string {
    const dt = new Date(d);
    return `${dt.getFullYear()}/${pad2(dt.getMonth() + 1)}/${pad2(dt.getDate())}`;
}

function formatWeekRange(start: Date, end: Date): string {
    return `${formatCNDate(start)} - ${formatCNDate(end)}`;
}

function startOfMonth(d: Date): Date {
    const dt = new Date(d);
    dt.setDate(1);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function endOfMonth(d: Date): Date {
    const dt = new Date(d);
    dt.setMonth(dt.getMonth() + 1);
    dt.setDate(0);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, start: Date, end: Date): boolean {
    const t = new Date(d).getTime();
    return t >= start.getTime() && t <= end.getTime();
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function getWeekTemporalState(week: Week, today: Date): "past" | "current" | "future" {
    const start = parseISODate(week.weekStartISO);
    const end = parseISODate(week.weekEndISO);
    if (today < start) return "future";
    if (today > end) return "past";
    return "current";
}

function getWeekStatusLabel(state: "past" | "current" | "future"): string {
    if (state === "past") return "已结束";
    if (state === "current") return "进行中";
    return "未开始";
}

function safeJsonParse<T>(str: string, fallback: T): T {
    try {
        return JSON.parse(str) as T;
    } catch {
        return fallback;
    }
}

function downloadTextFile({ filename, mime, text }: { filename: string; mime: string; text: string }) {
    if (typeof window === "undefined") return;
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "export.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

async function tryClipboardWrite(text: string): Promise<ClipboardResult> {
    try {
        if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return { ok: true, method: "clipboard" };
        }
    } catch (err) {
        return {
            ok: false,
            method: "clipboard",
            error: err instanceof Error ? `${err.name}: ${err.message}` : "Clipboard write failed",
        };
    }

    // Legacy fallback (may also be blocked)
    try {
        if (typeof document !== "undefined") {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "true");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            ta.style.top = "0";
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) return { ok: true, method: "execCommand" };
            return { ok: false, method: "execCommand", error: "execCommand returned false" };
        }
    } catch (err) {
        return {
            ok: false,
            method: "execCommand",
            error: err instanceof Error ? `${err.name}: ${err.message}` : "execCommand copy failed",
        };
    }

    return { ok: false, method: "none", error: "No clipboard method available" };
}

// -----------------------------
// Plan Data
// -----------------------------

const PLAN_START_ISO = "2026-03-02";
const EXAM_DATE_ISO = "2026-12-21";

const phases: Array<{ id: string; name: string; weeks: [number, number]; color: string; tip: string }> = [
    { id: "A", name: "基础成体系", weeks: [1, 18], color: "bg-slate-900 text-white", tip: "搭骨架：30讲一轮 + 输出习惯（做题/推导/精读）" },
    { id: "B", name: "提高与真题推进", weeks: [19, 26], color: "bg-indigo-600 text-white", tip: "强化：1000题强化 + 真题分模块；专业课二轮 + 套题" },
    { id: "C", name: "套卷与提分", weeks: [27, 38], color: "bg-emerald-600 text-white", tip: "考试模式：数学2套/周、专业课1–2套/周；英语作文定型；政治主观框架" },
    { id: "D", name: "冲刺与稳定", weeks: [39, 43], color: "bg-rose-600 text-white", tip: "稳定优先：错题回归、提速、防失误；政治背诵输出" },
];

function getPhaseForWeek(weekNo: number) {
    for (const p of phases) {
        if (weekNo >= p.weeks[0] && weekNo <= p.weeks[1]) return p;
    }
    return phases[0];
}

const MATH_LECTURE_PLAN: Record<number, string> = {
    1: "张宇30讲：高数 L1–2（2讲）+ 对应基础题",
    2: "张宇30讲：高数 L3–4（2讲）+ 对应基础题",
    3: "张宇30讲：高数 L5–6（2讲）+ 对应基础题",
    4: "张宇30讲：高数 L7–8（2讲）+ 对应基础题（周末做一次小测 60–90min）",
    5: "张宇30讲：高数 L9–10（2讲）+ 对应基础题",
    6: "张宇30讲：高数 L11–12（2讲）+ 对应基础题",
    7: "张宇30讲：高数 L13–14（2讲）+ 对应基础题",
    8: "张宇30讲：高数 L15–16（2讲）+ 对应基础题",
    9: "张宇30讲：线代 L17–18（2讲）+ 对应基础题",
    10: "张宇30讲：线代 L19–20（2讲）+ 对应基础题",
    11: "张宇30讲：线代 L21–22（2讲）+ 对应基础题",
    12: "张宇30讲：线代 L23–24（2讲）+ 对应基础题",
    13: "张宇30讲：概率论 L25–26（2讲）+ 对应基础题",
    14: "张宇30讲：概率论 L27–28（2讲）+ 对应基础题",
    15: "张宇30讲：概率论 L29–30（2讲）+ 对应基础题",
    16: "张宇30讲一轮收尾：高数/线代/概率论回看薄弱讲 + 1000题基础二刷",
    17: "张宇30讲一轮复盘：按专题补弱（极限 / 线代计算 / 概率公式）+ 错题清零",
    18: "张宇30讲一轮验收：做一次阶段自测 + 回归薄弱模块",
};

const weeklyOverrides: Record<number, Partial<WeekPlan>> = {
    1: {
        subjects: {
            math: "张宇30讲：高数 L1–2（2讲）+ 对应基础题；其余时间用于 1000 题基础与消化。",
            english: "红宝书2单元；阅读100（基础）3篇精读；拆分与组合 1–2节",
            signals: "手写笔记第1章 + 一点通对应；960题本章起步",
            politics: "不安排（占位：保持作息与复盘日）",
        },
        outputs: [
            "数学：完成张宇30讲共 2 讲 + 对应 1000 题基础（建议每讲 20–40 题）",
            "英语：精读3篇（逐句+定位+错因）",
            "信号：第1章一页纸总结（定义/性质/易错点）",
        ],
        notes: ["本周只做一件事：把‘每天固定输出’跑起来。"],
    },
    2: {
        subjects: {
            math: "张宇30讲：高数 L3–4（2讲）+ 对应基础题；继续整理前两周错题。",
            english: "红宝书2单元；阅读100（基础）3篇精读；拆分与组合 2节",
            signals: "第1章收尾 + 第2章开头（连续卷积准备）+ 960题本章",
            politics: "不安排",
        },
        outputs: ["卷积题手画≥10题（必须画图，别只套公式）", "英语：拆分与组合做2段短翻译并复盘"],
    },
    3: {
        subjects: {
            math: "张宇30讲：高数 L5–6（2讲）+ 对应基础题；错题本继续滚动。",
            english: "阅读100（基础）3篇精读；完形入门（不计分）",
            signals: "第2章（连续卷积/LTI）推进 + 960题",
            politics: "不安排",
        },
        outputs: ["数学：错题本建立（错因/正解/触发提示三行法）", "信号：卷积专项≥15题（图形法+性质法）"],
    },
    4: {
        subjects: {
            math: "张宇30讲：高数 L7–8（2讲）+ 对应基础题（周末做一次高数小测 60–90min）",
            english: "阅读100（基础）2篇精读 + 1篇限时；红宝书2单元",
            signals: "第2章收尾 + 960题本章；一页纸总结",
            politics: "不安排",
        },
        outputs: ["复盘日：数学错题二刷清一轮"],
    },
};

function defaultWeekPlan(weekNo: number): WeekPlan {
    const phase = getPhaseForWeek(weekNo);

    if (weekNo <= 18) {
        const mathPlan = MATH_LECTURE_PLAN[weekNo] || "张宇30讲推进：每周至少 2 讲 + 对应基础题";
        const mathOutput = weekNo <= 15
            ? "数学：本周完成张宇30讲至少 2 讲，并完成对应基础题训练"
            : "数学：本周以一轮复盘/补弱/阶段自测为主，清理张宇30讲遗留薄弱点";

        return {
            subjects: {
                math: mathPlan,
                english: "阅读训练/真题精读 + 拆分与组合",
                signals: "手写笔记推进 + 960题",
                politics: "不安排或轻占位",
            },
            outputs: [mathOutput, "错题本三行法", "每章一页纸总结"],
            notes: [phase.tip, weekNo <= 15 ? "张宇30讲总量按三科合计 30 讲计算，本阶段按每周至少 2 讲推进。" : "本阶段后半程以一轮收尾和补弱为主，不再机械追加新讲数。"],
        };
    }

    if (weekNo >= 19 && weekNo <= 26) {
        return {
            subjects: {
                math: "1000强化（薄弱优先）+ 真题分模块（每周2次）",
                english: "真题阅读4–5篇/周 + 翻译2次 + 写作1次",
                signals: "一点通二轮（按章）+ 960题 + 套题",
                politics: "7月起：每天30–45min（选择题/框架）",
            },
            outputs: ["数学：真题分模块2次并复盘", "信号：套题1次（计时）"],
            notes: [phase.tip],
        };
    }

    if (weekNo >= 27 && weekNo <= 38) {
        return {
            subjects: {
                math: "考试模式：整卷2套/周（150min×2）+ 每套复盘2小时；错题回归",
                english: "真题二刷/套练：阅读为主；写作每周2篇（至少1篇手写限时）；翻译保持",
                signals: "整卷1–2套/周 + 高频考点背诵输出；错题按题型清零",
                politics: "选择题每天 + 9月后主观题框架背诵与输出",
            },
            outputs: [
                "数学：2套整卷 + 完整复盘（错因分类：知识/方法/计算/时间）",
                "信号：至少1套整卷 + 输出‘步骤卡’",
                "英语：作文至少1篇手写限时（30–40min）",
            ],
            notes: ["这一阶段提分关键=复盘质量，而不是卷子数量。", "每周至少一次‘复盘日’：错题二刷清零。"],
        };
    }

    return {
        subjects: {
            math: "冲刺稳定：每周2套保持手感 + 错题回归 + 计算专项",
            english: "作文背熟+默写+套用；阅读两天一篇保持；翻译轻量",
            signals: "性质/谱对/判据背到熟练输出；每周1套保持",
            politics: "当年节奏（肖八/肖四类）：主观题背诵输出 + 选择题保持",
        },
        outputs: ["把‘最易失误10点’贴墙：每天过一遍", "模拟后只做两件事：纠错 + 防错"],
        notes: ["考前不再大范围换资料；只做：真题/错题/高频。", "睡眠与节律 > 多学一小时。"],
    };
}

function buildWeeks(): Week[] {
    const start = parseISODate(PLAN_START_ISO);
    const weeks: Week[] = [];
    for (let i = 1; i <= 43; i++) {
        const ws = addDays(start, (i - 1) * 7);
        const we = addDays(ws, 6);

        const base = defaultWeekPlan(i);
        const ov = weeklyOverrides[i];

        const merged: WeekPlan = {
            subjects: { ...base.subjects, ...(ov?.subjects || {}) },
            outputs: ov?.outputs ? ov.outputs : base.outputs,
            notes: ov?.notes ? ov.notes : base.notes,
        };

        const ph = getPhaseForWeek(i);
        weeks.push({
            weekNo: i,
            weekStartISO: toISODate(ws),
            weekEndISO: toISODate(we),
            phaseId: ph.id,
            phaseName: ph.name,
            phaseTip: ph.tip,
            plan: merged,
        });
    }
    return weeks;
}

const PRINCIPLES: Array<{ title: string; bullets: string[] }> = [
    {
        title: "总原则（不变）",
        bullets: [
            "数学决定上限，英语决定稳定性，专业课决定区分度，政治决定保底。",
            "顺序：先建立体系（会）→ 再大量输出（对）→ 最后提速抗压（稳）。",
            "每周必须有：套题/整卷、复盘日、错题清零。",
        ],
    },
    {
        title: "数学：每讲三件套",
        bullets: [
            "讲义例题：关键步骤自己写一遍（别只看）。",
            "刷题：对应章节基础→强化（薄弱优先）。",
            "错题三行法：错因 / 正解一句话 / 触发提示（防再错）。",
        ],
    },
    {
        title: "英语：真题精读四件事",
        bullets: [
            "文章结构（转折/因果/态度词）。",
            "每题定位句 + 依据。",
            "错因归类（偷换概念/定位偏/词义误读）。",
            "摘5个表达进写作素材库。",
        ],
    },
    {
        title: "信号与系统：一章一页纸",
        bullets: [
            "定义+性质（带使用条件）。",
            "常用变换对/谱对（记条件）。",
            "高频题型步骤模板（ROC判别/求响应/采样分析）。",
        ],
    },
    {
        title: "复盘日（每周固定）",
        bullets: [
            "数学：本周错题二刷清掉，仍错→写防错条款。",
            "英语：统计错因占比，下一周训练围绕最大类问题。",
            "信号：把卡点写成‘步骤卡’，下周见到同类就套步骤。",
        ],
    },
];

const SUBJECTS: Array<{ key: SubjectKey; label: string; emoji: string }> = [
    { key: "math", label: "数学", emoji: "🧮" },
    { key: "english", label: "英语", emoji: "📘" },
    { key: "signals", label: "信号与系统", emoji: "📡" },
    { key: "politics", label: "政治", emoji: "🗳️" },
];

// -----------------------------
// Local storage hook (typed)
// -----------------------------

function useLocalState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        if (!raw) return initialValue;
        return safeJsonParse<T>(raw, initialValue);
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

// -----------------------------
// Export
// -----------------------------

function weeksToCSV(weeks: Week[]): string {
    const header = ["weekNo", "weekStart", "weekEnd", "phase", "math", "english", "signals", "politics", "outputs", "notes"];
    const lines = [header.join(",")];
    for (const w of weeks) {
        const s = w.plan.subjects;
        const row = [
            w.weekNo,
            w.weekStartISO,
            w.weekEndISO,
            w.phaseName,
            JSON.stringify(s.math || ""),
            JSON.stringify(s.english || ""),
            JSON.stringify(s.signals || ""),
            JSON.stringify(s.politics || ""),
            JSON.stringify(w.plan.outputs || []),
            JSON.stringify(w.plan.notes || []),
        ];
        lines.push(row.join(","));
    }
    return lines.join("\n");
}

// -----------------------------
// Calendar grid
// -----------------------------

function buildMonthGrid(monthDate: Date): { start: Date; end: Date; rows: Date[][] } {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    // Monday-start grid
    const startDay = (start.getDay() + 6) % 7; // 0=Mon
    const gridStart = addDays(start, -startDay);

    const endDay = (end.getDay() + 6) % 7;
    const gridEnd = addDays(end, 6 - endDay);

    const days: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
        days.push(new Date(d));
    }

    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        rows.push(days.slice(i, i + 7));
    }
    return { start, end, rows };
}

function getWeekByDate(weeks: Week[], date: Date): Week | null {
    const iso = toISODate(date);
    return weeks.find((w) => iso >= w.weekStartISO && iso <= w.weekEndISO) || null;
}

function PhaseBadge({ phaseId }: { phaseId: string }) {
    const p = phases.find((x) => x.id === phaseId) || phases[0];
    return <Badge className={cn(p.color, "rounded-full border-transparent")}>{p.name}</Badge>;
}

// -----------------------------
// Minimal invariants (dev tests)
// -----------------------------

function runInvariantsOnce() {
    try {
        const weeks = buildWeeks();
        console.assert(weeks.length === 43, "Expected 43 weeks");
        console.assert(weeks[0].weekStartISO === PLAN_START_ISO, "Week1 start mismatch");
        const expectedEnd = toISODate(addDays(parseISODate(PLAN_START_ISO), 6));
        console.assert(weeks[0].weekEndISO === expectedEnd, "Week1 end mismatch");
        const csvLines = weeksToCSV(weeks).split("\n");
        console.assert(csvLines.length === 44, "CSV line count mismatch (header + 43 weeks)");
    } catch (e) {
        console.warn("Invariants failed:", e);
    }
}

// -----------------------------
// Main Component (FULLSCREEN)
// -----------------------------

const LS_KEY = "grad-plan-v2";

export default function StudyCalendarLab() {
    const weeks = useMemo(() => buildWeeks(), []);
    const planStart = useMemo(() => parseISODate(PLAN_START_ISO), []);
    const today = useMemo(() => new Date(), []);

    const [copyModal, setCopyModal] = useState<CopyModalState>({
        open: false,
        title: "",
        description: "",
        text: "",
        suggestedFilename: "export.txt",
        suggestedMime: "text/plain;charset=utf-8",
    });

    const copyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    async function copyOrShowFallback(args: { text: string; title: string; description: string; filename: string; mime: string }) {
        const res = await tryClipboardWrite(args.text);
        if (res.ok) return;
        setCopyModal({
            open: true,
            title: args.title,
            description: `${args.description}\n\n（提示：当前页面权限策略阻止剪贴板写入：${res.error}）`,
            text: args.text,
            suggestedFilename: args.filename,
            suggestedMime: args.mime,
        });
    }

    useEffect(() => {
        if (typeof window !== "undefined") runInvariantsOnce();
    }, []);

    useEffect(() => {
        if (!copyModal.open) return;
        const t = window.setTimeout(() => {
            const ta = copyTextareaRef.current;
            if (ta) ta.select();
        }, 50);
        return () => window.clearTimeout(t);
    }, [copyModal.open]);

    // Month cursor: default to plan start month
    const [monthCursorISO, setMonthCursorISO] = useState<string>(() => toISODate(startOfMonth(planStart)));
    const monthCursor = useMemo(() => parseISODate(monthCursorISO), [monthCursorISO]);

    const [selectedWeekNo, setSelectedWeekNo] = useState<number>(() => {
        const cur = getWeekByDate(weeks, today);
        return cur?.weekNo || 1;
    });

    const selectedWeek = useMemo<Week>(() => weeks.find((w) => w.weekNo === selectedWeekNo) || weeks[0], [weeks, selectedWeekNo]);
    const selectedWeekStart = useMemo<Date>(() => parseISODate(selectedWeek.weekStartISO), [selectedWeek.weekStartISO]);
    const selectedWeekEnd = useMemo<Date>(() => parseISODate(selectedWeek.weekEndISO), [selectedWeek.weekEndISO]);
    const phase = useMemo(() => getPhaseForWeek(selectedWeekNo), [selectedWeekNo]);

    const [filters, setFilters] = useState<Record<SubjectKey, boolean>>({
        math: true,
        english: true,
        signals: true,
        politics: true,
    });

    const [search, setSearch] = useState<string>("");

    const [prefs, setPrefs] = useLocalState<Prefs>(`${LS_KEY}:prefs`, {
        reviewDayIndex: 6,
        showDailyTemplate: true,
    });

    const [done, setDone] = useLocalState<DoneState>(`${LS_KEY}:done`, {});
    const [customTasks, setCustomTasks] = useLocalState<CustomTasksState>(`${LS_KEY}:customTasks`, {});
    const [customTaskDraft, setCustomTaskDraft] = useState<string>("");

    const monthGrid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
    const examDate = useMemo(() => parseISODate(EXAM_DATE_ISO), []);
    const daysToExam = useMemo(() => Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))), [examDate, today]);
    const currentWeekByToday = useMemo(() => getWeekByDate(weeks, today), [weeks, today]);

    const weekProgress = useMemo(() => {
        const cur = done[selectedWeekNo] || {};
        const outputs = selectedWeek.plan.outputs;
        const outputsDone = (cur.outputsDone || new Array(outputs.length).fill(false)).slice(0, outputs.length);

        const customs = customTasks[selectedWeekNo] || [];
        const customDone = (cur.customDone || new Array(customs.length).fill(false)).slice(0, customs.length);

        const total = outputs.length + customs.length;
        const ok = outputsDone.filter(Boolean).length + customDone.filter(Boolean).length;
        const pct = total === 0 ? 0 : Math.round((ok / total) * 100);

        return { outputsDone, customDone, total, ok, pct };
    }, [done, customTasks, selectedWeekNo, selectedWeek.plan.outputs]);

    const mathLectureProgress = useMemo(() => {
        const completedWeeks = Math.min(selectedWeekNo, 15);
        const completedLectures = completedWeeks * 2;
        const pct = Math.round((completedLectures / 30) * 100);
        return { completedWeeks, completedLectures, totalLectures: 30, pct };
    }, [selectedWeekNo]);

    const filteredSubjects = useMemo(() => {
        const list = SUBJECTS.filter((x) => filters[x.key]).map((x) => ({
            ...x,
            value: selectedWeek.plan.subjects[x.key] || "",
        }));

        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((x) => x.value.toLowerCase().includes(q) || x.label.toLowerCase().includes(q));
    }, [selectedWeek.plan.subjects, filters, search]);

    function jumpToWeek(weekNo: number) {
        const target = clamp(weekNo, 1, weeks.length);
        setSelectedWeekNo(target);
        const w = weeks.find((x) => x.weekNo === target);
        if (w) setMonthCursorISO(toISODate(startOfMonth(parseISODate(w.weekStartISO))));
    }

    function moveMonth(delta: number) {
        const d = new Date(monthCursor);
        d.setMonth(d.getMonth() + delta);
        setMonthCursorISO(toISODate(startOfMonth(d)));
    }

    function toggleOutputDone(idx: number, val: boolean) {
        setDone((prev) => {
            const cur = prev[selectedWeekNo] || {};
            const outputs = selectedWeek.plan.outputs;
            const arr = (cur.outputsDone || new Array(outputs.length).fill(false)).slice(0, outputs.length);
            arr[idx] = val;
            return { ...prev, [selectedWeekNo]: { ...cur, outputsDone: arr } };
        });
    }

    function toggleCustomDone(idx: number, val: boolean) {
        setDone((prev) => {
            const cur = prev[selectedWeekNo] || {};
            const customs = customTasks[selectedWeekNo] || [];
            const arr = (cur.customDone || new Array(customs.length).fill(false)).slice(0, customs.length);
            arr[idx] = val;
            return { ...prev, [selectedWeekNo]: { ...cur, customDone: arr } };
        });
    }

    function addCustomTask() {
        const t = customTaskDraft.trim();
        if (!t) return;
        setCustomTasks((prev) => {
            const arr = (prev[selectedWeekNo] || []).slice();
            arr.push(t);
            return { ...prev, [selectedWeekNo]: arr };
        });
        setCustomTaskDraft("");
    }

    function removeCustomTask(idx: number) {
        setCustomTasks((prev) => {
            const arr = (prev[selectedWeekNo] || []).slice();
            arr.splice(idx, 1);
            return { ...prev, [selectedWeekNo]: arr };
        });

        setDone((prev) => {
            const cur = prev[selectedWeekNo] || {};
            const arr = (cur.customDone || []).slice();
            arr.splice(idx, 1);
            return { ...prev, [selectedWeekNo]: { ...cur, customDone: arr } };
        });
    }

    async function exportJSON() {
        const payload = {
            meta: {
                planStart: PLAN_START_ISO,
                examDate: EXAM_DATE_ISO,
                generatedAt: toISODate(new Date()),
            },
            weeks,
            principles: PRINCIPLES,
            progress: done,
            customTasks,
            prefs,
        };

        const text = JSON.stringify(payload, null, 2);
        await copyOrShowFallback({
            text,
            title: "导出 JSON",
            description: "若无法自动复制，可在弹窗手动复制，或直接下载文件。",
            filename: "study-plan.json",
            mime: "application/json;charset=utf-8",
        });
    }

    async function exportCSV() {
        const csv = weeksToCSV(weeks);
        await copyOrShowFallback({
            text: csv,
            title: "导出 CSV",
            description: "若无法自动复制，可在弹窗手动复制，或直接下载文件。",
            filename: "study-plan.csv",
            mime: "text/csv;charset=utf-8",
        });
    }

    const dailyTemplate = useMemo(() => {
        const days: Array<{
            i: number;
            date: Date;
            isReview: boolean;
            blocks: Array<{ title: string; items: string[] }>;
        }> = [];

        for (let i = 0; i < 7; i++) {
            const date = addDays(selectedWeekStart, i);
            const isReview = i === prefs.reviewDayIndex;
            days.push({
                i,
                date,
                isReview,
                blocks: isReview
                    ? [
                        {
                            title: "复盘日（清算）",
                            items: [
                                "数学：本周错题二刷清零（仍错→写防错条款）",
                                "英语：错因统计（最大类问题→下周训练重点）",
                                "信号：卡点写成步骤卡；同类题再做5题巩固",
                                "整理下周：最重要三件事",
                            ],
                        },
                    ]
                    : [
                        {
                            title: "上午（数学主场 2.5–3.5h）",
                            items: [
                                "新课/例题 60–90min（关键步骤自己写）",
                                "刷题 90min（限时）",
                                "错题整理 20min（三行法）",
                            ],
                        },
                        {
                            title: "下午（专业课 2–3h）",
                            items: [
                                "推导/性质 60min（写一遍）",
                                "习题/套题 90min（限时）",
                                "一页纸总结 20min",
                            ],
                        },
                        {
                            title: "晚上（英语+政治 1.5–2.5h）",
                            items: [
                                "阅读精读/复盘 60–80min（结构+定位+错因）",
                                "翻译/写作 30–40min（输出）",
                                "单词 20min（滚动）",
                                "政治 0–40min（7月后稳定）",
                            ],
                        },
                    ],
            });
        }

        return days;
    }, [selectedWeekStart, prefs.reviewDayIndex]);

    const weekListRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const root = weekListRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLElement>(`[data-week="${selectedWeekNo}"]`);
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [selectedWeekNo]);

    const [tab, setTab] = useState<string>("plan");

    return (
        <div className="w-full h-full">
            {/* Clipboard fallback modal */}
            <Modal
                open={copyModal.open}
                onClose={() => setCopyModal((m) => ({ ...m, open: false }))}
                title={copyModal.title || "复制"}
                description={copyModal.description}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const ta = copyTextareaRef.current;
                                if (ta) ta.select();
                            }}
                        >
                            全选
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                downloadTextFile({
                                    filename: copyModal.suggestedFilename || "export.txt",
                                    mime: copyModal.suggestedMime || "text/plain;charset=utf-8",
                                    text: copyModal.text,
                                })
                            }
                        >
                            <Icon name="download" className="h-4 w-4" /> 下载
                        </Button>
                        <Button onClick={() => setCopyModal((m) => ({ ...m, open: false }))}>关闭</Button>
                    </>
                }
            >
                <div className="space-y-2">
                    <div className="text-xs text-slate-600 dark:text-neutral-300">
                        提示：按 Ctrl/Cmd + A 全选，再 Ctrl/Cmd + C 复制。
                    </div>
                    <textarea
                        ref={copyTextareaRef}
                        value={copyModal.text}
                        readOnly
                        className="w-full min-h-[240px] rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                    />
                </div>
            </Modal>

            {/* Fullscreen stage wrapper */}
            <div className="h-full w-full overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_30%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#0a0a0a_0%,#111827_35%,#020617_100%)]">
                <div className="h-full w-full overflow-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {/* Header */}
                        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 md:p-7">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(14,165,233,0.10),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_left,rgba(14,165,233,0.14),transparent_24%)]" />
                            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-white dark:text-neutral-900">
                                            <Icon name="calendar" className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                                                26考研周计划 · 日历视图
                                            </div>
                                            <div className="mt-1 text-sm text-slate-600 dark:text-neutral-300">
                                                {PLAN_START_ISO} 起算 · {EXAM_DATE_ISO} 考试 · 共 43 周
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="border-slate-200 bg-slate-100 text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                                            第一周：2026/03/02 - 2026/03/08
                                        </Badge>
                                        <Badge className="border-slate-200 bg-slate-100 text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                                            当前查看：W{selectedWeekNo}
                                        </Badge>
                                        <Badge className="border-slate-200 bg-slate-100 text-slate-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                                            距考试约 {daysToExam} 天
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex w-full justify-end xl:w-auto">
                                    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
                                        <div className="text-xs text-slate-500 dark:text-neutral-400">当前周</div>
                                        <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                                            {currentWeekByToday ? `W${currentWeekByToday.weekNo}` : "计划外"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-5 flex flex-wrap items-center gap-2">
                                <Button variant="outline" onClick={() => jumpToWeek(selectedWeekNo - 1)}>
                                    上一周
                                </Button>
                                <Button variant="outline" onClick={() => jumpToWeek(selectedWeekNo + 1)}>
                                    下一周
                                </Button>
                                <Button
                                    onClick={() => {
                                        const w = getWeekByDate(weeks, today);
                                        if (w) jumpToWeek(w.weekNo);
                                    }}
                                >
                                    回到本周
                                </Button>
                            </div>
                        </div>

                        {/* Main layout */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Left */}
                            <div className="lg:col-span-5 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-base font-semibold text-slate-900 dark:text-white">日历（月视图）</div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => moveMonth(-1)}>
                                                    上月
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => moveMonth(1)}>
                                                    下月
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-neutral-300">
                                            {monthCursor.getFullYear()} 年 {monthCursor.getMonth() + 1} 月
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-7 text-xs text-slate-500 dark:text-neutral-400">
                                            {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                                                <div key={d} className="px-2 py-1">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-neutral-300">
                                            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white" /> 当前选中周</span>
                                            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> 复盘日</span>
                                            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> 今天</span>
                                        </div>

                                        <div className="space-y-1">
                                            {monthGrid.rows.map((row, rIdx) => (
                                                <div key={rIdx} className="grid grid-cols-7 gap-1">
                                                    {row.map((d) => {
                                                        const inThisMonth = d.getMonth() === monthCursor.getMonth();
                                                        const w = getWeekByDate(weeks, d);
                                                        const isInPlan = w != null;
                                                        const isSelectedWeek = isInPlan && inRange(d, selectedWeekStart, selectedWeekEnd);
                                                        const isToday = isSameDay(d, today);
                                                        const isReviewDay = isInPlan && ((d.getDay() + 6) % 7) === prefs.reviewDayIndex;

                                                        return (
                                                            <button
                                                                key={toISODate(d)}
                                                                disabled={!isInPlan}
                                                                onClick={() => (w ? jumpToWeek(w.weekNo) : undefined)}
                                                                className={cn(
                                                                    "relative rounded-2xl border px-2 py-2 text-left transition",
                                                                    isSelectedWeek
                                                                        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                                                                        : "border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-slate-50 dark:hover:bg-neutral-900",
                                                                    !inThisMonth && "opacity-60",
                                                                    !isInPlan && "opacity-40 cursor-not-allowed"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="text-xs font-medium">{d.getDate()}</div>
                                                                    {w ? (
                                                                        <div
                                                                            className={cn(
                                                                                "text-[10px] rounded-full px-2 py-0.5 border",
                                                                                isSelectedWeek
                                                                                    ? "border-white/30 dark:border-neutral-900/30"
                                                                                    : "border-slate-200 dark:border-neutral-800"
                                                                            )}
                                                                        >
                                                                            W{w.weekNo}
                                                                        </div>
                                                                    ) : null}
                                                                </div>

                                                                <div className="mt-2 flex items-center gap-1.5">
                                                                    {isReviewDay ? <span className={cn("h-2 w-2 rounded-full", isSelectedWeek ? "bg-sky-300 dark:bg-sky-500" : "bg-sky-500")} title="复盘日" /> : null}
                                                                    {w ? <span className={cn("h-2 w-2 rounded-full", getWeekTemporalState(w, today) === "past" ? "bg-slate-300 dark:bg-neutral-600" : getWeekTemporalState(w, today) === "current" ? "bg-emerald-500" : "bg-amber-400")} title={getWeekStatusLabel(getWeekTemporalState(w, today))} /> : null}
                                                                </div>

                                                                {isToday ? (
                                                                    <div
                                                                        className={cn(
                                                                            "absolute -top-1 -right-1 h-3 w-3 rounded-full",
                                                                            isSelectedWeek
                                                                                ? "bg-white dark:bg-neutral-900"
                                                                                : "bg-slate-900 dark:bg-white"
                                                                        )}
                                                                        title="今天"
                                                                    />
                                                                ) : null}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="text-base font-semibold text-slate-900 dark:text-white">周列表</div>
                                        <div className="text-sm text-slate-600 dark:text-neutral-300">点击周卡片查看详情</div>
                                    </CardHeader>
                                    <CardContent>
                                        <div ref={weekListRef} className="max-h-[420px] overflow-auto pr-2 space-y-2">
                                            {weeks.map((w) => {
                                                const isActive = w.weekNo === selectedWeekNo;
                                                const p = getPhaseForWeek(w.weekNo);
                                                const state = getWeekTemporalState(w, today);
                                                return (
                                                    <button
                                                        key={w.weekNo}
                                                        data-week={w.weekNo}
                                                        type="button"
                                                        onClick={() => jumpToWeek(w.weekNo)}
                                                        className={cn(
                                                            "w-full text-left rounded-3xl border p-3 transition",
                                                            isActive
                                                                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                                                                : "border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-slate-50 dark:hover:bg-neutral-900"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <div className="text-sm font-semibold">W{w.weekNo} · {w.phaseName}</div>
                                                                <div className={cn("text-xs", isActive ? "text-white/80 dark:text-neutral-700" : "text-slate-600 dark:text-neutral-300")}>
                                                                    {w.weekStartISO} → {w.weekEndISO}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={cn(isActive ? "bg-white/10 dark:bg-neutral-900/10 text-white dark:text-neutral-900" : p.color, "border-transparent")}>
                                                                    阶段 {p.id}
                                                                </Badge>
                                                                <span className={cn(
                                                                    "rounded-full px-2 py-1 text-[10px] font-medium border",
                                                                    isActive
                                                                        ? "border-white/20 text-white/80 dark:border-neutral-700 dark:text-neutral-700"
                                                                        : state === "past"
                                                                            ? "border-slate-200 text-slate-500 dark:border-neutral-800 dark:text-neutral-400"
                                                                            : state === "current"
                                                                                ? "border-emerald-200 text-emerald-700 dark:border-emerald-900/70 dark:text-emerald-300"
                                                                                : "border-amber-200 text-amber-700 dark:border-amber-900/70 dark:text-amber-300"
                                                                )}>
                                                                    {getWeekStatusLabel(state)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="sticky top-0 z-20 -mx-1 rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge className="border-transparent bg-slate-900 text-white dark:bg-white dark:text-neutral-900">W{selectedWeekNo}</Badge>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{formatWeekRange(selectedWeekStart, selectedWeekEnd)}</span>
                                            <span className="text-sm text-slate-500 dark:text-neutral-400">· {phase.name}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-neutral-300">
                                            <span>本周完成 {weekProgress.ok}/{weekProgress.total}</span>
                                            <span>张宇 30 讲已规划 {Math.min(mathLectureProgress.completedLectures, 30)}/30</span>
                                        </div>
                                    </div>
                                </div>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                                                        W{selectedWeekNo} · {formatWeekRange(selectedWeekStart, selectedWeekEnd)}
                                                    </div>
                                                    <PhaseBadge phaseId={phase.id} />
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-neutral-300 inline-flex items-center gap-2">
                                                    <Icon name="info" className="h-4 w-4" /> {phase.tip}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button variant="outline" onClick={exportCSV}>
                                                    <Icon name="copy" className="h-4 w-4" /> 复制/导出 CSV
                                                </Button>
                                                <Button variant="outline" onClick={exportJSON}>
                                                    <Icon name="copy" className="h-4 w-4" /> 复制/导出 JSON
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300">
                                                    <Icon name="filter" className="h-4 w-4" /> 学科筛选
                                                </div>
                                                {SUBJECTS.map((s) => (
                                                    <Pill
                                                        key={s.key}
                                                        active={filters[s.key]}
                                                        onClick={() => setFilters((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                                                    >
                                                        {s.emoji} {s.label}
                                                    </Pill>
                                                ))}
                                            </div>

                                            <div className="relative w-full md:w-72">
                                                <Icon name="search" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-neutral-400" />
                                                <Input
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    placeholder="搜索本周内容（关键词）"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                            <div className="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-gradient-to-br from-white to-slate-50 p-4 dark:from-neutral-950 dark:to-neutral-900">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">本周进度</div>
                                                        <div className="text-xs text-slate-600 dark:text-neutral-300">完成 {weekProgress.ok}/{weekProgress.total} · {weekProgress.pct}%</div>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2">
                                                        <Icon name="spark" className="h-4 w-4 text-slate-700 dark:text-neutral-200" />
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">目标：复盘质量＞数量</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-gradient-to-br from-white to-indigo-50/60 p-4 dark:from-neutral-950 dark:to-indigo-950/20">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">张宇 30 讲进度</div>
                                                        <div className="text-xs text-slate-600 dark:text-neutral-300">
                                                            已规划 {Math.min(mathLectureProgress.completedLectures, 30)}/30 讲 · 前 15 周每周 2 讲
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{Math.min(mathLectureProgress.pct, 100)}%</div>
                                                </div>
                                                <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                                                    <div className="h-full rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(mathLectureProgress.pct, 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <Tabs
                                            tabs={[
                                                { key: "plan", label: "本周安排" },
                                                { key: "outputs", label: "交付清单" },
                                                { key: "daily", label: "日历/日程" },
                                                { key: "notes", label: "提醒&分析" },
                                            ]}
                                            active={tab}
                                            onChange={setTab}
                                        />

                                        {tab === "plan" ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <Card className="shadow-none">
                                                    <CardHeader className="pb-2">
                                                        <div className="text-base font-semibold text-slate-900 dark:text-white">学科安排（可复制）</div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {filteredSubjects.length === 0 ? (
                                                            <div className="text-sm text-slate-600 dark:text-neutral-300">没有匹配到内容，换个关键词试试。</div>
                                                        ) : (
                                                            filteredSubjects.map((s) => (
                                                                <div key={s.key} className="rounded-3xl border border-slate-200 dark:border-neutral-800 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm dark:from-neutral-950 dark:to-neutral-900">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="space-y-1">
                                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                                {s.emoji} {s.label}
                                                                            </div>
                                                                            <div className="text-sm leading-relaxed text-slate-700 dark:text-neutral-200">{s.value || "—"}</div>
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                copyOrShowFallback({
                                                                                    text: s.value || "",
                                                                                    title: `复制：${s.label}`,
                                                                                    description: "若无法自动复制，会弹出手动复制/下载。",
                                                                                    filename: `W${selectedWeekNo}-${s.label}.txt`,
                                                                                    mime: "text/plain;charset=utf-8",
                                                                                })
                                                                            }
                                                                        >
                                                                            <Icon name="copy" className="h-4 w-4" /> 复制
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="shadow-none">
                                                    <CardHeader className="pb-2">
                                                        <div className="text-base font-semibold text-slate-900 dark:text-white">自定义任务（可插入学校/实验室）</div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                                            <Input
                                                                value={customTaskDraft}
                                                                onChange={(e) => setCustomTaskDraft(e.target.value)}
                                                                placeholder="例如：数一整卷（150min）/ 信号套题复盘"
                                                            />
                                                            <Button onClick={addCustomTask}>添加</Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {(customTasks[selectedWeekNo] || []).length === 0 ? (
                                                                <div className="text-sm text-slate-600 dark:text-neutral-300">暂无自定义任务。</div>
                                                            ) : (
                                                                (customTasks[selectedWeekNo] || []).map((t, idx) => (
                                                                    <div key={idx} className="rounded-3xl border border-slate-200 dark:border-neutral-800 p-3 flex items-center justify-between gap-3">
                                                                        <div className="text-sm text-slate-900 dark:text-white">{t}</div>
                                                                        <Button size="sm" variant="outline" onClick={() => removeCustomTask(idx)}>
                                                                            删除
                                                                        </Button>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ) : null}

                                        {tab === "outputs" ? (
                                            <Card className="shadow-none">
                                                <CardHeader className="pb-2">
                                                    <div className="text-base font-semibold text-slate-900 dark:text-white">本周交付（勾掉才算完成）</div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">计划内交付</div>
                                                        {selectedWeek.plan.outputs.length === 0 ? (
                                                            <div className="text-sm text-slate-600 dark:text-neutral-300">本周无固定交付。</div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {selectedWeek.plan.outputs.map((o, idx) => (
                                                                    <label key={idx} className="flex items-start gap-3 rounded-3xl border border-slate-200 dark:border-neutral-800 p-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mt-1"
                                                                            checked={!!weekProgress.outputsDone[idx]}
                                                                            onChange={(e) => toggleOutputDone(idx, e.target.checked)}
                                                                        />
                                                                        <div className="text-sm leading-relaxed text-slate-900 dark:text-white">{o}</div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Separator />

                                                    <div className="space-y-2">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">自定义交付</div>
                                                        {(customTasks[selectedWeekNo] || []).length === 0 ? (
                                                            <div className="text-sm text-slate-600 dark:text-neutral-300">你可以在“本周安排”里添加自定义任务。</div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {(customTasks[selectedWeekNo] || []).map((o, idx) => (
                                                                    <label key={idx} className="flex items-start gap-3 rounded-3xl border border-slate-200 dark:border-neutral-800 p-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mt-1"
                                                                            checked={!!weekProgress.customDone[idx]}
                                                                            onChange={(e) => toggleCustomDone(idx, e.target.checked)}
                                                                        />
                                                                        <div className="text-sm leading-relaxed text-slate-900 dark:text-white">{o}</div>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : null}

                                        {tab === "daily" ? (
                                            <Card className="shadow-none">
                                                <CardHeader className="pb-2">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div className="text-base font-semibold text-slate-900 dark:text-white">日历/日程（本周7天）</div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-200">
                                                            <span className="text-slate-600 dark:text-neutral-300">显示每日模板</span>
                                                            <Switch checked={prefs.showDailyTemplate} onChange={(v) => setPrefs((p) => ({ ...p, showDailyTemplate: v }))} />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="rounded-3xl border border-slate-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-white">复盘日设置</div>
                                                                <div className="text-xs text-slate-600 dark:text-neutral-300">默认每周最后一天是复盘日</div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[[0, "周一"], [1, "周二"], [2, "周三"], [3, "周四"], [4, "周五"], [5, "周六"], [6, "周日"]].map(([i, label]) => (
                                                                    <Pill key={i as number} active={prefs.reviewDayIndex === i} onClick={() => setPrefs((p) => ({ ...p, reviewDayIndex: i as number }))}>
                                                                        {label as string}
                                                                    </Pill>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        {dailyTemplate.map((d) => (
                                                            <div
                                                                key={toISODate(d.date)}
                                                                className={cn(
                                                                    "rounded-3xl border p-4",
                                                                    d.isReview
                                                                        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                                                                        : "border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <div className="text-sm font-semibold">{formatCNDate(d.date)} {d.isReview ? "· 复盘日" : ""}</div>
                                                                        <div className={cn("text-xs", d.isReview ? "text-white/80 dark:text-neutral-700" : "text-slate-600 dark:text-neutral-300")}>
                                                                            本周重点：{selectedWeek.plan.subjects.math || "—"}
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={d.isReview ? "secondary" : "outline"}
                                                                        onClick={() => {
                                                                            const txt = [
                                                                                `日期：${formatCNDate(d.date)}`,
                                                                                `周：W${selectedWeekNo}`,
                                                                                d.isReview ? "类型：复盘日" : "类型：学习日",
                                                                                "\n【本周学科安排】",
                                                                                `数学：${selectedWeek.plan.subjects.math}`,
                                                                                `英语：${selectedWeek.plan.subjects.english}`,
                                                                                `信号：${selectedWeek.plan.subjects.signals}`,
                                                                                `政治：${selectedWeek.plan.subjects.politics}`,
                                                                                "\n【今日模板】",
                                                                                ...d.blocks.flatMap((b) => [`- ${b.title}`, ...b.items.map((x) => `  • ${x}`)]),
                                                                            ].join("\n");

                                                                            void copyOrShowFallback({
                                                                                text: txt,
                                                                                title: "复制当天",
                                                                                description: "若无法自动复制，会弹出手动复制/下载。",
                                                                                filename: `W${selectedWeekNo}-${toISODate(d.date)}.txt`,
                                                                                mime: "text/plain;charset=utf-8",
                                                                            });
                                                                        }}
                                                                    >
                                                                        <Icon name="copy" className="h-4 w-4" /> 复制当天
                                                                    </Button>
                                                                </div>

                                                                {prefs.showDailyTemplate ? (
                                                                    <div className="mt-3 space-y-3">
                                                                        {d.blocks.map((b, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                className={cn(
                                                                                    "rounded-3xl border p-3",
                                                                                    d.isReview
                                                                                        ? "border-white/20 bg-white/5 dark:border-neutral-900/20 dark:bg-neutral-900/5"
                                                                                        : "border-slate-200 dark:border-neutral-800"
                                                                                )}
                                                                            >
                                                                                <div className="text-sm font-semibold">{b.title}</div>
                                                                                <ul className="mt-2 space-y-1">
                                                                                    {b.items.map((it, j) => (
                                                                                        <li key={j} className={cn("text-sm leading-relaxed", d.isReview ? "text-white/90 dark:text-neutral-900" : "text-slate-700 dark:text-neutral-200")}>
                                                                                            • {it}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : null}

                                        {tab === "notes" ? (
                                            <div className="space-y-4">
                                                <Card className="shadow-none">
                                                    <CardHeader className="pb-2">
                                                        <div className="text-base font-semibold text-slate-900 dark:text-white">本周提醒</div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        {selectedWeek.plan.notes.length === 0 ? (
                                                            <div className="text-sm text-slate-600 dark:text-neutral-300">本周暂无额外提醒。</div>
                                                        ) : (
                                                            <ul className="space-y-2">
                                                                {selectedWeek.plan.notes.map((n, idx) => (
                                                                    <li key={idx} className="rounded-3xl border border-slate-200 dark:border-neutral-800 p-3 text-sm leading-relaxed text-slate-900 dark:text-white">
                                                                        {n}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="shadow-none">
                                                    <CardHeader className="pb-2">
                                                        <div className="text-base font-semibold text-slate-900 dark:text-white">总提醒&方法论</div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Accordion items={PRINCIPLES} />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div className="text-sm text-slate-600 dark:text-neutral-300">
                                                <span className="font-medium text-slate-900 dark:text-white">录入建议：</span>
                                                优先导出 CSV（周粒度）。如果剪贴板被禁用，会弹窗提供手动复制/下载。
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-neutral-400">
                                                想把 W27–W43 细化到“真题年份/套卷编号”，你告诉我你用的真题书版本即可。
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="text-base font-semibold text-slate-900 dark:text-white">阶段时间轴（快速定位）</div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                    {phases.map((p) => (
                                        <div key={p.id} className="rounded-3xl border border-slate-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950">
                                            <div className="flex items-center justify-between">
                                                <Badge className={cn(p.color, "border-transparent")}>阶段 {p.id}</Badge>
                                                <div className="text-xs text-slate-600 dark:text-neutral-300">W{p.weeks[0]}–W{p.weeks[1]}</div>
                                            </div>
                                            <div className="mt-2 font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                            <div className="mt-1 text-sm text-slate-700 dark:text-neutral-200 leading-relaxed">{p.tip}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-neutral-400">考试日期：{EXAM_DATE_ISO}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Named exports (optional for tests)
export { buildWeeks, weeksToCSV, tryClipboardWrite, downloadTextFile, toISODate, parseISODate, addDays };
