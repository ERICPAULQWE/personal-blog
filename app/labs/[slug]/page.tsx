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
                {/* ✅ 全屏：更贴边但不误触 + 更精致动画曲线
                   - 默认显示：更窄竖条“返回”
                   - hover 热区触发：竖条消失，圆形按钮弹出
                */}
                <div className="fixed left-0 top-0 z-[110]">
                    {/* group 容器只负责 hover 状态 */}
                    <div className="group relative h-[104px] w-[64px] pointer-events-none">
                        {/* 透明 hover 热区：只占左上角小区域，不是 Link，避免误触返回 */}
                        <div
                            className="pointer-events-auto absolute left-0 top-4 h-[88px] w-[56px] bg-transparent"
                            aria-hidden="true"
                        />

                        {/* 竖向窄条：默认常驻；hover 时淡出并禁用点击 */}
                        <Link
                            href="/labs"
                            className="
                                pointer-events-auto
                                absolute left-0 top-6
                                h-16 w-5
                                rounded-r-2xl
                                border border-neutral-200/70 dark:border-neutral-800/70
                                bg-white/70 dark:bg-neutral-900/60
                                backdrop-blur-xl
                                shadow-[0_6px_24px_rgba(0,0,0,0.08)]
                                flex items-center justify-center
                                text-[11px] font-semibold tracking-widest
                                text-neutral-600 dark:text-neutral-200
                                hover:bg-white/85 dark:hover:bg-neutral-900/75
                                select-none

                                opacity-100 translate-x-0 scale-100
                                transition-[opacity,transform,background-color,border-color]
                                duration-220
                                ease-[cubic-bezier(.2,.9,.2,1)]

                                group-hover:opacity-0
                                group-hover:translate-x-[-6px]
                                group-hover:scale-[0.98]
                                group-hover:pointer-events-none
                            "
                            aria-label="Back to Labs"
                            title="返回"
                        >
                            <span className="[writing-mode:vertical-rl] [text-orientation:upright]">
                                返回
                            </span>
                        </Link>

                        {/* 圆形按钮：默认隐藏；hover 时弹出；出现时竖条消失（上面已处理） */}
                        <Link
                            href="/labs"
                            className="
                                pointer-events-auto
                                absolute left-3 top-6
                                flex h-12 w-12 items-center justify-center rounded-full
                                border border-neutral-200/80 dark:border-neutral-800/80
                                bg-white/72 dark:bg-neutral-900/70
                                backdrop-blur-xl
                                shadow-[0_12px_40px_rgba(0,0,0,0.12)]

                                opacity-0 translate-x-[-12px] scale-[0.985]
                                pointer-events-none

                                group-hover:opacity-100
                                group-hover:translate-x-0
                                group-hover:scale-100
                                group-hover:pointer-events-auto

                                transition-[opacity,transform,box-shadow,border-color,color,background-color]
                                duration-240
                                ease-[cubic-bezier(.2,.9,.2,1)]
                                delay-60

                                hover:scale-[1.08]
                                hover:border-purple-300 hover:text-purple-600
                                dark:hover:border-purple-700 dark:hover:text-purple-400
                            "
                        >
                            <ArrowLeft className="h-6 w-6 transition-transform duration-240 ease-[cubic-bezier(.2,.9,.2,1)] group-hover:-translate-x-1" />
                            <span className="sr-only">Back to Labs</span>
                        </Link>
                    </div>
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
                    <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
                        Interactive Mode
                    </div>
                </div>
            </div>

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