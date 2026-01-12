"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

    // 这是客户端页面，所以我们用 fetch 调一个极简 API（下一步创建）
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

    const items = data ?? [];

    const results = useMemo(() => {
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
    }, [q, items]);

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
                <p className="prose-base">
                    极简搜索：按标题/描述/标签/正文片段过滤（本地与 Vercel 都稳定）。
                </p>
            </header>

            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="输入关键词…（例如：Math / LaTeX / React）"
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:focus:ring-neutral-700"
                    />
                    <button
                        type="button"
                        onClick={load}
                        className="shrink-0 rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40"
                    >
                        {data ? "Refresh" : "Load"}
                    </button>
                </div>

                {!data ? (
                    <div className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                        <p className="prose-base">
                            点击 <b>Load</b> 加载索引后开始搜索。
                        </p>
                    </div>
                ) : loading ? (
                    <div className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                        <p className="prose-base">Loading…</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            共 {results.length} 条结果
                        </div>

                        {results.map((n) => (
                            <Link
                                key={n.slug}
                                href={`/notes/${n.slug}`}
                                className="block rounded-2xl border border-neutral-200/70 p-5 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                            >
                                <div className="flex items-baseline justify-between gap-3">
                                    <h2 className="text-base font-semibold">{n.title}</h2>
                                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                        {n.date}
                                    </span>
                                </div>

                                {n.description ? (
                                    <p className="prose-base mt-2">{n.description}</p>
                                ) : null}

                                {n.tags.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {n.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}

                                {n.preview ? (
                                    <p className="mt-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        {n.preview}
                                    </p>
                                ) : null}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
