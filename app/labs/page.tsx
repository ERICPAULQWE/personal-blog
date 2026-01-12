import Link from "next/link";
import { labs } from "../../labs/_registry";

export default function LabsPage() {
    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Labs</h1>
                <p className="prose-base">
                    交互实验室：用 React 页面承载（最稳定），可配套 Markdown 说明文档。
                </p>
            </header>

            <div className="space-y-3">
                {labs.map((l) => (
                    <Link
                        key={l.slug}
                        href={`/labs/${l.slug}`}
                        className="block rounded-2xl border border-neutral-200/70 p-5 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <h2 className="text-base font-semibold">{l.title}</h2>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {l.date}
                            </span>
                        </div>
                        {l.description ? <p className="prose-base mt-2">{l.description}</p> : null}
                        {l.tags?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {l.tags.map((t) => (
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
                ))}
            </div>
        </div>
    );
}
