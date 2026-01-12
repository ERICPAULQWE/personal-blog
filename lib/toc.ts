// lib/toc.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import Slugger from "github-slugger";

export type TocItem = {
    title: string;
    url: string;
    depth: number;
};

// 辅助函数：获取节点纯文本
function toString(node: any): string {
    if (node.value) return node.value;
    if (node.children) return node.children.map(toString).join("");
    return "";
}

export async function getTableOfContents(content: string): Promise<TocItem[]> {
    const toc: TocItem[] = [];
    const slugger = new Slugger();

    function extractHeadings() {
        return (tree: any) => {
            visit(tree, "heading", (node: any) => {
                const text = toString(node);
                const id = slugger.slug(text);

                toc.push({
                    title: text,
                    url: `#${id}`,
                    depth: node.depth,
                });
            });
        };
    }

    // 修复点：改用 parse + run，而不是 process
    const processor = unified()
        .use(remarkParse)
        .use(extractHeadings);

    const tree = processor.parse(content); // 1. 解析 Markdown 为 AST 树
    await processor.run(tree);             // 2. 运行插件提取标题 (不进行编译输出)

    return toc;
}