"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TreeNode } from "../lib/tree";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

function TreeNodeItem({ node, level }: { node: TreeNode; level: number }) {
    const pathname = usePathname();
    const isActive = pathname === `/notes/${node.slug}`;
    // 默认展开所有文件夹，或者你可以根据 isActive 状态来决定
    const [isOpen, setIsOpen] = useState(true);

    if (node.type === "file") {
        return (
            <Link
                href={`/notes/${node.slug}`}
                className={cn(
                    "flex items-center gap-2 py-1 px-2 text-sm rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    isActive ? "bg-neutral-100 dark:bg-neutral-800 font-medium text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <FileIcon className="w-3.5 h-3.5" />
                <span className="truncate">{node.name}</span>
            </Link>
        );
    }

    return (
        <div>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 py-1 px-2 text-sm text-neutral-900 dark:text-neutral-100 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-md"
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {isOpen ? <FolderOpenIcon className="w-3.5 h-3.5 text-blue-500" /> : <FolderIcon className="w-3.5 h-3.5 text-blue-500" />}
                <span className="font-medium">{node.name}</span>
            </div>
            {isOpen && (
                <div className="border-l border-neutral-200 dark:border-neutral-800 ml-4">
                    {node.children.map((child) => (
                        <TreeNodeItem key={child.slug} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function NoteTree({ tree }: { tree: TreeNode[] }) {
    return (
        <nav className="space-y-0.5">
            {tree.map((node) => (
                <TreeNodeItem key={node.slug} node={node} level={0} />
            ))}
        </nav>
    );
}