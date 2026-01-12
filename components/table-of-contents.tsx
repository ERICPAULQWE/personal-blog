"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, List } from "lucide-react";

interface TocItem {
    title: string;
    url: string;
    depth: number;
}

interface TableOfContentsProps {
    toc: TocItem[];
}

export function TableOfContents({ toc = [] }: TableOfContentsProps) {
    const items = toc || [];
    const [activeId, setActiveId] = useState<string>("");
    const [isCollapsed, setIsCollapsed] = useState(false);

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
    }, [items]);

    if (items.length === 0) return null;

    return (
        // 关键修改：sticky 必须加在最外层这个 nav 上
        // 同时也在这里控制宽度 transition
        <nav
            className={cn(
                // Sticky 定位核心：
                "sticky top-24", // 距离顶部 24px 固定
                "max-h-[80vh]",  // 限制高度
                "flex flex-col", //以此布局内部元素

                // 宽度和动画：
                "transition-all duration-300 ease-in-out",
                isCollapsed ? "w-10" : "w-64"
            )}
        >
            {/* 折叠/展开 按钮 */}
            {/* self-end 让按钮靠右对齐 */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mb-4 p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors self-end"
                title={isCollapsed ? "展开目录" : "折叠目录"}
            >
                {isCollapsed ? <List size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* 目录列表容器 */}
            <div
                className={cn(
                    "overflow-y-auto w-full custom-scrollbar transition-opacity duration-300",
                    // 折叠时：隐藏内容、高度归零
                    isCollapsed ? "opacity-0 pointer-events-none h-0" : "opacity-100 h-auto"
                )}
            >
                {!isCollapsed && (
                    <>
                        <p className="font-medium text-lg mb-4 px-1">大纲</p>
                        <ul className="space-y-2 text-sm pb-4"> {/* pb-4 增加底部留白 */}
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