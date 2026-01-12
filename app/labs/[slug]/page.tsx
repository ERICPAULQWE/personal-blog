import Link from "next/link";
import { notFound } from "next/navigation";
import { labs } from "../../../labs/_registry";
import { getLabDoc } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";

import CounterLab from "../../../labs/counter";

export function generateStaticParams() {
    return labs.map((l) => ({ slug: l.slug }));
}

function LabComponent({ slug }: { slug: string }) {
    if (slug === "counter") return <CounterLab />;
    return null;
}

export default function LabDetailPage({ params }: { params: { slug: string } }) {
    const meta = labs.find((l) => l.slug === params.slug);

    if (!meta) {
        // 这会让你确认是不是 registry 没匹配到
        return notFound();
    }

    const doc = getLabDoc(meta.slug);

    return (
        <div className="mx-auto max-w-4xl space-y-10">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">{meta.title}</h1>
                {meta.description ? <p className="prose-base">{meta.description}</p> : null}
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{meta.date}</div>
                <div className="pt-2">
                    <Link
                        href="/labs"
                        className="text-sm text-neutral-700 underline underline-offset-4 dark:text-neutral-300"
                    >
                        ← Back to Labs
                    </Link>
                </div>
            </header>

            <section className="space-y-3">
                <h2 className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">
                    INTERACTIVE
                </h2>
                <LabComponent slug={meta.slug} />
            </section>

            {doc ? (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">
                        NOTES
                    </h2>
                    {/* @ts-expect-error Async Server Component */}
                    <Markdown source={doc.content} />
                </section>
            ) : null}
        </div>
    );
}
