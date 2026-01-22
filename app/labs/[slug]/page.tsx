import { notFound } from "next/navigation";
import { labs } from "../../../labs/_registry";
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

    const isFullScreen = labMeta.fullScreen;

    // --- 全屏沉浸模式修复版 ---
    if (isFullScreen) {
        return (
            /* 1. 使用 fixed inset-0 覆盖全局布局
               2. 使用 overflow-y-auto 开启纵向滚动
               3. 移除 h-screen，改用 min-h-screen 允许内容撑开
            */
            <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-50 dark:bg-black selection:bg-purple-100 dark:selection:bg-purple-900/30">
                {/* 返回按钮改为 fixed，确保页面向下滚动时
                   按钮依然悬浮在视口左上角，方便用户随时退出
                */}
                <div className="fixed left-6 top-6 z-[110]">
                    <Link
                        href="/labs"
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white/70 shadow-lg backdrop-blur-xl transition-all hover:scale-110 hover:border-purple-300 hover:text-purple-600 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-purple-700 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                        <span className="sr-only">Back to Labs</span>
                    </Link>
                </div>

                {/* 内容容器：使用 min-h-screen 确保至少占满一屏 */}
                <div className="relative w-full min-h-screen">
                    <LabStage slug={slug} />
                </div>
            </div>
        );
    }

    // --- 普通模式（非全屏）代码保持不变 ---
    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-20">
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
                                    <span key={tag} className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 rounded-[2.5rem]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="relative flex w-full min-h-[500px] items-center justify-center p-8 md:p-12">
                    <div className="w-full max-w-full overflow-auto flex justify-center">
                        <LabStage slug={slug} />
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/20 flex items-center px-4 justify-between">
                    <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400/50" />
                        <div className="h-2 w-2 rounded-full bg-green-400/50" />
                    </div>
                    <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Interactive Mode</div>
                </div>
            </div>

            {labDoc && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Documentation</span>
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