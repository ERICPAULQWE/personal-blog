import { marked } from "marked";

// 安全/稳定优先：这里只做最基础渲染，不启用危险 HTML
marked.setOptions({
    gfm: true,
    breaks: false,
});

export function Markdown({ source }: { source: string }) {
    const html = marked.parse(source) as string;

    return (
        <article
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}