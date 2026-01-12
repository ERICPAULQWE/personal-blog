import Link from "next/link";
import { groupNotesByMonth } from "../../lib/content";

export default function ArchivePage() {
    const groups = groupNotesByMonth();

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
                <p className="prose-base">按时间归档（自动从 Notes 生成）。</p>
            </header>

            {groups.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                    <p className="prose-base">暂无笔记。</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groups.map(([ym, notes]) => (
                        <section key={ym} className="space-y-3">
                            <h2 className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">
                                {ym}
                            </h2>

                            <div className="space-y-2">
                                {notes.map((n) => (
                                    <Link
                                        key={n.slug}
                                        href={`/notes/${n.slug}`}
                                        className="flex items-baseline justify-between gap-4 rounded-xl border border-neutral-200/70 px-4 py-3 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                                    >
                                        <span className="font-medium">{n.frontmatter.title}</span>
                                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {n.frontmatter.date}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
