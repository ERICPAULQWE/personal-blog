import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";

export function generateStaticParams() {
    const notes = getAllNotes();
    return notes.map((n) => ({ slug: n.slug.split("/") }));
}

export default function NoteDetailPage({
    params,
}: {
    params: { slug: string[] };
}) {
    const slug = params.slug.join("/");
    const note = getNoteBySlug(slug);

    if (!note) return notFound();

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <header className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight">{note.frontmatter.title}</h1>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {note.frontmatter.date}
                </div>
                {note.frontmatter.description ? (
                    <p className="prose-base">{note.frontmatter.description}</p>
                ) : null}
            </header>

            <Markdown source={note.content} />
        </div>
    );
}
