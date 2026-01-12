import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm"; // 关键：修复表格和自动链接
import { unified } from "unified";
import { visit } from "unist-util-visit";

// 自定义插件：处理 Obsidian 图片语法 ![[filename|width]]
function remarkObsidianImage() {
    return (tree: any) => {
        visit(tree, "text", (node: any, index: number | undefined, parent: any) => {
            const value = node.value;
            const regex = /!\[\[(.*?)(?:\|(.*?))?\]\]/g;

            let match;
            const newNodes = [];
            let lastIndex = 0;

            while ((match = regex.exec(value)) !== null) {
                const [fullMatch, filename, width] = match;

                if (match.index > lastIndex) {
                    newNodes.push({
                        type: "text",
                        value: value.slice(lastIndex, match.index),
                    });
                }

                const imageNode = {
                    type: "image",
                    url: `/api/content/images/${encodeURIComponent(filename)}`,
                    alt: filename,
                    data: {
                        hProperties: {
                            width: width ? width : undefined,
                        },
                    },
                };

                newNodes.push(imageNode);
                lastIndex = regex.lastIndex;
            }

            if (newNodes.length > 0 && typeof index === "number" && parent) {
                if (lastIndex < value.length) {
                    newNodes.push({
                        type: "text",
                        value: value.slice(lastIndex),
                    });
                }
                parent.children.splice(index, 1, ...newNodes);
                return index + newNodes.length;
            }
        });
    };
}

/**
 * Markdown 渲染器 (同步版本)
 */
export function Markdown({ source }: { source: string }) {
    const file = unified()
        .use(remarkParse)
        .use(remarkGfm)           // 支持表格、删除线、自动链接等
        .use(remarkMath)          // 支持 LaTeX 公式
        .use(remarkObsidianImage) // 支持 Obsidian 图片
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(source);

    return (
        <article
            // prose-neutral 设置灰度，max-w-none 让内容占满容器
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: String(file) }}
        />
    );
}