"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { labs } from "../../labs/_registry";
import {
    ArrowRight,
    Atom,
    Box,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FlaskConical,
    Gamepad2,
    Search,
    Sparkles,
    Wand2,
    Wrench,
    X,
    Route,
    Sigma,
    Coins,
    Palette,
    Layers,
    Activity,
    Cpu,
    Zap,
    Beaker,
    Shapes,
    MessageCircle,
    Image as ImageIcon,
} from "lucide-react";

type PresetKey = "game" | "sim" | "viz" | "tool";
type CategoryKey = "all" | `preset:${PresetKey}` | `tag:${string}`;

function norm(s: string) {
    return String(s ?? "").trim().toLowerCase();
}

/** 预设分类匹配池（中英都含） */
const PRESET_POOLS: Record<PresetKey, string[]> = {
    game: ["game", "小游戏", "游戏", "play", "fun", "toy", "casual", "interactive-game", "puzzle", "解谜", "闯关"],
    sim: [
        "simulation",
        "sim",
        "仿真",
        "模拟",
        "experiment",
        "实验",
        "system",
        "系统",
        "model",
        "模型",
        "state-machine",
        "状态机",
        "process",
        "流程",
        "generator",
        "生成",
    ],
    viz: [
        "visualization",
        "viz",
        "可视化",
        "interactive",
        "交互",
        "algorithm",
        "算法",
        "math",
        "数学",
        "dsp",
        "信号",
        "signal",
        "graph",
        "图",
        "pathfinding",
        "寻路",
        "fourier",
        "傅里叶",
        "principle",
        "原理",
    ],
    tool: [
        "tool",
        "tools",
        "utility",
        "utils",
        "generator",
        "converter",
        "formatter",
        "editor",
        "helper",
        "assistant",
        "小工具",
        "工具",
        "生成器",
        "转换器",
        "格式化",
        "编辑器",
        "助手",
        "编码",
        "decode",
        "encode",
    ],
};

function matchesPreset(labTags: string[], preset: PresetKey) {
    const tags = (labTags ?? []).map(norm);
    const pool = (PRESET_POOLS[preset] ?? []).map(norm);
    return pool.some((k) => tags.includes(k));
}

function getPresetLabel(preset: PresetKey) {
    if (preset === "game") return "小游戏";
    if (preset === "sim") return "实验仿真";
    if (preset === "viz") return "原理可视化";
    if (preset === "tool") return "小工具";
    return "分类";
}

/**
 * 主分类：稳定且唯一（用于颜色、徽章、hover 色系）
 * 优先级：tool > game > sim > viz
 */
function getPrimaryPreset(tags: string[]): PresetKey {
    if (matchesPreset(tags, "tool")) return "tool";
    if (matchesPreset(tags, "game")) return "game";
    if (matchesPreset(tags, "sim")) return "sim";
    if (matchesPreset(tags, "viz")) return "viz";
    return "viz"; // 如果一个都没命中，默认归到可视化（更贴合 Labs 气质）
}

/**
 * 4 套“苹果风”色系：渐变仅由主分类决定（满足你的要求 #1）
 * - previewGradient：预览区背景
 * - glowA/glowB：两个光斑
 * - hoverText/hoverShadow：hover 反馈
 * - badge：徽章样式
 */
const PRESET_STYLE: Record<
    PresetKey,
    {
        previewGradient: string;
        glowA: string;
        glowB: string;
        hoverShadow: string;
        hoverText: string;
        badgeGradient: string;
        badgeBorder: string;
        badgeText: string;
        presetIcon: React.ReactNode;
    }
