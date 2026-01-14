"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { cn } from "../lib/utils";
import type { TreeNode } from "../lib/tree";

/**
 * 判断当前 node（folder）子树是否包含 activeSlug
 */
function subtreeHasSlug(node: TreeNode, activeSlug: string): boolean {
    if (!activeSlug) return false;
    if (node.type === "file") return node.slug === activeSlug;
    return node.children?.some((c) => subtreeHasSlug(c, activeSlug)) ?? false;
}

/**
 * 从 pathname 解析当前 slug
 * 支持 /notes/xxx/yyy
 */
function getActiveSlug(pathname: string | null): string {
    if (!pathname) return "";
    if (!pathname.startsWith("/notes/")) return "";
    // decode 让中文/空格 slug 不出问题
    return decodeURIComponent(pathname.replace(/^\/notes\//, ""));
}

function TreeNodeItem({
    node,
    level,
    activeSlug,
    autoScrollActive,
}: {
    node: TreeNode;
    level: number;
    activeSlug: string;
    autoScrollActive: boolean;
}) {
    const isActive = node.type === "file" && node.slug === activeSlug;

    // ✅ 文件夹默认：只展开“包含当前 active 文件”的那条路径
    // 这样打开阅读页时能直接看到当前位置，不会把所有目录全展开导致很长
    const defaultOpen = node.type === "folder" ? subtreeHasSlug(node, activeSlug) : false;
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // 当路由变化（activeSlug 变化）时，同步更新 folder 的 open 状态
    useEffect(() => {
        if (node.type !== "folder") return;
        setIsOpen(subtreeHasSlug(node, activeSlug));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSlug]);

    // ✅ 可选：让 active 文件项出现在可视范围（不会强制居中，避免跳）
    useEffect(() => {
        if (!autoScrollActive) return;
        if (!isActive) return;
        const el = document.querySelector(`[data-note-slug="${CSS.escape(node.slug)}"]`) as HTMLElement | null;
        el?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [autoScrollActive, isActive, node.slug]);

    if (node.type === "file") {
        return (
            <Link
                href={`/notes/${node.slug}`}
                data-note-slug={node.slug}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                    "flex items-center gap-2 py-1.5 px-2 text-sm rounded-xl transition-colors",
                    "hover:bg-white/60 dark:hover:bg-neutral-800/50",
                    isActive
                        ? cn(
                            // ✅ 蓝色高亮（玻璃态）
                            "bg-gradient-to-r from-blue-500/15 to-cyan-500/10",
                            "border border-blue-500/20",
                            "text-blue-700 dark:text-blue-300",
                            "shadow-sm"
                        )
                        : "text-neutral-600 dark:text-neutral-300"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <FileIcon className={cn("w-3.5 h-3.5", isActive ? "text-blue-500" : "text-neutral-400")} />
                <span className={cn("truncate", isActive ? "font-semibold" : "font-medium")}>{node.name}</span>
            </Link>
        );
    }

    // folder
    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={cn(
                    "w-full flex items-center gap-2 py-1.5 px-2 text-sm rounded-xl transition-colors text-left",
                    "text-neutral-900 dark:text-neutral-100",
                    "hover:bg-white/50 dark:hover:bg-neutral-900/40"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <FolderOpenIcon className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                    <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span className="font-semibold truncate">{node.name}</span>
            </button>

            {isOpen ? (
                <div className="ml-4 mt-1 border-l border-neutral-200/70 dark:border-neutral-800/70 pl-2 space-y-0.5">
                    {node.children?.map((child) => (
                        <TreeNodeItem
                            key={child.slug}
                            node={child}
                            level={level + 1}
                            activeSlug={activeSlug}
                            autoScrollActive={autoScrollActive}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function NoteTree({ tree }: { tree: TreeNode[] }) {
    const pathname = usePathname();

    const activeSlug = useMemo(() => getActiveSlug(pathname), [pathname]);

    // ✅ 只在首次进入页面时做一次“滚到 active 附近”，避免每次切换目录都跳
    const [autoScrollActive] = useState(true);

    return (
        <nav className="space-y-0.5">
            {tree.map((node) => (
                <TreeNodeItem
                    key={node.slug}
                    node={node}
                    level={0}
                    activeSlug={activeSlug}
                    autoScrollActive={autoScrollActive}
                />
            ))}
        </nav>
    );
}
