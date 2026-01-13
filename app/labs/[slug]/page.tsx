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

    // 获取全屏配置
    const isFullScreen = labMeta.fullScreen;

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

            {/* 2. 交互舞台 (The Stage) - 核心修改区域 */}
            <div
                className={`
                    relative overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100
                    border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50
                    ${isFullScreen
                        ? "rounded-2xl h-[85vh] w-full" // 全屏模式：增加高度，保留微圆角，移除多余装饰
                        : "rounded-[2.5rem]"            // 普通模式：大圆角，适应小组件
                    }
                `}
            >
                {/* 背景装饰：仅在非全屏模式下显示网格，避免干扰复杂应用 */}
                {!isFullScreen && (
                    <>
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#ffffff00,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_50%,#00000000,transparent)]" />
                    </>
                )}

                {/* 组件容器：全屏模式下去除内边距 (p-0) */}
                <div
                    className={`
                        relative flex w-full items-center justify-center
                        ${isFullScreen
                            ? "h-full p-0"                  // 全屏模式：填满容器，无边距
                            : "min-h-[500px] p-8 md:p-12"   // 普通模式：有舒适的边距
                        }
                    `}
                >
                    {/* 传递 isFullScreen 给 Stage，如果你的组件需要知道自己是否全屏 */}
                    <div className={isFullScreen ? "w-full h-full" : "w-full max-w-full overflow-auto flex justify-center"}>
                        <LabStage slug={slug} />
                    </div>
                </div>

                {/* 底部装饰栏：仅在非全屏模式下显示 (全屏模式下通常需要最大化显示区域) */}
                {!isFullScreen && (
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
                )}
            </div>

            {/* 3. 实验文档 (如果有对应的 Markdown 文件) */}
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