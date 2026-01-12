"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NoteTree } from "./note-tree";
import { TreeNode } from "../lib/tree";
import { cn } from "../lib/utils";

export function NotesLayoutClient({
    tree,
    children,
}: {
    tree: TreeNode[];
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8 relative">
                {/* 侧边栏 */}
                <aside
                    className={cn(
                        "hidden md:block border-r border-neutral-200 dark:border-neutral-800 pr-4 transition-all duration-300 ease-in-out shrink-0",
                        isOpen
                            ? "w-64 opacity-100"
                            : "w-0 opacity-0 overflow-hidden border-none pr-0"
                    )}
                >
                    <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-100px)]">
                        <h2 className="font-semibold mb-4 px-2 text-sm text-neutral-500 uppercase tracking-wider">
                            Knowledge Base
                        </h2>
                        <NoteTree tree={tree} />
                    </div>
                </aside>

                {/* 主内容区域 */}
                <main className="flex-1 min-w-0 transition-all duration-300">
                    {/* 开关按钮 */}
                    <div className="mb-4">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="hidden md:flex items-center gap-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                            title={isOpen ? "收起侧边栏" : "展开侧边栏"}
                        >
                            {isOpen ? (
                                <PanelLeftClose className="w-5 h-5" />
                            ) : (
                                <PanelLeftOpen className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}