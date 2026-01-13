import { notFound } from "next/navigation";
import { labs } from "../../../labs/_registry";
import { ArrowLeft, RefreshCcw } from "lucide-react";
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
    const lab = labs.find((l) => l.slug === slug);

    if (!lab) return notFound();

    const Component = lab.component;

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-20">
            {/* 顶部导航与标题 */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/labs"
                        className="group flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white transition-all hover:border-purple-200 hover:text-purple-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-purple-800 dark:hover:text-purple-400"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{lab.title}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Interactive Preview
                        </p>
                    </div>
                </div>
            </div>

            {/* 核心交互舞台 (Stage) */}
            <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
                {/* 舞台背景装饰：精细网格 */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* 舞台内容容器：居中显示 Lab 组件 */}
                <div className="relative flex min-h-[500px] w-full items-center justify-center p-8 md:p-12">
                    <React.Suspense
                        fallback={
                            <div className="flex flex-col items-center gap-2 text-neutral-400 animate-pulse">
                                <RefreshCcw className="h-6 w-6 animate-spin" />
                                <span className="text-xs font-mono">Loading experiment...</span>
                            </div>
                        }
                    >
                        <div className="w-full max-w-full overflow-auto flex justify-center">
                            <Component />
                        </div>
                    </React.Suspense>
                </div>

                {/* 底部控制栏装饰 (模拟 MacOS 窗口底栏) */}
                <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/20 flex items-center px-4">
                    <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400/50" />
                        <div className="h-2 w-2 rounded-full bg-green-400/50" />
                    </div>
                </div>
            </div>

            {/* Lab 详细描述 */}
            <div className="rounded-3xl glass p-8">
                <h2 className="text-lg font-semibold mb-4">关于这个实验</h2>
                <p className="prose-base text-neutral-600 dark:text-neutral-300">
                    {lab.description}
                </p>
            </div>
        </div>
    );
}