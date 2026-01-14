// app/tags/tags-client.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Hash, Sparkles, ArrowRight, Layers } from "lucide-react";
import {
    staggerContainer,
    fadeInUp,
    heroSlideLeft,
    heroSlideRight,
    heroSlideUp,
} from "@/components/motion/variants";

type TagItem = { tag: string; count: number };

/* ✅ 列表容器：只负责 stagger，不控制 opacity（避免整体透明/状态不触发导致渐变“像消失”） */
const listStagger: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.02,
        },
    },
};

/* ✅ 单卡片入场：稳定 */
const cardIn: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeInOut" },
    },
};

export default function TagsClient({ tags }: { tags: TagItem[] }) {
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);
    const featuredTags = sortedTags.slice(0, 5);
    const otherTags = sortedTags.slice(5);

    // ✅ 只保留渐变色定义：避免把 text-* 类塞进渐变层（不需要，也可能造成可读性/覆盖问题）
    const gradients = [
        "from-sky-500/25 to-cyan-500/25",
        "from-purple-500/25 to-pink-500/25",
        "from-amber-500/25 to-orange-500/25",
        "from-emerald-500/25 to-teal-500/25",
        "from-indigo-500/20 to-blue-500/20",
    ];

    const pillTags = featuredTags.length === 0 ? sortedTags : otherTags;

    return (
        <div className="space-y-12 pb-20">
            {/* Header：与 Notes/Labs/Archive 保持同一入场范式（stagger + heroSlideRight/Left/Up） */}
            <motion.section
                className="space-y-4 py-10 text-center"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                >
                    <Layers className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
                    <span>Topic Index</span>
                </motion.div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    <motion.span
                        variants={heroSlideRight}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-cyan-400 inline-block"
                    >
                        Tags
                    </motion.span>
                    <motion.span variants={heroSlideLeft} className="text-neutral-900 dark:text-white inline-block">
                        {" "}
                        / Explore
                    </motion.span>
                </h1>

                <motion.p variants={heroSlideUp} className="mx-auto max-w-xl text-lg text-neutral-500 dark:text-neutral-400">
                    通过话题标签快速定位笔记。这里汇集了 {tags.length} 个不同维度的知识节点。
                </motion.p>
            </motion.section>

            {/* Featured Tags：grid stagger */}
            {featuredTags.length > 0 && (
                <section className="space-y-6">
                    {/* ✅ 标题：首屏稳定入场（不依赖 inView） */}
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="show"
                        className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                    >
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        热门话题
                    </motion.div>

                    {/* ✅ Grid：首屏稳定入场 + staggerChildren */}
                    <motion.div
                        variants={listStagger}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[140px]"
                    >
                        {featuredTags.map((t, i) => {
                            const isLarge = i === 0 || i === 1;
                            const gradient = gradients[i % gradients.length];

                            return (
                                <motion.div
                                    key={t.tag}
                                    variants={cardIn}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className={isLarge ? "lg:col-span-3 md:col-span-1" : "lg:col-span-2 md:col-span-1"}
                                >
                                    <Link
                                        href={`/tags/${encodeURIComponent(t.tag)}`}
                                        className={[
                                            // ✅ isolate + block：确保渐变层叠在正确层级、圆角裁切稳定
                                            "block isolate group relative overflow-hidden rounded-3xl border",
                                            "border-neutral-200/60 bg-white/55 dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                            "backdrop-blur-md transition-all",
                                            "hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950",
                                        ].join(" ")}
                                    >
                                        {/* ✅ Gradient overlay：恢复彩色背景（更稳的层级 + 更清晰的 opacity） */}
                                        <div
                                            className={[
                                                "pointer-events-none absolute inset-0 z-0 bg-gradient-to-br",
                                                "opacity-55 transition-opacity duration-300",
                                                "group-hover:opacity-95",
                                                gradient,
                                            ].join(" ")}
                                        />

                                        {/* ✅ Glows：hover 时更明显 */}
                                        <div className="pointer-events-none absolute -top-10 -right-10 z-0 h-28 w-28 rounded-full bg-cyan-500/18 blur-3xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="pointer-events-none absolute top-8 left-10 z-0 h-20 w-20 rounded-full bg-teal-500/14 blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-90" />

                                        {/* Content */}
                                        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                            <div className="flex justify-between items-start">
                                                <Hash className="h-6 w-6 opacity-50" />
                                                <span className="text-xs font-mono opacity-80 bg-white/45 dark:bg-black/20 px-2 py-1 rounded-full border border-white/30 dark:border-white/10 backdrop-blur-md">
                                                    {t.count} posts
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                                    {t.tag}
                                                </h3>

                                                {/* ✅ CTA hover 动效更顺滑 */}
                                                <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-700/80 dark:text-neutral-200/80 opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
                                                    Explore <ArrowRight className="h-3 w-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>
            )}

            {/* Pills：逐个 fadeUp */}
            <section className="space-y-6">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "80px" }}
                    className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                >
                    <Hash className="h-4 w-4 text-neutral-500" />
                    完整索引
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "80px" }}
                    className="flex flex-wrap gap-3"
                >
                    {pillTags.length > 0 ? (
                        pillTags.map((t) => (
                            <motion.div key={t.tag} variants={fadeInUp}>
                                <Link
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
                                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-700/60 transition-colors group-hover:border-cyan-500/25 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                                        {t.count}
                                    </span>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-400 italic">没有更多标签了...</p>
                    )}
                </motion.div>
            </section>
        </div>
    );
}
