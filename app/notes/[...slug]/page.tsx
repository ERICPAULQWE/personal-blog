import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";

export function generateStaticParams() {
    const notes = getAllNotes();
    return notes.map((n) => ({ slug: n.slug.split("/") }));
}

// 修复点 1: 组件改为 async，因为 Next.js 15 中 params 是 Promise
export default async function NoteDetailPage({
    params,
}: {
    params: Promise<{ slug: string[] }>; // 类型定义更新
}) {
    // 修复点 1: 等待 params 解析
    const { slug } = await params;

    // 修复点 2: 对 URL 进行解码 (处理中文和空格)
    // 例如: ['%E7%AC%AC3%E7%AB%A0'] -> ['第3章']
    const decodedSlug = slug.map((s) => decodeURIComponent(s)).join("/");

    const note = getNoteBySlug(decodedSlug);

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