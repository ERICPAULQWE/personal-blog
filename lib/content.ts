import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Frontmatter = {
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    tags?: string[];
    status?: "published" | "draft";
};

export type Note = {
    slug: string; // 支持子目录：ai/xxx
    frontmatter: Frontmatter;
    content: string;
};

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "content", "notes");

function isMdFile(name: string) {
    return name.endsWith(".md");
}

function walk(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) files.push(...walk(full));
        else if (e.isFile() && isMdFile(e.name)) files.push(full);
    }
    return files;
}

function fileToSlug(filepath: string) {
    const rel = path.relative(NOTES_DIR, filepath).replace(/\\/g, "/");
    return rel.replace(/\.md$/, "");
}

export function getAllNotes(): Note[] {
    const files = walk(NOTES_DIR);

    const notes = files.map((fp) => {
        const raw = fs.readFileSync(fp, "utf-8");
        const { data, content } = matter(raw);
        return {
            slug: fileToSlug(fp),
            frontmatter: data as Frontmatter,
            content,
        };
    });

    const published = notes.filter((n) => n.frontmatter.status !== "draft");

    published.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
    return published;
}

export function getNoteBySlug(slug: string): Note | null {
    const filepath = path.join(NOTES_DIR, `${slug}.md`);
    if (!fs.existsSync(filepath)) return null;

    const raw = fs.readFileSync(filepath, "utf-8");
    const { data, content } = matter(raw);
    return {
        slug,
        frontmatter: data as Frontmatter,
        content,
    };
}

export function getAllTags() {
    const notes = getAllNotes();
    const map = new Map<string, number>();

    for (const n of notes) {
        const tags = n.frontmatter.tags ?? [];
        for (const t of tags) {
            const key = String(t).trim();
            if (!key) continue;
            map.set(key, (map.get(key) ?? 0) + 1);
        }
    }

    return Array.from(map.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getNotesByTag(tag: string) {
    const notes = getAllNotes();
    const target = tag.toLowerCase();
    return notes.filter((n) =>
        (n.frontmatter.tags ?? []).some((t) => String(t).toLowerCase() === target)
    );
}

export function groupNotesByMonth() {
    const notes = getAllNotes();
    const groups = new Map<string, Note[]>();

    for (const n of notes) {
        const ym = (n.frontmatter.date || "").slice(0, 7); // YYYY-MM
        const key = ym && ym.length === 7 ? ym : "Unknown";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(n);
    }

    // 每个分组内按日期倒序
    for (const [, arr] of groups) {
        arr.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
    }

    // 分组 key 倒序（最新月份在上）
    // 修改：明确取出数组的第一项（Key）进行比较，避免解构参数带来的类型推断失败
    return Array.from(groups.entries()).sort((a, b) => {
        const dateA = a[0];
        const dateB = b[0];
        return dateA < dateB ? 1 : -1;
    });
}

const LABS_MD_DIR = path.join(ROOT, "content", "labs");

export function getLabDoc(slug: string) {
    const fp = path.join(LABS_MD_DIR, `${slug}.md`);
    if (!fs.existsSync(fp)) return null;
    const raw = fs.readFileSync(fp, "utf-8");
    const { data, content } = matter(raw);
    return { frontmatter: data as Frontmatter, content };
}
