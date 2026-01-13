import Link from "next/link";
import { getAllNotes } from "@/lib/content"; // 使用 @ 别名
import { buildFileTree } from "@/lib/tree";   // 引入构建树的方法
import { NotesLayoutClient } from "@/components/notes-layout-client"; // 引入布局组件
import { Calendar, Tag, ChevronRight, FileText } from "lucide-react";

export default function NotesPage() {
    // 1. 获取所有笔记
    const notes = getAllNotes();

    // 2. 构建左侧目录树数据
    const tree = buildFileTree(notes);

    return (
        /* 3. 使用布局组件包裹，并传入 tree */
        <NotesLayoutClient tree={tree}>
            <div className="space-y-12 pb-20">
                {/* Header: 极简大标题 */}
                <header className="space-y-4 pt-4">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Notes</h1>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl">
                        这里是我对技术、设计以及数字生活的长期沉淀。
                    </p>
                </header>

                {/* Notes 列表：Apple 风格的清单卡片 */}
                <div className="grid gap-4">
                    {notes.map((note) => (
                        <Link
                            key={note.slug}
                            href={`/notes/${note.slug}`}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/50 p-6 transition-all hover:border-blue-500/30 hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:hover:border-blue-500/30"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-3">
                                    {/* 标签组 */}
                                    <div className="flex flex-wrap gap-2">
                                        {note.frontmatter.tags?.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                                                <Tag className="h-2 w-2 opacity-70" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {note.frontmatter.title}
                                        </h2>
                                        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
                                            {note.frontmatter.description || "暂无描述..."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0 mt-2 md:mt-0">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium uppercase tracking-tighter">
                                        <Calendar className="h-3 w-3" />
                                        {note.frontmatter.date}
                                    </div>
                                    <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 transition-all group-hover:bg-blue-600 group-hover:text-white">
                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 空状态 */}
                {notes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <FileText className="h-12 w-12 opacity-20 mb-4" />
                        <p>知识库正在建设中...</p>
                    </div>
                )}
            </div>
        </NotesLayoutClient>
    );
}