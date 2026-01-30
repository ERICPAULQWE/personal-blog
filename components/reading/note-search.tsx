"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

type SearchResult = {
    id: number;
    snippet: string;
    matchStartInSnippet: number;
    matchLength: number;
    origStart: number; // 命中在“原始全文(original)”中的起点索引
};

type Props = {
    onClose: () => void;
};

/**
 * 只清理“不可见字符/nbsp”，不清理普通空格/换行。
 * - &nbsp; => \u00A0
 * - 零宽字符：\u200B \u200C \u200D
 * - BOM：\uFEFF
 */
const INVISIBLE_RE = /[\u00A0\u200B\u200C\u200D\uFEFF]/g;

function buildInvisibleCleanMap(original: string): {
    original: string;
    cleaned: string;
    cleanToOrig: number[];
} {
    const cleanToOrig: number[] = [];
    let cleaned = "";

    for (let i = 0; i < original.length; i += 1) {
        const ch = original[i];
        if (INVISIBLE_RE.test(ch)) {
            INVISIBLE_RE.lastIndex = 0;
            continue;
        }
        cleaned += ch;
        cleanToOrig.push(i);
        INVISIBLE_RE.lastIndex = 0;
    }

    return { original, cleaned, cleanToOrig };
}

function buildResults(
    original: string,
    cleaned: string,
    cleanToOrig: number[],
    query: string
): SearchResult[] {
    if (!query) return [];

    // 同样只清理不可见字符，保持“连续匹配”的语义
    const cleanedQ = query.replace(INVISIBLE_RE, "");
    if (!cleanedQ) return [];

    const lowerText = cleaned.toLowerCase();
    const lowerQ = cleanedQ.toLowerCase();

    const results: SearchResult[] = [];
    const contextLen = 28;

    let fromIndex = 0;
    let hitId = 0;

    while (true) {
        const idx = lowerText.indexOf(lowerQ, fromIndex);
        if (idx === -1) break;

        hitId += 1;

        const origStart = cleanToOrig[idx] ?? 0;
        const origEnd =
            (cleanToOrig[idx + lowerQ.length - 1] ?? origStart) + 1;

        const start = Math.max(0, origStart - contextLen);
        const end = Math.min(original.length, origEnd + contextLen);

        const rawSnippet = original.slice(start, end);
        const snippet = rawSnippet
            .replace(INVISIBLE_RE, " ")
            .replace(/\s+/g, " ")
            .trim();

        const snippetLower = snippet.toLowerCase();
        const snippetMatchIdx = snippetLower.indexOf(lowerQ);

        results.push({
            id: hitId,
            snippet,
            matchStartInSnippet: Math.max(0, snippetMatchIdx),
            matchLength: cleanedQ.length,
            origStart,
        });

        fromIndex = idx + lowerQ.length;
        if (results.length >= 200) break;
    }

    return results;
}

function renderHighlightedSnippet(snippet: string, start: number, len: number) {
    const s = Math.max(0, Math.min(start, snippet.length));
    const e = Math.max(s, Math.min(s + len, snippet.length));

    const before = snippet.slice(0, s);
    const mid = snippet.slice(s, e);
    const after = snippet.slice(e);

    return (
        <span className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
            {before}
            <mark className="rounded-md px-1 bg-yellow-200/70 dark:bg-yellow-300/20">
                {mid}
            </mark>
            {after}
        </span>
    );
}

function scrollToOrigIndex(origIndex: number) {
    const article = document.querySelector("article.reading-prose");
    if (!article) return;

    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);

    let walked = 0;
    let node: Node | null;

    // eslint-disable-next-line no-cond-assign
    while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const len = textNode.data.length;

        if (walked + len > origIndex) {
            const offset = Math.max(0, origIndex - walked);

            const range = document.createRange();
            range.setStart(textNode, offset);
            range.setEnd(textNode, Math.min(offset + 1, len));

            const rect = range.getBoundingClientRect();
            if (rect && Number.isFinite(rect.top)) {
                window.scrollTo({
                    top: window.scrollY + rect.top - window.innerHeight * 0.35,
                    behavior: "smooth",
                });
            } else {
                (textNode.parentElement ?? article).scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }

            const host = (textNode.parentElement ?? article) as HTMLElement;
            host.classList.add(
                "ring-2",
                "ring-yellow-400/60",
                "dark:ring-yellow-300/30",
                "rounded-md"
            );
            window.setTimeout(() => {
                host.classList.remove(
                    "ring-2",
                    "ring-yellow-400/60",
                    "dark:ring-yellow-300/30",
                    "rounded-md"
                );
            }, 900);

            return;
        }

        walked += len;
    }
}

