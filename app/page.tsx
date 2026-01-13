import Link from "next/link";
import { ArrowRight, BookText, Beaker, Terminal, Sparkles, Github } from "lucide-react";

export default function HomePage() {
    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section - 极致留白与大标题 */}
            <section className="mx-auto max-w-3xl space-y-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>正在构建交互式数字花园</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-transparent dark:from-white dark:to-neutral-400">
                    学习笔记 & 交互实验室
                </h1>
                <p className="mx-auto max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                    沉淀 Obsidian 笔记，探索 React 交互实验。
                    追求视觉的高级感与知识的结构化。
                </p>
            </section>

            {/* Bento Grid Layout */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">

                {/* 1. Notes - 大卡片 (占据 2x2) */}
                <Link
                    href="/notes"
                    className="group relative md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl glass p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
                >
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <BookText className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">知识库 / Notes</h2>
                            <p className="mt-2 max-w-sm text-neutral-600 dark:text-neutral-400">
                                深度学习笔记与思考，涵盖技术、产品与设计。支持 Obsidian 语法与双向链接。
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                            探索笔记库 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                    {/* 装饰背景 */}
                    <div className="absolute -right-8 -bottom-8 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
                </Link>

                {/* 2. Labs - 中卡片 (占据 1x2) */}
                <Link
                    href="/labs"
                    className="group relative md:row-span-2 overflow-hidden rounded-3xl glass p-8 transition-all hover:shadow-2xl hover:shadow-purple-500/10"
                >
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Beaker className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold">实验室 / Labs</h2>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                                React 交互组件、数据可视化与创意 Demo。
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                            进入实验室 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                    <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
                </Link>

                {/* 3. Roadmap - 长卡片 (占据 2x1) */}
                <div className="md:col-span-2 overflow-hidden rounded-3xl glass p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                                <Terminal className="h-4 w-4" />
                                Next Steps
                            </div>
                            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-neutral-400" /> 内容系统接入
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-neutral-400" /> LaTeX 公式支持
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-neutral-400" /> 全局检索优化
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-neutral-400" /> Giscus 评论系统
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 4. Github/About - 小卡片 (占据 1x1) */}
                <Link
                    href="/about"
                    className="group flex flex-col items-center justify-center rounded-3xl glass p-6 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                    <Github className="mb-2 h-8 w-8 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-medium">About Me</span>
                </Link>

            </section>
        </div>
    );
}