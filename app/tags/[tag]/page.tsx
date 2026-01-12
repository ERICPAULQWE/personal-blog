import Link from "next/link";
import { getAllTags, getNotesByTag } from "../../../lib/content";

export function generateStaticParams() {
    return getAllTags().map(({ tag }) => ({ tag }));
}

export default function TagDetailPage({ params }: { params: { tag: string } }) {
    const decoded = decodeURIComponent(params.tag);
    const notes = getNotesByTag(decoded);

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Tag: <span className="opacity-80">{decoded}</span>
                </h1>
                <p className="prose-base">共 {notes.length} 篇笔记</p>
            </header>

            <div className="space-y-3">
                {notes.map((n) => (
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
                    </Link>
                ))}
            </div>

            <div className="pt-2">
                <Link
                    href="/tags"
                    className="text-sm text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
                >
                    ← Back to Tags
                </Link>
            </div>
        </div>
    );
}
