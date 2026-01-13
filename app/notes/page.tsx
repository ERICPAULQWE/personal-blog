import Link from "next/link";
import { getAllNotes } from "@/lib/content";
import { Calendar, Tag, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotesPage() {
    const notes = getAllNotes();

    return (
        <div className="space-y-12">
            {/* Header: 极简大标题 */}
            <header className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Notes</h1>
                <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl">
                    这里是我对技术、设计以及数字生活的长期沉淀。
                </p>
            </header>

            {/* Notes 列表：Apple 风格的清单卡片 */}
            <div className="grid gap-6">
                {notes.map((note) => (
                    <Link
                        key={note.slug}
                        href={`/notes/${note.slug}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl glass p-6 transition-all hover:translate-x-1 hover:border-blue-500/30"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                {/* 标签组 */}
                                <div className="flex flex-wrap gap-2">
                                    {note.frontmatter.tags?.map((tag: string) => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                            <Tag className="h-2 w-2" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h2 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {note.frontmatter.title}
                                </h2>

                                <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {note.frontmatter.description || "暂无描述..."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                                <div className="hidden md:flex flex-col items-end text-right">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium uppercase tracking-tighter">
                                        <Calendar className="h-3 w-3" />
                                        {note.frontmatter.date}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 uppercase mt-1">Written by Eric</span>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </div>

                        {/* 装饰条：悬停时显示在侧边 */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                ))}
            </div>

            {/* 如果没有笔记的空状态 */}
            {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                    <FileText className="h-12 w-12 opacity-20 mb-4" />
                    <p>目前还没有写下任何笔记...</p>
                </div>
            )}
        </div>
    );
}