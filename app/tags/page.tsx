import Link from "next/link";
// 修复：使用 @/lib/content 替代 ../../lib/content，避免相对路径错误
import { getAllTags } from "@/lib/content";
import { Hash, Sparkles, ArrowRight, Layers } from "lucide-react";

export default function TagsPage() {
    const tags = getAllTags();

    // 简单的排序逻辑：按数量倒序
    const sortedTags = [...tags].sort((a, b) => b.count - a.count);

    // 提取前 5 个作为热门标签，其余作为普通标签
    const featuredTags = sortedTags.slice(0, 5);
    const otherTags = sortedTags.slice(5);

    // 预设一些好看的渐变色，轮流分配给热门标签
    const gradients = [
        "from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-300",
        "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-300",
        "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-300",
        "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300",
        "from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-300",
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header: 索引页头部 */}
            <section className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Layers className="h-3 w-3 text-blue-500" />
                    <span>Topic Index</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    探索与索引
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                    通过话题标签快速定位笔记。这里汇集了 {tags.length} 个不同维度的知识节点。
                </p>
            </section>

            {/* Featured Tags - Bento Grid: 热门标签网格 */}
            {featuredTags.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        热门话题
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[140px]">
                        {featuredTags.map((t, i) => {
                            // 让前两个卡片占据更大空间 (col-span-3)
                            const isLarge = i === 0 || i === 1;
                            const gradient = gradients[i % gradients.length];

                            return (
                                <Link
                                    key={t.tag}
                                    href={`/tags/${encodeURIComponent(t.tag)}`}
                                    className={`
                    group relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-white/50 dark:border-neutral-800/50 dark:bg-neutral-900/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-xl
                    ${isLarge ? "lg:col-span-3 md:col-span-1" : "lg:col-span-2 md:col-span-1"}
                  `}
                                >
                                    {/* 动态渐变背景 */}
                                    <div className={`absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 ${gradient}`} />

                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start">
                                            <Hash className="h-6 w-6 opacity-50" />
                                            <span className="text-xs font-mono opacity-60 bg-white/30 dark:bg-black/20 px-2 py-1 rounded-full">
                                                {t.count} posts
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight">{t.tag}</h3>
                                            <div className="flex items-center gap-1 text-xs font-medium mt-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                                                Explore <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All Tags - 胶囊列表 */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    <Hash className="h-4 w-4 text-neutral-500" />
                    完整索引
                </div>

                <div className="flex flex-wrap gap-3">
                    {otherTags.length > 0 || featuredTags.length === 0 ? (
                        // 如果没有热门标签，就显示所有标签；否则显示剩余标签
                        (featuredTags.length === 0 ? sortedTags : otherTags).map((t) => (
                            <Link
                                key={t.tag}
                                href={`/tags/${encodeURIComponent(t.tag)}`}
                                className="group flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:border-blue-500/50 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-blue-500/50"
                            >
                                <span className="text-neutral-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {t.tag}
                                </span>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] text-neutral-500 dark:bg-neutral-800">
                                    {t.count}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-sm text-neutral-400 italic">没有更多标签了...</p>
                    )}
                </div>
            </section>
        </div>
    );
}