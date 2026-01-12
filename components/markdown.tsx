import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Stable Markdown renderer with LaTeX support (Obsidian style):
 * - inline: $...$
 * - block:  $$...$$
 */
export async function Markdown({ source }: { source: string }) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: false })
        .use(rehypeKatex)
        .use(rehypeStringify)
        .process(source);

    return (
        <article
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: String(file) }}
        />
    );
}
