import { NextResponse } from "next/server";
import { getAllNotes } from "../../../lib/content";

function stripMd(md: string) {
    // 极简清理：去掉代码块、md符号，作为预览用
    return md
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
        .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
        .replace(/[#>*_\-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function GET() {
    const notes = getAllNotes();

    const items = notes.map((n) => {
        const preview = stripMd(n.content).slice(0, 180);
        return {
            slug: n.slug,
            title: n.frontmatter.title,
            description: n.frontmatter.description ?? "",
            date: n.frontmatter.date,
            tags: n.frontmatter.tags ?? [],
            preview,
        };
    });

    return NextResponse.json(items);
}
