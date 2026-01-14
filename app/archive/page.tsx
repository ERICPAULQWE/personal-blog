// app/archive/page.tsx
import { groupNotesByMonth } from "@/lib/content";
import { labs } from "../../labs/_registry";
import ArchiveClient from "./archive-client";

type TimelineItem = {
    kind: "note" | "lab";
    slug: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags: string[];
};

type NoteFrontmatter = {
    title: string;
    description?: string;
    date: string;
    tags?: string[];
};

type NoteEntry = {
    slug: string;
    frontmatter: NoteFrontmatter;
};

function monthKey(date: string) {
    return date.slice(0, 7); // YYYY-MM
}

export default function ArchivePage() {
    // 1) Notes → 扁平化
    const noteGroups = groupNotesByMonth();

    const noteItems: TimelineItem[] = noteGroups.flatMap(([_month, notes]) =>
        (notes as NoteEntry[]).map((n) => ({
            kind: "note" as const,
            slug: n.slug,
            title: n.frontmatter.title,
            description: n.frontmatter.description,
            date: n.frontmatter.date,
            tags: (n.frontmatter.tags ?? []) as string[],
        }))
    );

    // 2) Labs → registry
    const labItems: TimelineItem[] = labs.map((l) => ({
        kind: "lab" as const,
        slug: l.slug,
        title: l.title,
        description: l.description,
        date: l.date,
        tags: l.tags ?? [],
    }));

    // 3) 合并 + 按月份分组
    const all = [...noteItems, ...labItems].filter((x) => x.date);
    const map = new Map<string, TimelineItem[]>();

    for (const item of all) {
        const ym = monthKey(item.date);
        const arr = map.get(ym) ?? [];
        arr.push(item);
        map.set(ym, arr);
    }

    // 4) 月份降序 + 月内日期降序
    const groups = Array.from(map.entries())
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([ym, items]) => [ym, items.sort((a, b) => (a.date < b.date ? 1 : -1))] as const);

    // ✅ 注意：这里 groups 已经在作用域内了，不会再 TS2304
    return <ArchiveClient groups={groups} />;
}
