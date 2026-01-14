// app/archive/archive-client.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Archive, ArrowUpRight, Clock, FileText, FlaskConical, Tag } from "lucide-react";
import {
    staggerContainer,
    fadeInUp,
    heroSlideLeft,
    heroSlideRight,
    heroSlideUp,
} from "@/components/motion/variants";

type TimelineItem = {
    kind: "note" | "lab";
    slug: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags: string[];
};

function typeBadge(kind: TimelineItem["kind"]) {
    const isNote = kind === "note";
    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold backdrop-blur-md",
                isNote
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300",
            ].join(" ")}
        >
            {isNote ? <FileText className="h-3 w-3 opacity-90" /> : <FlaskConical className="h-3 w-3 opacity-90" />}
            {isNote ? "笔记" : "实验"}
        </span>
    );
}

function getDay(date: string) {
    return date.split("-")[2] || "01";
}

/* ✅ 稳定 stagger：不改 opacity */
const listStagger: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.02,
        },
    },
};

/* ✅ 月份块入场 */
const monthIn: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" } },
};

/* ✅ 条目入场 */
const rowIn: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

export default function ArchiveClient({
    groups,
}: {
    // ✅ 关键：接受 readonly tuples，避免 TS2322
    groups: ReadonlyArray<readonly [string, TimelineItem[]]>;
}) {
    return (
        <div className="space-y-12 pb-20">
            {/* Header（与 Notes/Labs/Tags 一致的入场范式） */}
            <motion.section className="space-y-4 py-10 text-center" variants={staggerContainer} initial="hidden" animate="show">
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/15 dark:text-amber-300"
                >
                    <Clock className="h-3 w-3 text-amber-500 dark:text-amber-300" />
                    <span>Time Machine</span>
                </motion.div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    <motion.span
                        variants={heroSlideRight}
                        className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent dark:from-orange-400 dark:to-yellow-300 inline-block"
                    >
                        Archive
                    </motion.span>
                    <motion.span variants={heroSlideLeft} className="text-neutral-900 dark:text-white inline-block">
                        {" "}
                        / 归档
                    </motion.span>
                </h1>

                <motion.p variants={heroSlideUp} className="mx-auto max-w-xl text-lg text-neutral-500 dark:text-neutral-400">
                    按照时间轴回顾所有的思考与记录（笔记 + 实验）。
                </motion.p>
            </motion.section>

            {/* Timeline Container（保持原布局，只加动效） */}
            <div
                className={[
                    "relative ml-4 md:ml-10 space-y-16",
                    "before:absolute before:inset-y-0 before:left-0 before:w-px",
                    "before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent",
                    "dark:before:via-neutral-800",
                ].join(" ")}
            >
                {groups.length > 0 ? (
                    <div className="space-y-16">
                        {groups.map(([ym, items]) => {
                            const noteCount = items.filter((x) => x.kind === "note").length;
                            const labCount = items.filter((x) => x.kind === "lab").length;

                            return (
                                <motion.div
                                    key={ym}
                                    variants={monthIn}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true, margin: "120px" }}
                                    className="relative pl-8 md:pl-12"
                                >
                                    <div className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full bg-neutral-300/80 dark:bg-neutral-600/80 ring-[6px] ring-white/70 dark:ring-black/40 backdrop-blur-md shadow-sm" />

                                    <div className="flex flex-wrap items-end gap-3 mb-6">
                                        <h2 className="text-3xl font-bold tracking-tighter text-neutral-900 dark:text-white">{ym}</h2>
                                        <span className="text-sm font-medium text-neutral-400 mb-1.5">{items.length} 条</span>
                                        <span className="mb-1.5 inline-flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300 backdrop-blur-md">
                                                <FileText className="h-3 w-3" />
                                                {noteCount}
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300 backdrop-blur-md">
                                                <FlaskConical className="h-3 w-3" />
                                                {labCount}
                                            </span>
                                        </span>
                                    </div>

                                    <motion.div variants={listStagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "120px" }} className="space-y-3">
                                        {items.map((it) => {
                                            const day = getDay(it.date);
                                            const isNote = it.kind === "note";
                                            const href = isNote ? `/notes/${it.slug}` : `/labs/${it.slug}`;

                                            const hoverTitle = isNote
                                                ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                                : "group-hover:text-purple-600 dark:group-hover:text-purple-400";
                                            const hoverAccent = isNote ? "group-hover:bg-blue-500" : "group-hover:bg-purple-500";
                                            const hoverArrow = isNote ? "group-hover:text-blue-500" : "group-hover:text-purple-500";

                                            return (
                                                <motion.div key={`${it.kind}:${it.slug}`} variants={rowIn}>
                                                    <Link
                                                        href={href}
                                                        className={[
                                                            "group block relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
                                                            "border border-neutral-200/60 bg-white/55 backdrop-blur-md",
                                                            "dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                                            "hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30",
                                                            "dark:hover:bg-neutral-900/65 dark:hover:shadow-black/20",
                                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950",
                                                        ].join(" ")}
                                                    >
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                                                <div
                                                                    className={[
                                                                        "flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-xl",
                                                                        "bg-neutral-100/80 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300",
                                                                        "border border-neutral-200/60 dark:border-neutral-700/60",
                                                                        "font-mono text-sm transition-colors duration-300",
                                                                        hoverAccent,
                                                                        "group-hover:text-white",
                                                                    ].join(" ")}
                                                                >
                                                                    <span className="text-[10px] opacity-70 uppercase leading-none mb-0.5">Day</span>
                                                                    <span className="font-bold text-lg leading-none">{day}</span>
                                                                </div>

                                                                <div className="space-y-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        {typeBadge(it.kind)}
                                                                        <h3
                                                                            className={[
                                                                                "font-semibold text-lg text-neutral-900 dark:text-neutral-100 transition-colors truncate",
                                                                                hoverTitle,
                                                                            ].join(" ")}
                                                                        >
                                                                            {it.title}
                                                                        </h3>
                                                                    </div>

                                                                    {it.description ? (
                                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 hidden sm:block">
                                                                            {it.description}
                                                                        </p>
                                                                    ) : null}

                                                                    {it.tags?.length ? (
                                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                                            {it.tags.slice(0, 6).map((t) => (
                                                                                <span
                                                                                    key={t}
                                                                                    className="inline-flex items-center gap-1 rounded-full border border-neutral-200/60 bg-neutral-100/70 px-2 py-0.5 text-[10px] font-medium text-neutral-600 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-800/60 dark:text-neutral-300"
                                                                                >
                                                                                    <Tag className="h-2.5 w-2.5 opacity-70" />
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                            {it.tags.length > 6 ? (
                                                                                <span className="text-[10px] text-neutral-400">+{it.tags.length - 6}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            <ArrowUpRight
                                                                className={[
                                                                    "h-5 w-5 text-neutral-300 transition-all duration-300",
                                                                    hoverArrow,
                                                                    "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                                                                ].join(" ")}
                                                            />
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400 pl-8">
                        <Archive className="h-12 w-12 mb-4 opacity-20" />
                        <p>暂无历史归档</p>
                    </div>
                )}
            </div>
        </div>
    );
}
