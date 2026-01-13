import Link from "next/link";
import { groupNotesByMonth } from "@/lib/content"; // 使用 @ 别名防止路径错误
import { Archive, ArrowUpRight, Clock } from "lucide-react";

export default function ArchivePage() {
    const groups = groupNotesByMonth();

    return (
        <div className="space-y-12 pb-20">
            {/* Header: 极简头部 */}
            <section className="text-center space-y-4 py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span>Time Machine</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    归档
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
                    按照时间轴回顾所有的思考与记录。
                </p>
            </section>

            {/* Timeline Container */}
            <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 md:ml-10 space-y-16">

                {groups.length > 0 ? (
                    groups.map(([ym, notes]) => (
                        <div key={ym} className="relative pl-8 md:pl-12">
                            {/* Timeline Node (时间轴节点) */}
                            <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-black" />

                            {/* Month Header (月份标题) */}
                            <div className="flex items-end gap-3 mb-6">
                                <h2 className="text-3xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                                    {ym}
                                </h2>
                                <span className="text-sm font-medium text-neutral-400 mb-1.5">
                                    {notes.length} 篇
                                </span>
                            </div>

                            {/* Notes List (笔记卡片流) */}
                            <div className="space-y-3">
                                {notes.map((n) => {
                                    // 提取日期的 "日" 部分 (假设格式 YYYY-MM-DD)
                                    const day = n.frontmatter.date.split("-")[2] || "01";

                                    return (
                                        <Link
                                            key={n.slug}
                                            href={`/notes/${n.slug}`}
                                            className="group block relative overflow-hidden rounded-2xl border border-transparent bg-white/50 hover:bg-white hover:border-neutral-200 hover:shadow-lg dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:hover:border-neutral-800 dark:hover:shadow-neutral-900/50 transition-all duration-300 p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 md:gap-6">
                                                    {/* Date Badge: 日历撕页风格 */}
                                                    <div className="flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                                        <span className="text-[10px] opacity-70 uppercase leading-none mb-0.5">Day</span>
                                                        <span className="font-bold text-lg leading-none">{day}</span>
                                                    </div>

                                                    {/* Title & Desc */}
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {n.frontmatter.title}
                                                        </h3>
                                                        {n.frontmatter.description && (
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 hidden sm:block">
                                                                {n.frontmatter.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Arrow Icon */}
                                                <ArrowUpRight className="h-5 w-5 text-neutral-300 group-hover:text-blue-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400 pl-8">
                        <Archive className="h-12 w-12 mb-4 opacity-20" />
                        <p>暂无历史归档</p>
                    </div>
                )}
            </div>
        </div>
    );
}