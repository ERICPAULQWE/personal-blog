"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, List } from "lucide-react"; // 删除了 ChevronLeft

interface TocItem {
    title: string;
    url: string;
    depth: number;
}

interface TableOfContentsProps {
    toc: TocItem[];
}

export function TableOfContents({ toc = [] }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 修复警告：使用 useMemo 缓存 items，虽然 toc 本身变化时 items 也会变，
    // 但这样符合 ESLint 规范，明确了依赖关系
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
            if (!item.url) return;
            const id = item.url.replace(/^#/, "");
            if (!id) return;
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]); // 这里的依赖现在是安全的

    if (items.length === 0) return null;

    return (
        <nav
            className={cn(
                "sticky top-24 max-h-[80vh] flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-10" : "w-64"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mb-4 p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors self-end"
                title={isCollapsed ? "展开目录" : "折叠目录"}
            >
                {isCollapsed ? <List size={20} /> : <ChevronRight size={20} />}
            </button>

            <div
                className={cn(
                    "overflow-y-auto w-full custom-scrollbar transition-opacity duration-300",
                    isCollapsed ? "opacity-0 pointer-events-none h-0" : "opacity-100 h-auto"
                )}
            >
                {!isCollapsed && (
                    <>
                        <p className="font-medium text-lg mb-4 px-1">大纲</p>
                        <ul className="space-y-2 text-sm pb-4">
                            {items.map((item) => (
                                <li
                                    key={item.url}
                                    style={{ paddingLeft: `${Math.max(0, item.depth - 2) * 1}rem` }}
                                >
                                    <a
                                        href={item.url}
                                        className={cn(
                                            "block transition-colors hover:text-foreground line-clamp-1 py-1",
                                            activeId === item.url.replace(/^#/, "")
                                                ? "text-foreground font-medium border-l-2 border-primary pl-2 -ml-2"
                                                : "text-muted-foreground"
                                        )}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const targetId = item.url.replace(/^#/, "");
                                            const element = document.getElementById(targetId);
                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                setActiveId(targetId);
                                            }
                                        }}
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </nav>
    );
}