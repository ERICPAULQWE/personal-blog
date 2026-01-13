import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";
import { getTableOfContents } from "../../../lib/toc";
import { buildFileTree } from "../../../lib/tree";
import { NotesLayoutClient } from "../../../components/notes-layout-client";
import { Calendar, User } from "lucide-react";

export function generateStaticParams() {
    const notes = getAllNotes();
    return notes.map((n) => ({ slug: n.slug.split("/") }));
}

export default async function NoteDetailPage({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const { slug } = await params;
    const decodedSlug = slug.map((s) => decodeURIComponent(s)).join("/");
    const note = getNoteBySlug(decodedSlug);

    if (!note) return notFound();

    const allNotes = getAllNotes();
    const tree = buildFileTree(allNotes);
    const toc = await getTableOfContents(note.content);

    return (
        <NotesLayoutClient tree={tree} toc={toc}>
            <div className="space-y-12 pb-20">
                <header className="space-y-6 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-tight text-neutral-900 dark:text-white antialiased">
                        {note.frontmatter.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 opacity-70" />
                            {note.frontmatter.date}
                        </div>
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