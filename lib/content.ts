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