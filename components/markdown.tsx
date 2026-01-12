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
 * 自定义插件：处理 Obsidian 图片语法 ![[filename|width]]
 * 包含性能优化：loading="lazy"
 */
function remarkObsidianImage() {
    return (tree: any) => {
        visit(tree, "text", (node: any, index: any, parent: any) => {
            const value = node.value;
            // 匹配 ![[filename]] 或 ![[filename|width]]
            const regex = /!\[\[(.*?)(?:\|(.*?))?\]\]/g;

            let match;
            const newNodes = [];
            let lastIndex = 0;

            while ((match = regex.exec(value)) !== null) {
                const [fullMatch, filename, width] = match;

                // 保留匹配前的文本
                if (match.index > lastIndex) {
                    newNodes.push({
                        type: "text",
                        value: value.slice(lastIndex, match.index),
                    });
                }

                // 构建图片节点
                const imageNode = {
                    type: "image",
                    url: `/api/content/images/${encodeURIComponent(filename)}`,
                    alt: filename,
                    data: {
                        hProperties: {
                            width: width ? width : undefined,
                            loading: "lazy", // 性能优化
                            decoding: "async", // 性能优化
                        },
                    },
                };

                newNodes.push(imageNode);
                lastIndex = regex.lastIndex;
            }

            // 如果有匹配项，进行替换
            if (newNodes.length > 0 && parent && typeof index === "number") {
                if (lastIndex < value.length) {
                    newNodes.push({
                        type: "text",
                        value: value.slice(lastIndex),
                    });
                }
                parent.children.splice(index, 1, ...newNodes);
                // 返回跳过的新节点数量，避免死循环
                return index + newNodes.length;
            }
        });
    };
}

/**
 * 自定义插件：处理 Obsidian Callout 语法
 * 格式：> [!type]+ Title
 */
function remarkObsidianCallout() {
    return (tree: any) => {
        visit(tree, "blockquote", (node: any) => {
            // 防御性检查：确保 children 存在且有内容
            if (!node.children || node.children.length === 0) return;

            const firstChild = node.children[0];
            if (firstChild.type !== "paragraph" || !firstChild.children || firstChild.children.length === 0) {
                return;
            }

            const firstTextNode = firstChild.children[0];
            if (firstTextNode.type !== "text") return;

            // 正则匹配：[!type]+/- Title
            const match = firstTextNode.value.match(/^\[!([\w-]+)\]([+-]?)(?:\s+(.*))?$/);

            if (match) {
                const [fullMatch, type, collapse, titleText] = match;
                const isCollapsible = !!collapse;
                const defaultOpen = collapse !== "-";
                // 如果没有提供标题，自动将类型首字母大写作为标题
                const title = titleText || type.charAt(0).toUpperCase() + type.slice(1);

                // 移除标记文本 "[!INFO]"
                firstTextNode.value = firstTextNode.value.slice(fullMatch.length);

                // 构建标题部分
                const titleNode = {
                    type: "element",
                    data: {
                        hName: isCollapsible ? "summary" : "div",
                        hProperties: { className: ["callout-title"] },
                    },
                    children: [{ type: "text", value: title }],
                };

                // 构建内容部分
                const contentNode = {
                    type: "element",
                    data: {
                        hName: "div",
                        hProperties: { className: ["callout-content"] },
                    },
                    children: [...node.children], // 复制引用块内的原有内容
                };

                // 修改当前 Blockquote 节点为 Div/Details
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

/**
 * Markdown 组件 (使用 React.memo 避免不必要的重渲染)
 */
export const Markdown = memo(function Markdown({ source }: { source: string }) {
    // 使用 processSync 进行同步处理（适合服务端组件或简单的客户端渲染）
    // 注意：在非常大的文档上，如果需要不阻塞 UI，建议后续改用异步处理 useEffect
    try {
        const file = unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkObsidianImage)
            .use(remarkObsidianCallout)
            .use(remarkRehype, { allowDangerousHtml: true }) // 允许 HTML 标签通过 (关键)
            .use(rehypeRaw) // 解析原始 HTML (如 <font>)
            .use(rehypeSlug)
            .use(rehypeKatex)
            .use(rehypeStringify)
            .processSync(source);

        return (
            <article
                className="prose prose-neutral max-w-none dark:prose-invert"
                // 针对长文档的渲染优化 CSS
                style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" } as any}
                dangerouslySetInnerHTML={{ __html: String(file) }}
            />
        );
    } catch (err) {
        console.error("Markdown rendering error:", err);
        return (
            <div className="p-4 border border-red-500 text-red-500 rounded">
                渲染错误: 原始内容无法解析
                <pre className="mt-2 text-xs overflow-auto">{source}</pre>
            </div>
        );
    }
});