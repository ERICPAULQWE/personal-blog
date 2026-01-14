import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";
import { getTableOfContents } from "../../../lib/toc";
import { buildFileTree } from "../../../lib/tree";
import { NotesLayoutClient } from "../../../components/notes-layout-client";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 生成静态路径 (SSG)
export function generateStaticParams() {
    const notes = getAllNotes();
    return notes.map((note) => ({
        // 这里的 split 确保总是返回数组，符合 [...slug] 的要求
        slug: note.slug.split("/"),
    }));
}

export default async function NoteDetailPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    // 将 URL 数组还原为文件路径字符串 (例如 ["ai", "llm"] -> "ai/llm")
    const decodedSlug = slug.map((s) => decodeURIComponent(s)).join("/");
    const note = getNoteBySlug(decodedSlug);

    if (!note) return notFound();

    const allNotes = getAllNotes();
    const tree = buildFileTree(allNotes);
    const toc = await getTableOfContents(note.content);

    return (
        <NotesLayoutClient tree={tree} toc={toc}>
            <Link
                href="/notes"
                className="fixed left-6 top-6 z-50 inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/60 px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-md transition hover:bg-white/80 hover:text-neutral-900 dark:border-neutral-800/60 dark:bg-black/30 dark:text-neutral-200 dark:hover:bg-black/40"
                aria-label="Back to Notes"
                title="返回 Notes"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
            </Link>
            <div className="space-y-12 pb-20">
                {/* 文章头部信息 */}
                <header className="space-y-6 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight text-neutral-900 dark:text-white antialiased">
                        {note.frontmatter.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 opacity-70" />
                            {note.frontmatter.date}
                        </div>
                        {/* 你可以在这里从 metadata 读取作者，或者写死 */}
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4 opacity-70" />
                            Ericpaulqwe
                        </div>
                    </div>

                    {note.frontmatter.description && (
                        <div className="relative pl-4 border-l-4 border-blue-500/20">
                            <p className="text-lg text-neutral-600 dark:text-neutral-300 italic">
                                {note.frontmatter.description}
                            </p>
                        </div>
                    )}
                </header>

                {/* Markdown 正文渲染 */}
                <section>
                    <Markdown source={note.content} />
                </section>

                <footer className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-sm text-neutral-400">
                        最后编辑于 {note.frontmatter.date}
                    </p>
                </footer>
            </div>
        </NotesLayoutClient>
    );
}