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
    // 1. 递归获取所有 .md 文件
    const files = walk(NOTES_DIR);

    const notes = files.map((fp) => {
        const raw = fs.readFileSync(fp, "utf-8");
        const { data, content } = matter(raw);

        // 2. 获取相对路径 slug (例如: "学习/第5章")
        const slug = fileToSlug(fp);

        // 3. 自动提取文件夹名称作为标签
        // 例如 slug 为 "学习/计算机/笔记"，则 folderTags 为 ["学习", "计算机"]
        const pathParts = slug.split("/");
        const folderTags = pathParts.slice(0, -1);

        // 4. 处理手动定义的 tags (兼容字符串或数组格式)
        let manualTags: string[] = [];
        if (data.tags) {
            manualTags = Array.isArray(data.tags) ? data.tags : [data.tags];
        }

        // 5. 合并标签并去重
        const combinedTags = Array.from(
            new Set([...manualTags, ...folderTags])
        ).filter(tag => !!tag.trim()); // 过滤掉空格或空字符串

        // 6. 构造最终的 Note 对象，并为缺失字段提供默认值 (防止列表页空白)
        return {
            slug,
            frontmatter: {
                title: data.title || path.basename(fp, ".md"), // 没写标题就用文件名
                date: data.date || "2000-01-01",              // 没写日期给个默认值
                description: data.description || "",
                tags: combinedTags,                           // 使用合并后的标签
                status: data.status || "published",           // 默认设为发布
                ...data                                       // 保留其他原始元数据
            } as Frontmatter,
            content,
        };
    });

    // 7. 过滤逻辑：只显示非草稿状态的笔记
    const published = notes.filter((n) => n.frontmatter.status !== "draft");

    // 8. 排序逻辑：按日期倒序排列，确保即使日期格式不对也能安全运行
    published.sort((a, b) => {
        const dateA = a.frontmatter.date || "";
        const dateB = b.frontmatter.date || "";
        return dateA < dateB ? 1 : -1;
    });

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
