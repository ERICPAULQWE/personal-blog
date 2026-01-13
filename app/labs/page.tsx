import Link from "next/link";
import { labs } from "../../labs/_registry";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";

export default function LabsPage() {
    return (
        <div className="space-y-12">
            {/* Header: 充满探索感的标题 */}
            <section className="space-y-4 py-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                    <FlaskConical className="h-3 w-3" />
                    <span>Experimental Playground</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                        Labs
                    </span>
                    <span className="text-neutral-200 dark:text-neutral-800"> / </span>
                    <span className="text-neutral-900 dark:text-white">Experiments</span>
                </h1>
                <p className="mx-auto max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                    这里存放着我的交互实验、UI 组件原型以及一些有趣的 Web 技术探索。
                    <br className="hidden md:block" />
                    它们可能不完美，但一定很有趣。
                </p>
            </section>

            {/* Grid: App Store 风格的卡片流 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {labs.map((lab) => (
                    <Link
                        key={lab.slug}
                        href={`/labs/${lab.slug}`}
                        className="group relative overflow-hidden rounded-[2rem] glass transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                        {/* 卡片上半部分：视觉预览区 */}
                        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
                            {/* 装饰性背景：动态光斑 */}
                            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-colors" />
                            <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl group-hover:bg-blue-500/30 transition-colors" />

                            {/* 居中图标/预览 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="rounded-2xl bg-white/50 p-4 shadow-sm backdrop-blur-md dark:bg-black/20">
                                    <Sparkles className="h-8 w-8 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* 卡片下半部分：信息区 */}
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {lab.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        {lab.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                                Run Experiment <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}