"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NoteTree } from "./note-tree";
import { TreeNode } from "../lib/tree";
import { cn } from "../lib/utils";
import { TableOfContents } from "./table-of-contents";

// 定义 TOC 类型，替代 any
type TocItem = {
    title: string;
    url: string;
    depth: number;
};

export function NotesLayoutClient({
    tree = [],
    toc = [],
    children,
}: {
    tree?: TreeNode[];
    toc?: TocItem[]; // 修复：将 any[] 改为具体的 TocItem[]
    children: React.ReactNode;
}) {
    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isTocOpen, setIsTocOpen] = useState(true);

    return (
        <div className="w-full min-h-screen px-4 py-6 md:px-6 transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-6 relative items-start justify-between">

                {/* --- 1. 左侧知识库树 --- */}
                {tree.length > 0 && (
                    <aside
                        className={cn(
                            "hidden md:flex flex-col transition-all duration-500 ease-in-out shrink-0 sticky top-24 self-start border-r border-neutral-100 dark:border-neutral-800",
                            isLeftOpen ? "w-64" : "w-12 items-center"
                        )}
                        style={{ height: 'calc(100vh - 6rem)' }}
                    >
                        <div className={cn(
                            "flex items-center shrink-0 mb-4 transition-all duration-300",
                            isLeftOpen ? "justify-between w-full pl-2 pr-1" : "justify-center w-full px-0"
                        )}>
                            <div className={cn(
                                "overflow-hidden transition-all duration-300",
                                isLeftOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                            )}>
                                <h2 className="font-semibold text-[10px] text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                                    Knowledge
                                </h2>
                            </div>

                            <button
                                onClick={() => setIsLeftOpen(!isLeftOpen)}
                                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                                title={isLeftOpen ? "收起侧边栏" : "展开侧边栏"}
                            >
                                {isLeftOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className={cn(
                            "overflow-y-auto flex-1 custom-scrollbar w-full transition-opacity duration-300",
                            isLeftOpen ? "opacity-100" : "opacity-0 pointer-events-none hidden"
                        )}>
                            <NoteTree tree={tree} />
                        </div>
                    </aside>
                )}

                {/* --- 2. 中间主内容区域 --- */}
                <main className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
                    <div className={cn(
                        "mx-auto transition-all duration-500 ease-in-out",
                        isTocOpen ? "max-w-4xl" : "max-w-6xl"
                    )}>
                        {children}
                    </div>
                </main>

                {/* --- 3. 右侧大纲 --- */}
                {toc.length > 0 && (
                    <aside
                        className={cn(
                            "hidden xl:block shrink-0 sticky top-24 self-start transition-all duration-500 ease-in-out",
                            isTocOpen ? "w-64" : "w-12"
                        )}
                    >
                        <TableOfContents
                            toc={toc}
                            isCollapsed={!isTocOpen}
                            onToggle={() => setIsTocOpen(!isTocOpen)}
                        />
                    </aside>
                )}
            </div>
        </div>
    );
}