> = {
    game: {
        previewGradient: "from-rose-500/10 to-orange-500/10",
        glowA: "bg-rose-500/25 group-hover:bg-rose-500/35",
        glowB: "bg-orange-500/20 group-hover:bg-orange-500/30",
        hoverShadow: "hover:shadow-rose-500/10",
        hoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
        badgeGradient: "from-rose-500/20 to-orange-500/20",
        badgeBorder: "border-rose-500/20",
        badgeText: "text-rose-700 dark:text-rose-300",
        presetIcon: <Gamepad2 className="h-3.5 w-3.5" />,
    },
    sim: {
        previewGradient: "from-emerald-500/10 to-teal-500/10",
        glowA: "bg-emerald-500/25 group-hover:bg-emerald-500/35",
        glowB: "bg-teal-500/20 group-hover:bg-teal-500/30",
        hoverShadow: "hover:shadow-emerald-500/10",
        hoverText: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
        badgeGradient: "from-emerald-500/20 to-teal-500/20",
        badgeBorder: "border-emerald-500/20",
        badgeText: "text-emerald-700 dark:text-emerald-300",
        presetIcon: <Atom className="h-3.5 w-3.5" />,
    },
    viz: {
        previewGradient: "from-sky-500/10 to-indigo-500/10",
        glowA: "bg-sky-500/25 group-hover:bg-sky-500/35",
        glowB: "bg-indigo-500/20 group-hover:bg-indigo-500/30",
        hoverShadow: "hover:shadow-sky-500/10",
        hoverText: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
        badgeGradient: "from-sky-500/20 to-indigo-500/20",
        badgeBorder: "border-sky-500/20",
        badgeText: "text-sky-700 dark:text-sky-300",
        presetIcon: <Wand2 className="h-3.5 w-3.5" />,
    },
    tool: {
        previewGradient: "from-amber-500/10 to-yellow-500/10",
        glowA: "bg-amber-500/25 group-hover:bg-amber-500/35",
        glowB: "bg-yellow-500/20 group-hover:bg-yellow-500/30",
        hoverShadow: "hover:shadow-amber-500/10",
        hoverText: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
        badgeGradient: "from-amber-500/20 to-yellow-500/20",
        badgeBorder: "border-amber-500/20",
        badgeText: "text-amber-700 dark:text-amber-300",
        presetIcon: <Wrench className="h-3.5 w-3.5" />,
    },
};

/**
 * 预览区主题 icon：只决定“icon”，不决定颜色（颜色交给主分类）
 * - 支持中英关键词
 * - 匹配第一个命中
 * - 如果没有命中 => 兜底用主分类 icon（满足要求 #2）
 */
type IconTheme = { key: string; icon: React.ReactNode };

function pickPreviewIcon(tags: string[], primary: PresetKey): IconTheme {
    const t = (tags ?? []).map(norm);

    const rules: Array<{
        key: string;
        keywords: string[];
        icon: React.ReactNode;
    }> = [
            {
                key: "dsp",
                keywords: ["dsp", "signal", "信号", "音频", "audio", "fourier", "傅里叶", "滤波", "filter", "频谱", "spectrum"],
                icon: <Activity className="h-8 w-8" />,
            },
            {
                key: "algorithm",
                keywords: ["algorithm", "算法", "pathfinding", "寻路", "graph", "图", "a*", "astar", "bfs", "dfs"],
                icon: <Route className="h-8 w-8" />,
            },
            {
                key: "math",
                keywords: ["math", "数学", "z-transform", "z变换", "积分", "微分", "matrix", "矩阵", "概率", "statistics", "统计"],
                icon: <Sigma className="h-8 w-8" />,
            },
            {
                key: "finance",
                keywords: ["finance", "金融", "money", "财富", "收益", "回测", "portfolio", "投资", "利率"],
                icon: <Coins className="h-8 w-8" />,
            },
            {
                key: "ui",
                keywords: ["ui", "design", "设计", "framer", "motion", "动画", "交互", "prototype", "组件", "component"],
                icon: <Palette className="h-8 w-8" />,
            },
            {
                key: "canvas",
                keywords: ["canvas", "webgl", "shader", "渲染", "render", "graphics", "图形", "particle", "粒子"],
                icon: <Layers className="h-8 w-8" />,
            },
            {
                key: "ai",
                keywords: ["ai", "llm", "model", "模型", "embedding", "向量", "agent", "智能", "推理"],
                icon: <Cpu className="h-8 w-8" />,
            },
            {
                key: "energy",
                keywords: ["performance", "性能", "optimize", "优化", "benchmark", "压测", "latency", "延迟"],
                icon: <Zap className="h-8 w-8" />,
            },
            {
                key: "chem",
                keywords: ["chem", "化学", "beaker", "实验", "reaction", "反应"],
                icon: <Beaker className="h-8 w-8" />,
            },
            {
                key: "chat",
                keywords: ["chat", "聊天", "message", "微信", "对话", "im"],
                icon: <MessageCircle className="h-8 w-8" />,
            },
            {
                key: "image",
                keywords: ["image", "图像", "emoji", "表情", "photo", "图片", "合成"],
                icon: <ImageIcon className="h-8 w-8" />,
            },
            {
                key: "toy",
                keywords: ["game", "小游戏", "游戏", "play", "fun", "toy", "puzzle", "解谜"],
                icon: <Gamepad2 className="h-8 w-8" />,
            },
            {
                key: "tool",
                keywords: ["tool", "工具", "utility", "utils", "generator", "生成器", "converter", "转换器", "formatter", "格式化", "editor", "编辑器"],
                icon: <Wrench className="h-8 w-8" />,
            },
        ];

    for (const r of rules) {
        const hit = r.keywords.some((k) => t.includes(norm(k)));
        if (hit) return { key: r.key, icon: r.icon };
    }

    // 兜底：必须是 4 个主分类 icon（满足要求 #2）
    return { key: "fallback", icon: <span className="text-neutral-400">{PRESET_STYLE[primary].presetIcon}</span> };
}

