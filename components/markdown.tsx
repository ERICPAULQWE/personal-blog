/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";

/**
 * 核心修复：处理 Obsidian 图片语法与标准 Markdown 图片语法
 * 兼容两种格式：
 * 1. ![[filename.jpg|200]] (Obsidian Wiki-link)
 * 2. ![](./path/filename.jpg|200) (带宽度的标准 Markdown)
 */
function remarkSmartImage() {
    return (tree: any) => {
        // 1. 处理所有图片节点（标准语法产生的）
        visit(tree, "image", (node: any) => {
            if (node.url && !node.url.startsWith("http")) {
                // 如果 URL 里包含宽度管道符 |，将其拆分
                const [cleanUrl, width] = node.url.split("|");
                // 提取文件名（去掉前面的 ./ 或 路径）
                const filename = cleanUrl.split("/").pop();

                node.url = `/api/content/images/${encodeURIComponent(filename || "")}`;
                node.data = node.data || {};
                node.data.hProperties = {
                    ...node.data.hProperties,
                    width: width || undefined,
                    style: width ? `width: ${width}px; height: auto;` : undefined,
                    className: ["rounded-2xl", "shadow-sm", "my-6", "max-w-full"],
                };
            }
        });

        // 2. 处理文本节点（捕获 ![[...]] 语法）
        visit(tree, "text", (node: any, index: any, parent: any) => {
            const regex = /!\[\[(.*?)(?:\|(.*?))?\]\]/g;
            let match;
            const newNodes = [];
            let lastIndex = 0;

            while ((match = regex.exec(node.value)) !== null) {
                const [, filename, width] = match;
                if (match.index > lastIndex) {
                    newNodes.push({ type: "text", value: node.value.slice(lastIndex, match.index) });
                }

                newNodes.push({
                    type: "image",
                    url: `/api/content/images/${encodeURIComponent(filename)}`,
                    alt: filename,
                    data: {
                        hProperties: {
                            width: width || undefined,
                            style: width ? `width: ${width}px; height: auto;` : undefined,
                            className: ["rounded-2xl", "shadow-sm", "my-6", "max-w-full"],
                        },
                    },
                });
                lastIndex = regex.lastIndex;
            }

            if (newNodes.length > 0 && parent) {
                if (lastIndex < node.value.length) {
                    newNodes.push({ type: "text", value: node.value.slice(lastIndex) });
                }
                parent.children.splice(index, 1, ...newNodes);
                return index + newNodes.length;
            }
        });
    };
}

/**
 * 处理 Obsidian Callout 语法 (保持不变)
 */
function remarkObsidianCallout() {
    return (tree: any) => {
        visit(tree, "blockquote", (node: any) => {
            if (!node.children?.length) return;
            const firstChild = node.children[0];
            if (firstChild.type !== "paragraph" || !firstChild.children?.length) return;
            const firstTextNode = firstChild.children[0];
            if (firstTextNode.type !== "text") return;

            const match = firstTextNode.value.match(/^\[!([\w-]+)\]([+-]?)(?:\s+(.*))?$/);
            if (match) {
                const [fullMatch, type, collapse, titleText] = match;
                const isCollapsible = !!collapse;
                const title = titleText || type.charAt(0).toUpperCase() + type.slice(1);
                firstTextNode.value = firstTextNode.value.slice(fullMatch.length);

                node.type = "element";
                node.data = {
                    hName: isCollapsible ? "details" : "div",
                    hProperties: {
                        className: ["callout"],
                        "data-callout": type.toLowerCase(),
                        open: collapse !== "-"
                    },
                };
                node.children = [
                    { type: "element", data: { hName: isCollapsible ? "summary" : "div", hProperties: { className: ["callout-title"] } }, children: [{ type: "text", value: title }] },
                    { type: "element", data: { hName: "div", hProperties: { className: ["callout-content"] } }, children: [...node.children] }
                ];
            }
        });
    };
}

export const Markdown = memo(function Markdown({ source }: { source: string }) {
    let contentHtml = "";
    try {
        const file = unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkBreaks)   // ✅ 关键：单换行 => <br>
            .use(remarkMath)
            .use(remarkSmartImage) // 使用强化版图片插件
            .use(remarkObsidianCallout)
            .use(remarkRehype, { allowDangerousHtml: true })
            .use(rehypeRaw)
            .use(rehypeSlug)
            .use(rehypeKatex)
            .use(rehypeStringify)
            .processSync(source);

        contentHtml = String(file);
    } catch (err) {
        console.error("Markdown rendering error:", err);
    }

    return (
        <article
            className="reading-prose prose prose-base dark:prose-invert max-w-none antialiased"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
    );
});