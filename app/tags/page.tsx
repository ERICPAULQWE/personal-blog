import Link from "next/link";
import { getAllTags } from "../../lib/content";

export default function TagsPage() {
    const tags = getAllTags();

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
                <p className="prose-base">所有标签（自动从 Notes 的 frontmatter.tags 生成）。</p>
            </header>

            {tags.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                    <p className="prose-base">暂无标签。给笔记加上 tags 后这里会自动出现。</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags.map(({ tag, count }) => (
                        <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`}
                            className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-800 transition hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            {tag}
                            <span className="ml-2 text-xs opacity-70">{count}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
