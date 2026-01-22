"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, X } from "lucide-react";

type Props = {
    slug: string;
    title: string;
    backHref: string; // /labs/[slug]
    doc?: React.ReactNode; // ✅ 改为 ReactNode
    children: React.ReactNode; // Lab React
};

export function LabImmersiveAppShell({ slug, title, backHref, doc, children }: Props) {
    const [docOpen, setDocOpen] = useState(false);

    const hasDoc = useMemo(() => doc != null, [doc]);

    const closeDoc = useCallback(() => setDocOpen(false), []);
    const toggleDoc = useCallback(() => setDocOpen((v) => !v), []);

    // ESC 关闭抽屉：只在抽屉打开时监听，尽量不干扰 Lab 自身键盘交互
    useEffect(() => {
        if (!docOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDoc();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [docOpen, closeDoc]);

    return (
        <div className="w-dvw h-dvh overflow-hidden bg-white dark:bg-neutral-950">
            {/* 悬浮 Toolbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="mx-auto w-full px-3 sm:px-4 h-12 flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/75 dark:bg-neutral-950/60 backdrop-blur">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link
                            href={backHref}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            aria-label="Back"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>

                        <div className="min-w-0">
                            <div className="truncate font-semibold text-sm">{title}</div>
                            <div className="truncate text-[11px] font-mono opacity-50">labs/{slug}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasDoc && (
                            <button
                                type="button"
                                onClick={toggleDoc}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            >
                                <FileText className="h-4 w-4" />
                                文档
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 主体：整页 React（为 Toolbar 留出 48px） */}
            <div className="pt-12 w-full h-full">
                <div className="w-full h-full overflow-auto">{children}</div>
            </div>

            {/* 文档抽屉（不占页面流） */}
            {hasDoc && (
                <>
                    {/* 遮罩 */}
                    <div
                        className={[
                            "fixed inset-0 z-50 bg-black/30 transition-opacity",
                            docOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                        ].join(" ")}
                        onClick={closeDoc}
                    />

                    {/* Drawer */}
                    <aside
                        className={[
                            "fixed top-0 right-0 z-[60] h-dvh w-[92vw] sm:w-[520px] border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950",
                            "transform transition-transform",
                            docOpen ? "translate-x-0" : "translate-x-full",
                        ].join(" ")}
                        aria-hidden={!docOpen}
                    >
                        <div className="h-12 flex items-center justify-between px-3 sm:px-4 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="text-sm font-semibold">Documentation</div>
                            <button
                                type="button"
                                onClick={closeDoc}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="h-[calc(100dvh-48px)] overflow-auto p-4 sm:p-6">{doc}</div>
                    </aside>
                </>
            )}
        </div>
    );
}
