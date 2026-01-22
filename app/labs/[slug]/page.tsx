import { notFound } from "next/navigation";
import { labs } from "@/labs/_registry";
import { getLabDoc } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { LabStage } from "@/components/lab-stage";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export function generateStaticParams() {
    return labs.map((lab) => ({
        slug: lab.slug,
    }));
}

export default async function LabPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const labMeta = labs.find((l) => l.slug === slug);
    const labDoc = getLabDoc(slug);

    if (!labMeta) return notFound();

    // 获取全屏配置
    const isFullScreen = labMeta.fullScreen;

    // --- 核心修改：如果是全屏模式，直接返回全屏覆盖层 ---
    if (isFullScreen) {
        return (
            // 使用 fixed inset-0 和 z-[100] 覆盖 Layout 中的 Header 和 Padding
            <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col bg-neutral-50 dark:bg-black">
                {/* 悬浮返回按钮：位于左上角 */}
                <div className="absolute left-4 top-4 z-50">
                    <Link
                        href="/labs"
                        className="group flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/80 shadow-sm backdrop-blur-md transition-all hover:border-purple-200 hover:text-purple-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-purple-800 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        <span className="sr-only">Back to Labs</span>
                    </Link>
                </div>

                {/* 舞台区域：无内边距，完全占满屏幕 */}
                <div className="h-full w-full overflow-hidden">
                    <LabStage slug={slug} />
                </div>
            </div>
        );
    }

    // --- 普通模式：保留原有布局（标题、边距、文档等） ---
    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-20">
            {/* 1. 顶部导航与标题 (始终显示，保证导航安全性) */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <Link
                        href="/labs"
                        className="group flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white transition-all hover:border-purple-200 hover:text-purple-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-purple-800 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{labMeta.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <span>{labMeta.date}</span>
                            <span>•</span>
                            <div className="flex gap-1">
                                {labMeta.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 交互舞台 (The Stage) */}
            <div
                className={`
                    relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100
                    border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50
                    rounded-[2.5rem]
                `}
            >
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#ffffff00,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_50%,#00000000,transparent)]" />

                {/* 组件容器 */}
                <div className="relative flex w-full min-h-[500px] items-center justify-center p-8 md:p-12">
                    <div className="w-full max-w-full overflow-auto flex justify-center">
                        <LabStage slug={slug} />
                    </div>
                </div>

                {/* 底部装饰栏 */}
                <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/20 flex items-center px-4 justify-between">
                    <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400/50" />
                        <div className="h-2 w-2 rounded-full bg-green-400/50" />
                    </div>
                    <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
                        Interactive Mode
                    </div>
                </div>
            </div>

            {/* 3. 实验文档 */}
            {labDoc && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                            Documentation
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />
                    </div>

                    <div className="rounded-3xl border border-neutral-100 bg-white p-8 md:p-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/30">
                        <Markdown source={labDoc.content} />
                    </div>
                </section>
            )}
        </div>
    );
}