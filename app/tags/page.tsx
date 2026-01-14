import Link from "next/link";
import { getAllTags } from "@/lib/content";
import { Hash, Sparkles, ArrowRight, Layers } from "lucide-react";

export default function TagsPage() {
    const tags = getAllTags();

    // 按数量倒序
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);

    // 前 5 个热门标签
    const featuredTags = sortedTags.slice(0, 5);
    const otherTags = sortedTags.slice(5);

    // 热门卡片渐变：
    const gradients = [
        // 蓝 → 青（冷静、技术感）
        "from-sky-500/20 to-cyan-500/20 text-sky-700 dark:text-sky-300",
        // 紫 → 粉（创意 / 灵感）
        "from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300",
        // 琥珀 → 橙（温暖、活跃）
        "from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300",
        // 绿 → 蓝绿（自然、成长）
        "from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300",
        // 靛 → 蓝（沉稳、系统感）
        "from-indigo-500/18 to-blue-500/18 text-indigo-700 dark:text-indigo-300",
    ];

    // 这一页展示的 pills：如果没有热门，则 pills 展示全部；否则展示剩余
    const pillTags = featuredTags.length === 0 ? sortedTags : otherTags;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <section className="text-center space-y-4 py-10">
                {/* Topic Index（按你要求：浅绿色） */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Layers className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
                    <span>Topic Index</span>
                </div>

                {/* 标题：Tags 蓝绿色渐变 */}
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-cyan-400">
                        Tags
                    </span>
                    <span className="text-neutral-900 dark:text-white"> / Explore</span>
                </h1>

                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                    通过话题标签快速定位笔记。这里汇集了 {tags.length} 个不同维度的知识节点。
                </p>
            </section>

            {/* Featured Tags - Bento Grid（结构不动，只升级质感/交互） */}
            {featuredTags.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        热门话题
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[140px]">
                        {featuredTags.map((t, i) => {
                            const isLarge = i === 0 || i === 1;
                            const gradient = gradients[i % gradients.length];

                            return (
                                <Link
                                    key={t.tag}
                                    href={`/tags/${encodeURIComponent(t.tag)}`}
                                    className={[
                                        // 卡片基座：更“玻璃”、边框更细腻、hover 更克制（不 scale 太大）
                                        "group relative overflow-hidden rounded-3xl border",
                                        "border-neutral-200/60 bg-white/55 dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                        "backdrop-blur-md transition-all",
                                        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30",
                                        // 可达性：键盘 focus 也有光环
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950",
                                        isLarge ? "lg:col-span-3 md:col-span-1" : "lg:col-span-2 md:col-span-1",
                                    ].join(" ")}
                                >
                                    {/* 渐变背景层：默认更柔和，hover 更明显 */}
                                    <div
                                        className={[
                                            "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-300",
                                            "group-hover:opacity-80",
                                            gradient,
                                        ].join(" ")}
                                    />

                                    {/* 额外的柔光（提升层次，不改变布局） */}
                                    <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-500/15 blur-3xl opacity-60 transition-opacity group-hover:opacity-90" />
                                    <div className="absolute top-8 left-10 h-20 w-20 rounded-full bg-teal-500/10 blur-2xl opacity-40 transition-opacity group-hover:opacity-70" />

                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <Hash className="h-6 w-6 opacity-50" />

                                            {/* count badge：更像“玻璃徽章” */}
                                            <span className="text-xs font-mono opacity-80 bg-white/45 dark:bg-black/20 px-2 py-1 rounded-full border border-white/30 dark:border-white/10 backdrop-blur-md">
                                                {t.count} posts
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                                {t.tag}
                                            </h3>

                                            {/* hover 才出现的行动提示：更顺滑（淡入+上移） */}
                                            <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-700/80 dark:text-neutral-200/80 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                                                Explore <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All Tags - 胶囊列表（结构不动，只升级视觉/反馈/可达性） */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    <Hash className="h-4 w-4 text-neutral-500" />
                    完整索引
                </div>

                <div className="flex flex-wrap gap-3">
                    {pillTags.length > 0 ? (
                        pillTags.map((t) => (
                            <Link
                                key={t.tag}
                                href={`/tags/${encodeURIComponent(t.tag)}`}
                                className={[
                                    "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                                    "border border-neutral-200/70 bg-white/70 dark:border-neutral-800/70 dark:bg-neutral-900/45",
                                    "backdrop-blur-md transition-all",
                                    "hover:-translate-y-[1px] hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/35 hover:bg-white/85 dark:hover:bg-neutral-900/60",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950",
                                ].join(" ")}
                                title={`查看 #${t.tag}`}
                            >
                                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                                    {t.tag}
                                </span>

                                {/* count badge：更克制、更像系统徽章 */}
                                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 transition-colors group-hover:border-cyan-500/25 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                                    {t.count}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-400 italic">没有更多标签了...</p>
                    )}
                </div>
            </section>
        </div>
    );
}
