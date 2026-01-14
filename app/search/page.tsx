"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Search,
    Loader2,
    FileText,
    Calendar,
    Tag,
    ArrowRight,
    Command,
    FlaskConical,
} from "lucide-react";

import { labs } from "../../labs/_registry";

type NoteItem = {
    slug: string;
    title: string;
    description?: string;
    date: string;
    tags: string[];
    preview: string;
};

type LabItem = {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
};

type SearchHit =
    | { kind: "note"; item: NoteItem }
    | { kind: "lab"; item: LabItem };

function normalize(s: string) {
    return String(s ?? "").trim().toLowerCase();
}

function TypeBadge({ kind }: { kind: SearchHit["kind"] }) {
    const isNote = kind === "note";

    // Notes: Blue, Labs: Purple (统一苹果风的浅色填充 + 边框 + 小 icon)
    const wrap = isNote
        ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
        : "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300";

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold backdrop-blur-md",
                wrap,
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

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [data, setData] = useState<NoteItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadNotesIndex() {
        setLoading(true);
        try {
            const res = await fetch("/api/notes-index", { cache: "no-store" });
            const json = (await res.json()) as NoteItem[];
            setData(json);
        } finally {
            setLoading(false);
        }
    }

    const handleFocus = () => {
        // 只在第一次聚焦时加载 notes 索引；labs 是本地静态数据，不需要加载
        if (!data && !loading) loadNotesIndex();
    };

    // 预先把 labs 做成可搜索的 haystack（只算一次）
    const labIndex = useMemo(() => {
        return labs.map((l) => ({
            kind: "lab" as const,
            item: l,
            hay: normalize([l.title, l.description, l.date, l.tags.join(" ")].join(" ")),
        }));
    }, []);

    // notes index：仅在 data 更新时构建一次（避免每次输入都重新拼字符串）
    const noteIndex = useMemo(() => {
        const items = data ?? [];
        return items.map((n) => ({
            kind: "note" as const,
            item: n,
            hay: normalize(
                [n.title, n.description ?? "", n.date, n.tags.join(" "), n.preview].join(" ")
            ),
        }));
    }, [data]);

    // 合并并过滤（q 变化只做 includes）
    const results = useMemo(() => {
        const query = normalize(q);

        // 未输入时：显示已加载 notes + 全量 labs（labs 不需要加载）
        const combined = [...labIndex, ...noteIndex];

        if (!query) return combined.map((x) => ({ kind: x.kind, item: x.item })) as SearchHit[];

        return combined
            .filter((x) => x.hay.includes(query))
            .map((x) => ({ kind: x.kind, item: x.item })) as SearchHit[];
    }, [q, labIndex, noteIndex]);

    const counts = useMemo(() => {
        let notes = 0;
        let labsCount = 0;
        for (const r of results) {
            if (r.kind === "note") notes += 1;
            else labsCount += 1;
        }
        return { notes, labs: labsCount, total: notes + labsCount };
    }, [results]);

    return (
        <div className="mx-auto max-w-3xl space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Command className="h-3 w-3 text-purple-500" />
                    <span>Quick Find</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">全站检索</h1>

                <p className="text-neutral-500 dark:text-neutral-400">
                    即时查找笔记与实验内容，支持标题、标签与正文片段。
                </p>
            </div>

            {/* Search Bar */}
            <div className="sticky top-24 z-30">
                <div className="relative group">
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative flex items-center overflow-hidden rounded-[1.5rem] bg-white/80 shadow-2xl shadow-neutral-200/20 backdrop-blur-xl border border-neutral-200/50 dark:bg-neutral-900/80 dark:shadow-black/50 dark:border-neutral-700/50">
                        <div className="pl-6 text-neutral-400">
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            ) : (
                                <Search className="h-6 w-6" />
                            )}
                        </div>

                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onFocus={handleFocus}
                            placeholder="搜索笔记或实验：标题 / 标签 / 内容…"
                            className="h-16 w-full bg-transparent px-4 text-lg outline-none placeholder:text-neutral-400 dark:text-white"
                        />

                        <div className="pr-4 flex items-center gap-2">
                            {!data && !loading && (
                                <button
                                    onClick={loadNotesIndex}
                                    className="rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    Load Notes Index
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Counts Bar */}
            <div className="sticky top-[calc(6rem+80px)] z-20">
                <div className="glass rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-500 dark:bg-neutral-800">
                            {counts.total} 结果
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-medium text-blue-700 dark:text-blue-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70" />
                            {counts.notes} 笔记
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-medium text-purple-700 dark:text-purple-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500/70" />
                            {counts.labs} 实验
                        </span>
                    </div>
                </div>
            </div>
            {/* Results */}
            <div className="space-y-6">
                {/* 空态：notes 未加载 & 没输入 */}
                {!data && !q ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <Command className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm">
                            输入关键词即可搜索实验；搜索笔记内容请聚焦输入框自动加载，或点击{" "}
                            <span className="font-medium">Load Notes Index</span>。
                        </p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText className="mb-4 h-12 w-12 text-neutral-200 dark:text-neutral-800" />
                        <p className="text-neutral-500">没有找到与 &quot;{q}&quot; 相关的结果</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {results.map((r) => {
                            const isNote = r.kind === "note";
                            const item = r.item;

                            const href = isNote ? `/notes/${item.slug}` : `/labs/${item.slug}`;
                            const title = item.title;
                            const description = isNote ? item.description : (item as LabItem).description;
                            const date = item.date;
                            const tags = item.tags ?? [];
                            const preview = isNote ? (item as NoteItem).preview : "";

                            // hover 色系：notes 蓝，labs 紫
                            const hoverTitle =
                                isNote
                                    ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                    : "group-hover:text-purple-600 dark:group-hover:text-purple-400";
                            const hoverCta =
                                isNote
                                    ? "group-hover:bg-blue-500 group-hover:text-white"
                                    : "group-hover:bg-purple-500 group-hover:text-white";

                            return (
                                <Link
                                    key={`${r.kind}:${item.slug}`}
                                    href={href}
                                    className="group relative block overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/40 p-6 transition-all hover:bg-white hover:shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/40 dark:hover:bg-neutral-900"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mb-1">
                                                    <TypeBadge kind={r.kind} />
                                                    <span className="inline-flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" />
                                                        {date}
                                                    </span>
                                                </div>

                                                <h2
                                                    className={[
                                                        "text-xl font-bold text-neutral-900 dark:text-white transition-colors",
                                                        hoverTitle,
                                                    ].join(" ")}
                                                >
                                                    {title}
                                                </h2>
                                            </div>

                                            {description ? (
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                                                    {description}
                                                </p>
                                            ) : null}

                                            {tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {tags.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                                        >
                                                            <Tag className="h-2 w-2" />
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}

                                            {/* notes 才有 preview 片段，labs 不显示这块，保持“相似但不冗余” */}
                                            {isNote && preview ? (
                                                <p className="text-xs text-neutral-400 line-clamp-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-3 font-mono opacity-70">
                                                    {preview}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div
                                            className={[
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 dark:bg-neutral-800",
                                                hoverCta,
                                            ].join(" ")}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
