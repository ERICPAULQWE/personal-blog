import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // 新增：支持原始 HTML（如 font 标签）
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

// 新增自定义插件：处理 Obsidian Callout 语法 > [!type]+ Title
function remarkObsidianCallout() {
    return (tree: any) => {
        visit(tree, "blockquote", (node: any, index: number | undefined, parent: any) => {
            // 检查引用块的第一个子节点是否为段落
            if (!node.children || node.children.length === 0 || node.children[0].type !== "paragraph") {
                return;
            }

            const firstParagraph = node.children[0];
            const firstTextNode = firstParagraph.children[0];

            // 检查段落文本是否以 [! 开头
            if (!firstTextNode || firstTextNode.type !== "text") return;

            // 正则匹配：[!type]+/- Title
            // 捕获组: 1=type, 2=collapse(+-), 3=title
            const match = firstTextNode.value.match(/^\[!([\w-]+)\]([+-]?)(?:\s+(.*))?$/);

            if (match) {
                const [fullMatch, type, collapse, titleText] = match;
                const isCollapsible = !!collapse;
                const defaultOpen = collapse !== "-"; // + 或 空 默认为展开，- 为折叠
                const title = titleText || type.charAt(0).toUpperCase() + type.slice(1);

                // 移除标记文本，保留段落中剩余的内容（如果有）
                // 这里简化处理：我们假设Callout标题单独一行。
                // 我们将原 blockquote 转换为 div (或者 details)

                // 1. 构建标题节点
                const titleNode = {
                    type: "element",
                    data: {
                        hName: isCollapsible ? "summary" : "div",
                        hProperties: { className: ["callout-title"] },
                    },
                    children: [
                        // 可选：在这里根据 type 添加图标
                        { type: "text", value: title }
                    ],
                };

                // 2. 构建内容节点
                // 移除第一个段落中的标记文本。如果该段落只包含标记，则移除该段落。
                // 但为了简单，我们通常把剩余的 children 放入内容块。
                // 实际操作：因为 match 是在第一个 text node，我们需要清理这个 text node
                // 如果清理后该 paragraph 为空，则不仅移除 text node，还要注意 paragraph。
                // 为简化，我们直接取 blockquote 的剩余 children（排除第一行作为标题的部分）。
                // 如果第一行包含内容，Obsidian 通常会把它放在标题旁或下一行。
                // 这里我们把原来的 children 全部放入 content，但在渲染前先把第一个子节点的文本改掉。

                // 修改第一个文本节点，去掉 [!type]...
                // 注意：这直接修改了 AST
                firstTextNode.value = firstTextNode.value.slice(fullMatch.length);
                // 如果这一行变空了（通常是的），且该段落没别的内容，是否移除？
                // 简单的做法：保留它，它会变成一个空的 p 或者换行，影响不大。

                const contentNode = {
                    type: "element",
                    data: {
                        hName: "div",
                        hProperties: { className: ["callout-content"] },
                    },
                    children: node.children, // 包含修改后的原本 children
                };

                // 3. 转换当前的 blockquote 节点
                node.type = "element"; // 改变类型，避免被当作普通引用渲染
                node.data = {
                    hName: isCollapsible ? "details" : "div",
                    hProperties: {
                        className: ["callout"],
                        "data-callout": type.toLowerCase(),
                        open: isCollapsible ? defaultOpen : undefined,
                    },
                };
                node.children = [titleNode, contentNode];
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
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkObsidianImage) // 处理图片
        .use(remarkObsidianCallout) // 新增：处理 Callout
        .use(remarkRehype, { allowDangerousHtml: true }) // 允许 HTML 标签通过
        .use(rehypeRaw) // 新增：解析原始 HTML (关键：修复 <font> 颜色)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(source);

    return (
        <article
            className="prose prose-neutral max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: String(file) }}
        />
    );
}