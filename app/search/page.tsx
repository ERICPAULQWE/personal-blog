"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Loader2, FileText, Calendar, Tag, ArrowRight, Command } from "lucide-react";

type NoteItem = {
    slug: string;
    title: string;
    description?: string;
    date: string;
    tags: string[];
    preview: string;
};

function normalize(s: string) {
    return s.trim().toLowerCase();
}

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [data, setData] = useState<NoteItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    async function load() {
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
        if (!data && !loading) load();
    };

    // 修复：将 items 的逻辑移入 useMemo 或直接依赖 data
    const results = useMemo(() => {
        const items = data ?? []; // 移入这里，避免 items 变量本身成为不稳定依赖
        const query = normalize(q);
        if (!query) return items;

        return items.filter((n) => {
            const hay = normalize(
                [
                    n.title,
                    n.description ?? "",
                    n.date,
                    n.tags.join(" "),
                    n.preview,
                ].join(" ")
            );
            return hay.includes(query);
        });
    }, [q, data]); // 依赖项改为稳定的 data

    return (
        <div className="mx-auto max-w-3xl space-y-12 pb-20">
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Command className="h-3 w-3 text-purple-500" />
                    <span>Quick Find</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    全站检索
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    即时查找笔记、实验与灵感片段。
                </p>
            </div>

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
                            placeholder="搜索标题、标签或内容..."
                            className="h-16 w-full bg-transparent px-4 text-lg outline-none placeholder:text-neutral-400 dark:text-white"
                        />
                        <div className="pr-4">
                            {!data && !loading && (
                                <button
                                    onClick={load}
                                    className="rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    Load Index
                                </button>
                            )}
                            {data && (
                                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800">
                                    {results.length} 结果
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {!data ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Command className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm">索引未加载，请输入内容或点击 Load</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <FileText className="mb-4 h-12 w-12 text-neutral-200 dark:text-neutral-800" />
                        <p className="text-neutral-500">没有找到与 &quot;{q}&quot; 相关的结果</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {results.map((n) => (
                            <Link
                                key={n.slug}
                                href={`/notes/${n.slug}`}
                                className="group relative block overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/40 p-6 transition-all hover:bg-white hover:shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/40 dark:hover:bg-neutral-900"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                                                <Calendar className="h-3 w-3" />
                                                {n.date}
                                            </div>
                                            <h2 className="text-xl font-bold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                                                {n.title}
                                            </h2>
                                        </div>

                                        {n.description && (
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                                                {n.description}
                                            </p>
                                        )}

                                        {n.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {n.tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                                    >
                                                        <Tag className="h-2 w-2" />
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {n.preview && (
                                            <p className="text-xs text-neutral-400 line-clamp-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-3 font-mono opacity-70">
                                                {n.preview}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-blue-500 group-hover:text-white dark:bg-neutral-800">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}