export function NoteSearch({ onClose }: Props) {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [composeTick, setComposeTick] = useState(0); // ✅ 用于强制在 compositionEnd 后刷新
    const containerRef = useRef<HTMLDivElement>(null);
    const isComposingRef = useRef(false);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [onClose]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    // ✅ 关键修复：把 composeTick 放入依赖，compositionEnd 时强制触发计算
    useEffect(() => {
        if (!keyword) {
            setResults([]);
            return;
        }
        if (isComposingRef.current) return;

        const t = window.setTimeout(() => {
            const article = document.querySelector("article.reading-prose");
            const original = article?.textContent ?? "";

            if (!original) {
                setResults([]);
                return;
            }

            const map = buildInvisibleCleanMap(original);
            setResults(buildResults(map.original, map.cleaned, map.cleanToOrig, keyword));
        }, 90);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, composeTick]);

    const countText = results.length > 0 ? `${results.length} 个匹配` : "无匹配";

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
            // ✅ 位置：别再下移了，回到更合适的 top-20
            className="
                fixed right-6 top-20 z-[60]
                w-[360px] max-w-[calc(100vw-3rem)]
                rounded-3xl p-3
                bg-white/88 dark:bg-neutral-950/75
                border border-neutral-200/60 dark:border-neutral-800/70
                backdrop-blur-xl
                shadow-2xl shadow-black/10 dark:shadow-black/40
            "
        >
            <div className="flex items-center justify-between px-1">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                    搜索当前文章
                </div>
                <div className="text-[10px] text-neutral-400">{countText}</div>
            </div>

            <div className="h-2" />

            <input
                autoFocus
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onCompositionStart={() => {
                    isComposingRef.current = true;
                }}
                onCompositionEnd={(e) => {
                    isComposingRef.current = false;
                    setKeyword(e.currentTarget.value);
                    // ✅ 强制刷新一次（即使 keyword 值没变化）
                    setComposeTick((v) => v + 1);
                }}
                placeholder="输入关键词…"
                className="
                    w-full rounded-2xl px-3 py-2
                    bg-neutral-100/70 dark:bg-neutral-900/40
                    text-sm text-neutral-800 dark:text-neutral-100
                    placeholder:text-neutral-400
                    focus:outline-none
                    focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:focus-visible:ring-white/10
                "
            />

            <div className="h-2.5" />

            {keyword ? (
                <div
                    className="
                        max-h-[46vh] overflow-auto custom-scrollbar
                        rounded-2xl
                        border border-neutral-200/50 dark:border-neutral-800/60
                        bg-white/60 dark:bg-neutral-900/30
                    "
                >
                    {results.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                            没有找到匹配项
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-200/50 dark:divide-neutral-800/60">
                            {results.map((r) => (
                                <li key={r.id}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToOrigIndex(r.origStart)}
                                        className="
                                            w-full text-left px-3 py-2
                                            hover:bg-white/70 dark:hover:bg-neutral-800/40
                                            transition-colors
                                        "
                                    >
                                        <div className="text-[10px] text-neutral-400 mb-1">
                                            #{r.id}
                                        </div>
                                        {renderHighlightedSnippet(
                                            r.snippet,
                                            r.matchStartInSnippet,
                                            r.matchLength
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <div className="px-1 text-[11px] text-neutral-400">
                    输入后会列出全文所有匹配项
                </div>
            )}
        </motion.div>
    );
}