import Link from "next/link";
import { getAllNotes } from "../../lib/content";

export default function NotesPage() {
    const notes = getAllNotes();

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
                <p className="prose-base">来自 content/notes 的 Markdown 学习笔记。</p>
            </header>

            <div className="space-y-3">
                {notes.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                        <p className="prose-base">
                            还没有笔记。把 <code>*.md</code> 文件放进 <code>content/notes</code> 后刷新即可。
                        </p>
                    </div>
                ) : (
                    notes.map((n) => (
                        <Link
                            key={n.slug}
                            href={`/notes/${n.slug}`}
                            className="block rounded-2xl border border-neutral-200/70 p-5 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <h2 className="text-base font-semibold">{n.frontmatter.title}</h2>
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {n.frontmatter.date}
                                </span>
                            </div>

                            {n.frontmatter.description ? (
                                <p className="prose-base mt-2">{n.frontmatter.description}</p>
                            ) : null}

                            {n.frontmatter.tags?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {n.frontmatter.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
