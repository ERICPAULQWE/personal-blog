import Link from "next/link";
import { groupNotesByMonth } from "@/lib/content";
import { labs } from "../../labs/_registry";

import {
    Archive,
    ArrowUpRight,
    Clock,
    FileText,
    FlaskConical,
    Tag,
} from "lucide-react";

type TimelineItem = {
    kind: "note" | "lab";
    slug: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags: string[];
};
type NoteFrontmatter = {
    title: string;
    description?: string;
    date: string;
    tags?: string[];
};

type NoteEntry = {
    slug: string;
    frontmatter: NoteFrontmatter;
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
            {isNote ? (
                <FileText className="h-3 w-3 opacity-90" />
            ) : (
                <FlaskConical className="h-3 w-3 opacity-90" />
            )}
            {isNote ? "笔记" : "实验"}
        </span>
    );
}

function getDay(date: string) {
    return date.split("-")[2] || "01";
}

function monthKey(date: string) {
    // YYYY-MM
    return date.slice(0, 7);
}

export default function ArchivePage() {
    // 1) Notes → 扁平化
    const noteGroups = groupNotesByMonth();

    const noteItems: TimelineItem[] = noteGroups.flatMap(([_month, notes]) =>
        (notes as NoteEntry[]).map((n) => ({
            kind: "note" as const,
            slug: n.slug,
            title: n.frontmatter.title,
            description: n.frontmatter.description,
            date: n.frontmatter.date,
            tags: (n.frontmatter.tags ?? []) as string[],
        }))
    );


    // 2) Labs → registry
    const labItems: TimelineItem[] = labs.map((l) => ({
        kind: "lab" as const,
        slug: l.slug,
        title: l.title,
        description: l.description,
        date: l.date,
        tags: l.tags ?? [],
    }));

    // 3) 合并 + 分组到月份
    const all = [...noteItems, ...labItems].filter((x) => x.date);
    const map = new Map<string, TimelineItem[]>();

    for (const item of all) {
        const ym = monthKey(item.date);
        const arr = map.get(ym) ?? [];
        arr.push(item);
        map.set(ym, arr);
    }

    // 4) 月份降序 + 月内日期降序
    const groups = Array.from(map.entries())
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([ym, items]) => [
            ym,
            items.sort((a, b) => (a.date < b.date ? 1 : -1)),
        ] as const);

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <section className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>Time Machine</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">归档</h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                    按照时间轴回顾所有的思考与记录（笔记 + 实验）。
                </p>
            </section>

            {/* Timeline Container */}
            <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 md:ml-10 space-y-16">
                {groups.length > 0 ? (
                    groups.map(([ym, items]) => {
                        const noteCount = items.filter((x) => x.kind === "note").length;
                        const labCount = items.filter((x) => x.kind === "lab").length;

                        return (
                            <div key={ym} className="relative pl-8 md:pl-12">
                                {/* Timeline Node：用更中性的节点色，避免“月份被某类型染色” */}
                                <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-neutral-400 ring-4 ring-white dark:ring-black dark:bg-neutral-600" />

                                {/* Month Header */}
                                <div className="flex flex-wrap items-end gap-3 mb-6">
                                    <h2 className="text-3xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                                        {ym}
                                    </h2>

                                    <span className="text-sm font-medium text-neutral-400 mb-1.5">
                                        {items.length} 条
                                    </span>

                                    {/* Breakdown pills：苹果风浅底 + 边框 */}
                                    <span className="mb-1.5 inline-flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                            <FileText className="h-3 w-3" />
                                            {noteCount}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                                            <FlaskConical className="h-3 w-3" />
                                            {labCount}
                                        </span>
                                    </span>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    {items.map((it) => {
                                        const day = getDay(it.date);
                                        const isNote = it.kind === "note";

                                        const href = isNote ? `/notes/${it.slug}` : `/labs/${it.slug}`;

                                        const hoverTitle = isNote
                                            ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                            : "group-hover:text-purple-600 dark:group-hover:text-purple-400";

                                        const hoverAccent = isNote
                                            ? "group-hover:bg-blue-500"
                                            : "group-hover:bg-purple-500";

                                        const hoverArrow = isNote
                                            ? "group-hover:text-blue-500"
                                            : "group-hover:text-purple-500";

                                        return (
                                            <Link
                                                key={`${it.kind}:${it.slug}`}
                                                href={href}
                                                className="group block relative overflow-hidden rounded-2xl border border-transparent bg-white/50 hover:bg-white hover:border-neutral-200 hover:shadow-lg dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:hover:border-neutral-800 dark:hover:shadow-neutral-900/50 transition-all duration-300 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                                        {/* Date Badge */}
                                                        <div
                                                            className={[
                                                                "flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-xl",
                                                                "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
                                                                "font-mono text-sm transition-colors duration-300",
                                                                hoverAccent,
                                                                "group-hover:text-white",
                                                            ].join(" ")}
                                                        >
                                                            <span className="text-[10px] opacity-70 uppercase leading-none mb-0.5">
                                                                Day
                                                            </span>
                                                            <span className="font-bold text-lg leading-none">{day}</span>
                                                        </div>

                                                        {/* Title & Desc */}
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
                                                                            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                                                        >
                                                                            <Tag className="h-2.5 w-2.5 opacity-70" />
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                    {it.tags.length > 6 ? (
                                                                        <span className="text-[10px] text-neutral-400">
                                                                            +{it.tags.length - 6}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {/* Arrow Icon */}
                                                    <ArrowUpRight
                                                        className={[
                                                            "h-5 w-5 text-neutral-300 transition-all duration-300",
                                                            hoverArrow,
                                                            "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                                                        ].join(" ")}
                                                    />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
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
