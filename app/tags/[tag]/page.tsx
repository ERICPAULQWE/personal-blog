import { notFound } from "next/navigation";
import { getNotesByTag } from "../../../lib/content";
import Link from "next/link";
import { ArrowLeft, Calendar, ChevronRight, Hash, Tag } from "lucide-react";

export default async function TagDetailPage({
    params,
}: {
    params: Promise<{ tag: string }>;
}) {
    // 1. 解码 URL 中的 tag 参数 (支持中文)
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);

    // 2. 获取该标签下的所有笔记
    const notes = getNotesByTag(decodedTag);

    // 3. 如果没有找到笔记，返回 404 (虽然理论上入口存在就不会空)
    if (notes.length === 0) return notFound();

    return (
        <div className="space-y-10 pb-20">
            {/* Hero Header */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900 dark:bg-neutral-100 p-10 md:p-16 text-white dark:text-black">
                {/* 装饰性背景 */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 opacity-20 blur-3xl" />

                <div className="relative z-10 space-y-6">
                    <Link
                        href="/tags"
                        className="inline-flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <ArrowLeft className="h-4 w-4" /> 返回索引
                    </Link>

                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white dark:text-black dark:bg-black/10">
                                <Hash className="h-6 w-6" />
                            </div>
                            <span className="text-lg font-medium opacity-80">Topic</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                            {decodedTag}
                        </h1>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md dark:border-black/10 dark:bg-black/5">
                        <span className="font-semibold">{notes.length}</span> 篇笔记关联
                    </div>
                </div>
            </header>

            {/* Notes List (复用 NoteCard 风格) */}
            <div className="grid gap-6">
                {notes.map((note) => (
                    <Link
                        key={note.slug}
                        href={`/notes/${note.slug}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl glass p-6 transition-all hover:translate-x-1 hover:border-blue-500/30"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                {/* 标签组 (排除当前正在浏览的标签) */}
                                <div className="flex flex-wrap gap-2">
                                    {note.frontmatter.tags
                                        ?.filter((t) => t !== decodedTag) // 过滤掉当前大标题显示的标签，避免视觉重复
                                        .map((t) => (
                                            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                                                <Tag className="h-2 w-2 opacity-50" />
                                                {t}
                                            </span>
                                        ))}
                                </div>

                                <h2 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {note.frontmatter.title}
                                </h2>

                                <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                                    {note.frontmatter.description || "暂无描述..."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                                <div className="hidden md:flex flex-col items-end text-right">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium uppercase tracking-tighter">
                                        <Calendar className="h-3 w-3" />
                                        {note.frontmatter.date}
                                    </div>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}