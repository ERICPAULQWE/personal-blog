"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
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

    useEffect(() => {
        if (items.length === 0) return;

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

        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    return (
        <div className={cn(
            "glass rounded-[2rem] p-3 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden transition-all duration-500 flex flex-col",
            isCollapsed ? "h-12 w-12" : "h-auto max-h-[70vh] w-64"
        )}>
            {/* 顶部控制栏 - 添加 shrink-0 防止被压缩 */}
            <div className={cn(
                "flex items-center justify-between transition-all shrink-0",
                !isCollapsed && "mb-4 px-2"
            )}>
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
            <div className={cn(
                "transition-all duration-500 custom-scrollbar overflow-y-auto",
                isCollapsed ? "opacity-0 h-0 pointer-events-none" : "opacity-100 flex-1 min-h-0"
            )}>
                <ul className="space-y-1.5 px-2 pb-2">
                    {items.map((item) => {
                        const isActive = activeId === item.url.replace(/^#/, "");
                        return (
                            <li
                                key={item.url}
                                style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 0.75}rem` }}
                            >
                                <a
                                    href={item.url}
                                    className={cn(
                                        "group relative flex items-center py-1 text-[11px] transition-all duration-200",
                                        isActive
                                            ? "text-blue-600 dark:text-blue-400 font-bold"
                                            : "text-neutral-500 hover:text-black dark:hover:text-white"
                                    )}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(item.url.replace(/^#/, ""))?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                >
                                    {isActive && (
                                        <div className="absolute -left-3 h-1 w-1 rounded-full bg-blue-500" />
                                    )}
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