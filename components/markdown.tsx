/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";

/**
 * 处理 Obsidian 图片语法 ![[filename|width]]
 */
function remarkObsidianImage() {
    return (tree: any) => {
        visit(tree, "text", (node: any, index: any, parent: any) => {
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
                            loading: "lazy",
                            decoding: "async",
                            // 增加苹果风格的微圆角
                            className: ["rounded-2xl", "shadow-sm", "my-8"],
                        },
                    },
                };

                newNodes.push(imageNode);
                lastIndex = regex.lastIndex;
            }

            if (newNodes.length > 0 && parent && typeof index === "number") {
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
 * 处理 Obsidian Callout 语法
 */
function remarkObsidianCallout() {
    return (tree: any) => {
        visit(tree, "blockquote", (node: any) => {
            if (!node.children || node.children.length === 0) return;
            const firstChild = node.children[0];
            if (firstChild.type !== "paragraph" || !firstChild.children || firstChild.children.length === 0) return;
            const firstTextNode = firstChild.children[0];
            if (firstTextNode.type !== "text") return;

            const match = firstTextNode.value.match(/^\[!([\w-]+)\]([+-]?)(?:\s+(.*))?$/);
            if (match) {
                const [fullMatch, type, collapse, titleText] = match;
                const isCollapsible = !!collapse;
                const defaultOpen = collapse !== "-";
                const title = titleText || type.charAt(0).toUpperCase() + type.slice(1);

                firstTextNode.value = firstTextNode.value.slice(fullMatch.length);

                const titleNode = {
                    type: "element",
                    data: {
                        hName: isCollapsible ? "summary" : "div",
                        hProperties: { className: ["callout-title"] },
                    },
                    children: [{ type: "text", value: title }],
                };

                const contentNode = {
                    type: "element",
                    data: {
                        hName: "div",
                        hProperties: { className: ["callout-content"] },
                    },
                    children: [...node.children],
                };

                node.type = "element";
                node.data = {
                    hName: isCollapsible ? "details" : "div",
                    hProperties: {
                        className: ["callout"],
                        "data-callout": type.toLowerCase(),
                        open: isCollapsible && defaultOpen ? true : undefined,
                    },
                };
                node.children = [titleNode, contentNode];
            }
        });
    };
}

export const Markdown = memo(function Markdown({ source }: { source: string }) {
    let contentHtml = "";
    let error = null;

    try {
        const file = unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkObsidianImage)
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
        error = err;
    }

    if (error) {
        return (
            <div className="p-4 border border-red-500 text-red-500 rounded-2xl glass">
                渲染错误: 原始内容无法解析
                <pre className="mt-2 text-xs overflow-auto">{source}</pre>
            </div>
        );
    }

    return (
        <article
            /* 关键优化：
               1. 使用 prose-base 对应我们在 globals.css 中的高对比度白色定义
               2. 去掉 prose-neutral，使用我们自定义的纯净色彩
               3. 增加 antialiased 确保在苹果设备上字体渲染最纤细美观
            */
            className="prose prose-base dark:prose-invert max-w-none antialiased selection:bg-blue-500/30"
            style={{
                contentVisibility: "auto",
                containIntrinsicSize: "1000px",
                // 优化行高，增加呼吸感
                lineHeight: '1.8'
            } as any}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
    );
});