const PRESET_SEGMENTS: Array<{ key: "all" | PresetKey; label: string; icon: React.ReactNode }> = [
    { key: "all", label: "全部", icon: <Box className="h-4 w-4 opacity-80" /> },
    { key: "game", label: "小游戏", icon: <Gamepad2 className="h-4 w-4 opacity-80" /> },
    { key: "sim", label: "实验仿真", icon: <Atom className="h-4 w-4 opacity-80" /> },
    { key: "viz", label: "原理可视化", icon: <Wand2 className="h-4 w-4 opacity-80" /> },
    { key: "tool", label: "小工具", icon: <Wrench className="h-4 w-4 opacity-80" /> },
];

export default function LabsPage() {
    const [category, setCategory] = useState<CategoryKey>("all");
    const [q, setQ] = useState("");

    // Sidebar interactions
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tagsExpanded, setTagsExpanded] = useState(false);

    const tagStats = useMemo(() => {
        const map = new Map<string, number>();
        for (const lab of labs) {
            for (const t of lab.tags ?? []) {
                const key = String(t).trim();
                if (!key) continue;
                map.set(key, (map.get(key) ?? 0) + 1);
            }
        }
        return Array.from(map.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    }, []);

    const filtered = useMemo(() => {
        const query = norm(q);

        return labs.filter((lab) => {
            const labTags = lab.tags ?? [];

            // 分类过滤
            const okByCategory = (() => {
                if (category === "all") return true;
                if (category.startsWith("preset:")) {
                    const preset = category.slice("preset:".length) as PresetKey;
                    return matchesPreset(labTags, preset);
                }
                if (category.startsWith("tag:")) {
                    const t = category.slice("tag:".length);
                    return labTags.some((x) => norm(x) === norm(t));
                }
                return true;
            })();
            if (!okByCategory) return false;

            // 搜索过滤
            if (!query) return true;
            const hay = `${lab.title} ${lab.description}`.toLowerCase();
            return hay.includes(query);
        });
    }, [category, q]);

    const selectedLabel = useMemo(() => {
        if (category === "all") return "全部";
        if (category.startsWith("preset:")) return getPresetLabel(category.slice("preset:".length) as PresetKey);
        if (category.startsWith("tag:")) return category.slice("tag:".length);
        return "全部";
    }, [category]);

    const segmentActiveIndex = useMemo(() => {
        if (category === "all") return 0;
        if (category.startsWith("preset:")) {
            const p = category.slice("preset:".length) as PresetKey;
            const idx = PRESET_SEGMENTS.findIndex((s) => s.key === p);
            return idx >= 0 ? idx : 0;
        }
        return -1; // 选 tag 时不显示 segmented 指示条
    }, [category]);

    return (
        <div className="space-y-12">
            {/* Header */}
            <section className="space-y-4 py-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                    <FlaskConical className="h-3 w-3" />
                    <span>Experimental Playground</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                        Labs
                    </span>
                    <span className="text-neutral-200 dark:text-neutral-800"> / </span>
                    <span className="text-neutral-900 dark:text-white">Experiments</span>
                </h1>

                <p className="mx-auto max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                    这里存放着我的交互实验、UI 组件原型以及一些有趣的 Web 技术探索。
                    <br className="hidden md:block" />
                    它们可能不完美，但一定很有趣。
                </p>
            </section>

            {/* Layout */}
            <div
                className={[
                    "grid gap-8",
                    sidebarCollapsed ? "grid-cols-1 lg:grid-cols-[56px_1fr]" : "grid-cols-1 lg:grid-cols-[290px_1fr]",
                ].join(" ")}
            >
                {/* Sidebar */}
                <aside className="lg:sticky lg:top-24 h-fit">
                    {/* Collapsed Rail + Expand Button */}
                    {sidebarCollapsed ? (
                        <div className="relative">
                            {/* narrow pill */}
                            <div className="glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 h-[72vh] min-h-[420px]" />
                            {/* floating expand button */}
                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed(false)}
                                className="glass absolute top-6 -right-4 h-10 w-10 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center hover:bg-white/60 dark:hover:bg-neutral-800/50 transition"
                                aria-label="Expand sidebar"
                                title="Expand"
                            >
                                <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">分类</div>

                                <div className="flex items-center gap-2">
                                    <div className="text-[11px] font-mono opacity-60">
                                        {filtered.length}/{labs.length}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSidebarCollapsed(true)}
                                        className="h-9 w-9 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center hover:bg-white/60 dark:hover:bg-neutral-800/50 transition"
                                        aria-label="Collapse sidebar"
                                        title="Collapse"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Preset Segmented Control */}
                            <div className="mt-4">
                                <div className="relative rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-900/30 p-1 overflow-hidden">
                                    {segmentActiveIndex >= 0 && (
                                        <div
                                            className="absolute left-1 right-1 h-[44px] rounded-xl bg-neutral-900 dark:bg-white transition-transform duration-300 ease-out"
                                            style={{ transform: `translateY(${segmentActiveIndex * 46}px)` }}
                                        />
                                    )}

                                    <div className="relative z-10 space-y-1">
                                        {PRESET_SEGMENTS.map((seg) => {
                                            const active =
                                                (seg.key === "all" && category === "all") ||
                                                (seg.key !== "all" && category === `preset:${seg.key}`);

                                            return (
                                                <button
                                                    key={seg.key}
                                                    type="button"
                                                    onClick={() => setCategory(seg.key === "all" ? "all" : `preset:${seg.key}`)}
                                                    className={[
                                                        "w-full h-[44px] rounded-xl px-3 flex items-center justify-between transition-colors",
                                                        active
                                                            ? "text-white dark:text-black"
                                                            : "text-neutral-700 hover:bg-white/50 dark:text-neutral-300 dark:hover:bg-neutral-800/40",
                                                    ].join(" ")}
                                                >
                                                    <span className="flex items-center gap-2 min-w-0">
                                                        <span className={active ? "opacity-95" : "opacity-70"}>{seg.icon}</span>
                                                        <span className="truncate text-sm font-medium">{seg.label}</span>
                                                    </span>

                                                    <span className={active ? "opacity-70 text-[11px] font-mono" : "opacity-40 text-[11px] font-mono"}>
                                                        {seg.key === "all" ? "All" : seg.key.toUpperCase()}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />

                            {/* Tags header (collapsed by default) */}
                            <button
                                type="button"
                                onClick={() => setTagsExpanded((v) => !v)}
                                className="w-full flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-white/40 dark:hover:bg-neutral-800/30 transition"
                                aria-expanded={tagsExpanded}
                            >
                                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">Tags</div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <span className="text-[11px] font-mono opacity-70">{tagStats.length}</span>
                                    <ChevronDown className={["h-4 w-4 transition-transform", tagsExpanded ? "rotate-180" : ""].join(" ")} />
                                </div>
                            </button>

                            {/* Tags list: expand to ~6 items height, scroll inside */}
                            <div
                                className={[
                                    "mt-2 overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                                    tagsExpanded ? "max-h-[240px] opacity-100" : "max-h-0 opacity-0",
                                ].join(" ")}
                            >
                                <div className="max-h-[240px] overflow-auto pr-1 space-y-1">
                                    {tagStats.map(({ tag, count }) => (
                                        <NavItem
                                            key={tag}
                                            active={category === `tag:${tag}`}
                                            label={tag}
                                            right={String(count)}
                                            leftIcon={<span className="h-4 w-4 grid place-items-center opacity-60">#</span>}
                                            onClick={() => setCategory(`tag:${tag}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main */}
                <section className="space-y-6">
                    {/* Search */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="glass w-full rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 px-4 py-3 flex items-center gap-3">
                            <Search className="h-4 w-4 text-neutral-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="搜索实验名称或描述…"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                            />
                            {q ? (
                                <button
                                    type="button"
                                    onClick={() => setQ("")}
                                    className="h-7 w-7 rounded-full flex items-center justify-center border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white/60 dark:hover:bg-neutral-800/60 transition"
                                    aria-label="Clear"
                                >
                                    <X className="h-4 w-4 text-neutral-400" />
                                </button>
                            ) : null}
                        </div>

                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            当前： <span className="text-neutral-900 dark:text-white font-medium">{selectedLabel}</span>
                        </div>
                    </div>

                    {/* Empty */}
                    {filtered.length === 0 ? (
                        <div className="glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-10 text-center">
                            <div className="mx-auto w-fit rounded-2xl bg-white/50 p-4 shadow-sm backdrop-blur-md dark:bg-black/20">
                                <Sparkles className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">没有匹配的实验</h3>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">换个关键词，或者试试左侧其它分类/标签。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((lab) => {
                                const tags = lab.tags ?? [];
                                const primary = getPrimaryPreset(tags);
                                const style = PRESET_STYLE[primary];

                                // 预览 icon（主题匹配），无命中则兜底主分类 icon
                                const previewIcon = pickPreviewIcon(tags, primary);

                                return (
                                    <Link
                                        key={lab.slug}
                                        href={`/labs/${lab.slug}`}
                                        className={[
                                            "group relative overflow-hidden rounded-[2rem] glass transition-all",
                                            "hover:-translate-y-1 hover:shadow-2xl",
                                            style.hoverShadow,
                                        ].join(" ")}
                                    >
                                        {/* Preview: 渐变 ONLY depends on primary preset */}
                                        <div className={["relative h-48 w-full overflow-hidden bg-gradient-to-br", style.previewGradient].join(" ")}>
                                            {/* Badge: primary preset */}
                                            <div className="absolute left-4 top-4 z-20">
                                                <div
                                                    className={[
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                                                        "bg-white/60 dark:bg-black/20",
                                                        `bg-gradient-to-r ${style.badgeGradient}`,
                                                        style.badgeBorder,
                                                        style.badgeText,
                                                    ].join(" ")}
                                                >
                                                    <span className="opacity-90">{style.presetIcon}</span>
                                                    <span>{getPresetLabel(primary)}</span>
                                                </div>
                                            </div>

                                            {/* Glows */}
                                            <div className={["absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-colors", style.glowA].join(" ")} />
                                            <div className={["absolute top-10 left-10 h-24 w-24 rounded-full blur-2xl transition-colors", style.glowB].join(" ")} />

                                            {/* Center Icon (theme icon), fallback to primary preset icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-2xl bg-white/55 p-4 shadow-sm backdrop-blur-md dark:bg-black/20">
                                                    <div className={["text-neutral-400 transition-colors", style.hoverText].join(" ")}>
                                                        {previewIcon.icon}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-6">
                                            <h3
                                                className={[
                                                    "text-xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors",
                                                    style.hoverText,
                                                ].join(" ")}
                                            >
                                                {lab.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{lab.description}</p>

                                            {/* Tags chips */}
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {tags.slice(0, 4).map((t) => (
                                                    <span
                                                        key={t}
                                                        className="rounded-full border border-neutral-200/70 bg-white/50 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:text-neutral-300"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                                {tags.length > 4 ? <span className="text-[11px] text-neutral-400">+{tags.length - 4}</span> : null}
                                            </div>

                                            {/* CTA follows primary color */}
                                            <div
                                                className={[
                                                    "mt-6 flex items-center gap-2 text-xs font-semibold opacity-0 transform translate-y-2 transition-all",
                                                    "group-hover:opacity-100 group-hover:translate-y-0",
                                                    style.badgeText,
                                                ].join(" ")}
                                            >
                                                Run Experiment <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function NavItem({
    label,
    right,
    active,
    onClick,
    leftIcon,
}: {
    label: string;
    right?: string;
    active?: boolean;
    onClick: () => void;
    leftIcon?: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                "border border-transparent",
                active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "text-neutral-600 hover:bg-white/60 dark:text-neutral-300 dark:hover:bg-neutral-800/50",
            ].join(" ")}
        >
            <span className="flex min-w-0 items-center gap-2">
                {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
                <span className="truncate">{label}</span>
            </span>

            {right ? (
                <span className={["text-[11px] font-mono opacity-70", active ? "text-white/80 dark:text-black/70" : ""].join(" ")}>
                    {right}
                </span>
            ) : null}
        </button>
    );
}
