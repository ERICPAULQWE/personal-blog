"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    PanelLeftOpen,
    PanelLeftClose,
    PanelRightOpen,
    PanelRightClose,
} from "lucide-react";
import { NoteTree } from "./note-tree";
import { TableOfContents } from "./table-of-contents";
import { TreeNode } from "../lib/tree";
import { cn } from "../lib/utils";

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
    toc?: TocItem[];
    children: React.ReactNode;
}) {
    // ✅ 两侧都默认折叠（悬浮抽屉如果默认展开会覆盖内容，一般体验更差）
    const [isLeftOpen, setIsLeftOpen] = useState(false);
    const [isTocOpen, setIsTocOpen] = useState(false);

    const openLeft = useCallback(() => setIsLeftOpen(true), []);
    const closeLeft = useCallback(() => setIsLeftOpen(false), []);
    const openToc = useCallback(() => setIsTocOpen(true), []);
    const closeToc = useCallback(() => setIsTocOpen(false), []);

    const closeAll = useCallback(() => {
        setIsLeftOpen(false);
        setIsTocOpen(false);
    }, []);

    // ESC 关闭任一抽屉（轻量，不做滚动监听）
    useEffect(() => {
        if (!isLeftOpen && !isTocOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeAll();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isLeftOpen, isTocOpen, closeAll]);

    const hasTree = tree.length > 0;
    const hasToc = toc.length > 0;

    // 只要任一抽屉打开，就显示 backdrop
    const backdropVisible = useMemo(() => hasTree || hasToc, [hasTree, hasToc]);
    const anyDrawerOpen = isLeftOpen || isTocOpen;

    return (
        <div className="relative min-h-screen">
            {/* 左侧打开按钮（抽屉关闭时才显示） */}
            {hasTree && !isLeftOpen ? (
                <div className="fixed left-4 top-28 z-50 flex flex-col items-center gap-1">
                    {/* 左侧展开按钮：文件树（胶囊） */}
                    {hasTree && !isLeftOpen ? (
                        <button
                            type="button"
                            onClick={openLeft}
                            className={cn(
                                "glass fixed left-4 top-28 z-50",
                                "h-10 px-3 rounded-2xl",
                                "border border-neutral-200/60 dark:border-neutral-800/60",
                                "flex items-center gap-2",
                                "text-sm font-medium text-neutral-700 dark:text-neutral-200",
                                "hover:bg-white/70 dark:hover:bg-neutral-800/60 transition",
                                "shadow-sm"
                            )}
                            aria-label="Open file tree"
                            title="文件树"
                        >
                            <PanelLeftOpen className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            <span className="leading-none">文件树</span>
                        </button>
                    ) : null}
                </div>
            ) : null}

            {/* 右侧打开按钮（抽屉关闭时才显示） */}
            {/* 右侧展开按钮：目录（胶囊） */}
            {hasToc && !isTocOpen ? (
                <button
                    type="button"
                    onClick={openToc}
                    className={cn(
                        "glass fixed right-4 top-28 z-50",
                        "h-10 px-3 rounded-2xl",
                        "border border-neutral-200/60 dark:border-neutral-800/60",
                        "flex items-center gap-2",
                        "text-sm font-medium text-neutral-700 dark:text-neutral-200",
                        "hover:bg-white/70 dark:hover:bg-neutral-800/60 transition",
                        "shadow-sm"
                    )}
                    aria-label="Open table of contents"
                    title="目录"
                >
                    <span className="leading-none">目录</span>
                    <PanelRightOpen className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                </button>
            ) : null}


            {/* Backdrop：任一抽屉打开则显示，点击关闭全部 */}
            {backdropVisible ? (
                <div
                    className={cn(
                        "fixed inset-0 z-40 transition-opacity duration-200",
                        anyDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                    aria-hidden={!anyDrawerOpen}
                >
                    <div
                        className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[2px]"
                        onClick={closeAll}
                    />
                </div>
            ) : null}

            {/* 左侧抽屉：Notes Tree */}
            {hasTree ? (
                <aside
                    className={cn(
                        "fixed left-0 top-0 z-50 h-screen w-[320px] max-w-[85vw]",
                        "transition-transform duration-300 ease-out will-change-transform",
                        isLeftOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                    aria-hidden={!isLeftOpen}
                >
                    <div className="h-full px-4 pt-24 pb-6">
                        <div
                            className={cn(
                                "glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm",
                                "h-[calc(100vh-6rem)]"
                            )}
                        >
                            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                                <h2 className="font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                                    Knowledge
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeLeft}
                                    className={cn(
                                        "h-9 w-9 rounded-2xl",
                                        "border border-neutral-200/60 dark:border-neutral-800/60",
                                        "flex items-center justify-center",
                                        "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                                        "hover:bg-white/60 dark:hover:bg-neutral-800/50 transition"
                                    )}
                                    aria-label="Close notes navigation"
                                    title="Close navigation"
                                >
                                    <PanelLeftClose className="h-4 w-4" />
                                </button>
                            </div>

                            {/* 性能：仅打开时渲染 */}
                            {isLeftOpen ? (
                                <div className="h-[calc(100%-56px)] overflow-y-auto custom-scrollbar px-3 pb-4">
                                    <NoteTree tree={tree} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </aside>
            ) : null}

            {/* 右侧抽屉：TOC */}
            {hasToc ? (
                <aside
                    className={cn(
                        "fixed right-0 top-0 z-50 h-screen w-[320px] max-w-[85vw]",
                        "transition-transform duration-300 ease-out will-change-transform",
                        isTocOpen ? "translate-x-0" : "translate-x-full"
                    )}
                    aria-hidden={!isTocOpen}
                >
                    <div className="h-full px-4 pt-24 pb-6">
                        <div
                            className={cn(
                                "glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm",
                                "h-[calc(100vh-6rem)]"
                            )}
                        >
                            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                                <h2 className="font-semibold text-[10px] text-neutral-400 uppercase tracking-widest">
                                    Contents
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeToc}
                                    className={cn(
                                        "h-9 w-9 rounded-2xl",
                                        "border border-neutral-200/60 dark:border-neutral-800/60",
                                        "flex items-center justify-center",
                                        "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                                        "hover:bg-white/60 dark:hover:bg-neutral-800/50 transition"
                                    )}
                                    aria-label="Close table of contents"
                                    title="Close TOC"
                                >
                                    <PanelRightClose className="h-4 w-4" />
                                </button>
                            </div>

                            {/* 性能：仅打开时渲染 */}
                            {isTocOpen ? (
                                <div className="h-[calc(100%-56px)] overflow-y-auto custom-scrollbar px-3 pb-4">
                                    {/* 这里复用你现有 TOC 组件；overlay 模式下不需要“collapsed”，直接传 false */}
                                    <TableOfContents toc={toc} isCollapsed={false} onToggle={closeToc} />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </aside>
            ) : null}

            {/* 主内容：永远不为两侧抽屉让位 => 永远不被压缩 */}
            <div className="w-full px-4 py-6 md:px-6">
                {children}
            </div>
        </div>
    );
}
