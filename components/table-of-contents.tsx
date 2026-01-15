"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { List, ChevronRight, ChevronLeft } from "lucide-react";

interface TocItem {
    title: string;
    url: string;
    depth: number;
}

interface TableOfContentsProps {
    toc: TocItem[];
    isCollapsed: boolean;      // 改为外部传入
    onToggle: () => void;     // 改为外部传入
}

export function TableOfContents({ toc = [], isCollapsed, onToggle }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const items = useMemo(() => toc || [], [toc]);

    // ✅ 新增：目录滚动容器 ref，用来把高亮项滚到中间
    const tocContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (items.length === 0) return;

        const getIdFromHash = () => {
            const hash = decodeURIComponent(window.location.hash || "").replace(/^#/, "");
            if (!hash) return "";
            return document.getElementById(hash) ? hash : "";
        };

        const computeActiveId = () => {
            // 1) hash 优先（支持你从链接带 #xxx 进入时直接高亮）
            const fromHash = getIdFromHash();
            if (fromHash) return fromHash;

            // 2) 否则按当前滚动位置找“最后一个在阈值线之上”的 heading
            // 阈值可以按你的 UI 调整：越大越“提前”切换
            const threshold = 120;

            const candidates: { id: string; top: number }[] = [];
            for (const item of items) {
                const id = item.url.replace(/^#/, "");
                const el = document.getElementById(id);
                if (!el) continue;
                const top = el.getBoundingClientRect().top;
                candidates.push({ id, top });
            }

            // 找 top <= threshold 的最后一个
            const passed = candidates
                .filter((c) => c.top <= threshold)
                .sort((a, b) => a.top - b.top);

            if (passed.length > 0) return passed[passed.length - 1].id;

            // 3) 顶部时兜底：高亮第一个
            return items[0]?.url.replace(/^#/, "") || "";
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0% 0% -80% 0%" }
        );

        items.forEach((item) => {
            const id = item.url.replace(/^#/, "");
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        // ✅ 关键修复：首次挂载/首次打开目录时，立即计算一次 activeId
        // 用 rAF 保证 DOM 已经绘制完、位置是最新的
        const raf = requestAnimationFrame(() => {
            const id = computeActiveId();
            if (id) setActiveId(id);
        });

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, [items]);

    // ✅ 新增：让蓝色高亮项自动滚到目录栏正中心
    useEffect(() => {
        if (!activeId) return;
        if (isCollapsed) return;

        const container = tocContainerRef.current;
        if (!container) return;

        // 通过 data-toc-id 精确定位当前高亮的目录项（不会影响你的 className 逻辑）
        const safeId =
            typeof (window as any).CSS !== "undefined" && typeof (window as any).CSS.escape === "function"
                ? (window as any).CSS.escape(activeId)
                : activeId.replace(/["\\]/g, "\\$&"); // 简单兜底，避免 selector 崩掉

        const activeEl = container.querySelector<HTMLElement>(`[data-toc-id="${safeId}"]`);
        if (!activeEl) return;

        const raf = requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            const activeRect = activeEl.getBoundingClientRect();

            const containerCenter = containerRect.top + containerRect.height / 2;
            const activeCenter = activeRect.top + activeRect.height / 2;

            const delta = activeCenter - containerCenter;

            container.scrollTo({
                top: container.scrollTop + delta,
                behavior: "smooth",
            });
        });

        return () => cancelAnimationFrame(raf);
    }, [activeId, isCollapsed]);

    if (items.length === 0) return null;

    return (
        <div
            className={cn(
                "glass rounded-[2rem] p-3 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden transition-all duration-500 flex flex-col",
                isCollapsed ? "h-12 w-12" : "h-auto max-h-[70vh] w-64"
            )}
        >
            {/* 顶部控制栏 - 添加 shrink-0 防止被压缩 */}
            <div className={cn("flex items-center justify-between transition-all shrink-0", !isCollapsed && "mb-4 px-2")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 animate-in fade-in duration-500">
                        <List size={14} className="text-blue-500" />
                        <span className="font-bold text-[10px] uppercase tracking-tighter">目录大纲</span>
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
                    title={isCollapsed ? "展开" : "收起"}
                >
                    {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>

            {/* 列表内容区域 - 核心修复：使用 flex-1 min-h-0 实现内部滚动 */}
            <div
                ref={tocContainerRef}
                className={cn(
                    "transition-all duration-500 custom-scrollbar overflow-y-auto",
                    isCollapsed ? "opacity-0 h-0 pointer-events-none" : "opacity-100 flex-1 min-h-0"
                )}
            >
                <ul className="space-y-1.5 px-2 pb-2">
                    {items.map((item) => {
                        const id = item.url.replace(/^#/, "");
                        const isActive = activeId === id;

                        return (
                            <li key={item.url} style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 0.75}rem` }}>
                                <a
                                    href={item.url}
                                    data-toc-id={id}
                                    className={cn(
                                        "group relative flex items-center py-1 text-[11px] transition-all duration-200",
                                        isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-neutral-500 hover:text-black dark:hover:text-white"
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(item.url.replace(/^#/, ""))?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    {isActive && <div className="absolute -left-3 h-1 w-1 rounded-full bg-blue-500" />}
                                    <span className="line-clamp-2 leading-snug">{item.title}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
