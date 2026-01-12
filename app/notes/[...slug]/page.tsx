import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "../../../lib/content";
import { Markdown } from "../../../components/markdown";
import { getTableOfContents } from "../../../lib/toc";
import { TableOfContents } from "../../../components/table-of-contents";

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

    // 获取目录数据
    const toc = await getTableOfContents(note.content);

    return (
        // 修改点：删除了 "items-start"
        // 这会让 aside 高度自动拉伸 (stretch) 到和 main 一样高，从而让 sticky 生效
        <div className="relative flex w-full max-w-[90rem] mx-auto gap-6 px-4 sm:px-6 lg:gap-10 py-8">

            {/* 文章主体区域 
               flex-1: 占据剩余空间
               min-w-0: 防止代码块等宽元素撑破 flex 布局
            */}
            <main className="flex-1 min-w-0">
                {/* 文章内部限制宽度，保持最佳阅读体验 (max-w-3xl 约 768px) */}
                <div className="mx-auto max-w-3xl space-y-8">
                    <header className="space-y-3">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {note.frontmatter.title}
                        </h1>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {note.frontmatter.date}
                        </div>
                        {note.frontmatter.description ? (
                            <p className="prose-base text-muted-foreground">
                                {note.frontmatter.description}
                            </p>
                        ) : null}
                    </header>

                    <Markdown source={note.content} />
                </div>
            </main>

            {/* 右侧大纲容器 
               hidden xl:block: 只在 XL (1280px+) 屏幕显示
               shrink-0: 防止被文章挤压
               relative: 作为定位参考（虽然 sticky 是基于视口的，但保持结构清晰）
               注意：因为父级去掉了 items-start，这个 aside 现在高度是 100%
            */}
            <aside className="hidden xl:block shrink-0 relative">
                <TableOfContents toc={toc} />
            </aside>

            {/* 移动端/小屏幕下的处理 */}
            <div className="xl:hidden">
                {/* <TableOfContents toc={toc} /> */}
            </div>
        </div>
    );
}