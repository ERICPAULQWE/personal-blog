"use client";

import { useState } from "react";
import { TreeNode } from "@/lib/tree";
import {
    FileIcon,
    FolderIcon,
    FolderOpenIcon,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectedNode =
    | { type: "file"; slug: string }
    | { type: "dir"; slug: string };

function NodeItem({
    node,
    level,
    selected,
    onSelect,
}: {
    node: TreeNode;
    level: number;
    selected?: SelectedNode;
    onSelect: (sel: SelectedNode) => void;
}) {
    const [isOpen, setIsOpen] = useState(true);

    const isSelected =
        !!selected && selected.type === node.type && selected.slug === node.slug;

    if (node.type === "file") {
        return (
            <button
                type="button"
                onClick={() => onSelect({ type: "file", slug: node.slug })}
                className={cn(
                    "w-full text-left flex items-center gap-2 py-1 px-2 text-sm rounded-md transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    isSelected
                        ? "bg-neutral-100 dark:bg-neutral-800 font-medium text-black dark:text-white"
                        : "text-neutral-600 dark:text-neutral-400"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <FileIcon className="w-3.5 h-3.5" />
                <span className="truncate flex-1">{node.name}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4" />}
            </button>
        );
    }

    // dir node
    return (
        <div>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 py-1 px-2 text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-md",
                    "text-neutral-900 dark:text-neutral-100"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                title="点击展开/折叠；点右侧“选择”来选中文件夹"
            >
                {isOpen ? (
                    <FolderOpenIcon className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                    <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                )}

                <span className="font-medium truncate">{node.name}</span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // 防止触发展开/折叠
                        onSelect({ type: "dir", slug: node.slug });
                    }}
                    className={cn(
                        "ml-auto text-[11px] px-2 py-1 rounded-md border",
                        "border-neutral-200 dark:border-neutral-800",
                        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        isSelected
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            : "text-neutral-600 dark:text-neutral-400"
                    )}
                >
                    {isSelected ? (
                        <span className="inline-flex items-center gap-1">
                            已选 <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                    ) : (
                        "选择"
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="border-l border-neutral-200 dark:border-neutral-800 ml-4">
                    {node.children.map((child) => (
                        <NodeItem
                            key={`${child.type}:${child.slug}`}
                            node={child}
                            level={level + 1}
                            selected={selected}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function SelectableNoteTree({
    tree,
    selected,
    onSelect,
}: {
    tree: TreeNode[];
    selected?: SelectedNode;
    onSelect: (sel: SelectedNode) => void;
}) {
    return (
        <nav className="space-y-0.5">
            {tree.map((node) => (
                <NodeItem
                    key={`${node.type}:${node.slug}`}
                    node={node}
                    level={0}
                    selected={selected}
                    onSelect={onSelect}
                />
            ))}
        </nav>
    );
}
