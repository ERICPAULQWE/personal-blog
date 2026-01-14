"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
    BookText,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Folder,
    Hash,
    Search,
    Sparkles,
    X,
    ArrowRight,
} from "lucide-react";

type NoteFrontmatter = {
    title: string;
    description?: string;
    date: string;
    tags?: string[];
};

export type NoteItem = {
    slug: string;
    frontmatter: NoteFrontmatter;
};

type CategoryKey =
    | "all"
    | "recent"
    | `folder:${string}`
    | `tag:${string}`;

function norm(s: string) {
    return String(s ?? "").trim().toLowerCase();
}

function topFolder(slug: string) {
    const parts = String(slug).split("/").filter(Boolean);
    return parts.length >= 2 ? parts[0] : "root";
}

function safeTags(n: NoteItem) {
    return (n.frontmatter.tags ?? []).map((t) => String(t).trim()).filter(Boolean);
}

/** Notes 主色系：沿用你全站 notes 的蓝色倾向（主页 Notes 卡片也是蓝）:contentReference[oaicite:6]{index=6} */
const NOTE_STYLE = {
    previewGradient: "from-blue-500/10 to-cyan-500/10",
    glowA: "bg-blue-500/25 group-hover:bg-blue-500/35",
    glowB: "bg-cyan-500/20 group-hover:bg-cyan-500/30",
    hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    badgeGradient: "from-blue-500/20 to-cyan-500/20",
    badgeBorder: "border-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
};

export default function NotesClient({ notes }: { notes: NoteItem[] }) {
    const [category, setCategory] = useState<CategoryKey>("all");
    const [q, setQ] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [tagsExpanded, setTagsExpanded] = useState(false);

    const tagStats = useMemo(() => {
        const map = new Map<string, number>();
        for (const n of notes) {
            for (const t of safeTags(n)) map.set(t, (map.get(t) ?? 0) + 1);
        }
        return Array.from(map.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    }, [notes]);

    const folderStats = useMemo(() => {
        const map = new Map<string, number>();
        for (const n of notes) {
            const f = topFolder(n.slug);
            map.set(f, (map.get(f) ?? 0) + 1);
        }
        return Array.from(map.entries())
            .map(([folder, count]) => ({ folder, count }))
            .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));
    }, [notes]);

    const filtered = useMemo(() => {
        const query = norm(q);

        const byCategory = (n: NoteItem) => {
            if (category === "all") return true;

            if (category === "recent") {
                // 简单近 30 条（也可改成按日期近 90 天）
                // 这里不做复杂日期解析，直接在排序里体现“最近”
                return true;
            }

            if (category.startsWith("folder:")) {
                const f = category.slice("folder:".length);
                return topFolder(n.slug) === f;
            }

            if (category.startsWith("tag:")) {
                const t = category.slice("tag:".length);
                return safeTags(n).some((x) => norm(x) === norm(t));
            }

            return true;
        };

        const byQuery = (n: NoteItem) => {
            if (!query) return true;
            const hay = norm([
                n.frontmatter.title,
                n.frontmatter.description ?? "",
                n.frontmatter.date,
                safeTags(n).join(" "),
                n.slug,
            ].join(" "));
            return hay.includes(query);
        };

        let list = notes.filter((n) => byCategory(n) && byQuery(n));

        // recent：按 date 字符串倒序（你 frontmatter.date 是 YYYY-MM-DD 风格时效果最好）
        if (category === "recent") {
            list = [...list].sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1)).slice(0, 30);
        } else {
            list = [...list].sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
        }

        return list;
    }, [notes, category, q]);

    const selectedLabel = useMemo(() => {
        if (category === "all") return "全部";
        if (category === "recent") return "最近";
        if (category.startsWith("folder:")) return category.slice("folder:".length);
        if (category.startsWith("tag:")) return `#${category.slice("tag:".length)}`;
        return "全部";
    }, [category]);

    return (
        <div className="space-y-12 pb-20">
            {/* Header：对齐 Labs 的结构 */}
            <section className="space-y-4 py-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <BookText className="h-3 w-3" />
                    <span>Knowledge Garden</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                        Notes
                    </span>
                    <span className="text-neutral-200 dark:text-neutral-800"> / </span>
                    <span className="text-neutral-900 dark:text-white">Library</span>
                </h1>

                <p className="mx-auto max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
                    这里是我对技术、设计以及数字生活的长期沉淀。
                </p>
            </section>



            {/* Layout：对齐 Labs “可折叠 sidebar + main” :contentReference[oaicite:8]{index=8} */}
            <div
                className={[
                    "grid gap-8",
                    sidebarCollapsed ? "grid-cols-1 lg:grid-cols-[1px_1fr]" : "grid-cols-1 lg:grid-cols-[290px_1fr]",
                ].join(" ")}
            >
                {/* Sidebar */}
                <aside className="lg:sticky lg:top-24 h-fit">
                    {sidebarCollapsed ? (
                        <div className="relative">
                            {/* ✅ 只留 1px 锚点：不渲染任何白色圆角矩形 */}
                            <div className="w-[1px] h-[72vh] min-h-[420px]" />

                            {/* ✅ 展开按钮贴着内容区边缘，不会飞到远处 */}
                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed(false)}
                                className="glass absolute top-6 -right-4 h-10 w-10 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center hover:bg-white/60 dark:hover:bg-neutral-800/50 transition shadow-sm"
                                aria-label="Expand sidebar"
                                title="Expand"
                            >
                                <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                            </button>
                        </div>
                    ) : (
                        <div className="glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">分类</div>

                                <div className="flex items-center gap-2">
                                    <div className="text-[11px] font-mono opacity-60">
                                        {filtered.length}/{notes.length}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSidebarCollapsed(true)}
                                        className="h-9 w-9 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center hover:bg-white/60 dark:hover:bg-neutral-800/50 transition"
                                        aria-label="Collapse sidebar"
                                        title="Collapse"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick items */}
                            <div className="mt-4 space-y-1">
                                <NavItem
                                    active={category === "all"}
                                    label="全部"
                                    leftIcon={<Sparkles className="h-4 w-4 opacity-70" />}
                                    right={String(notes.length)}
                                    onClick={() => setCategory("all")}
                                />
                                <NavItem
                                    active={category === "recent"}
                                    label="最近"
                                    leftIcon={<Calendar className="h-4 w-4 opacity-70" />}
                                    right="30"
                                    onClick={() => setCategory("recent")}
                                />
                            </div>

                            <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />

                            {/* Folders */}
                            <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 px-2">Folders</div>
                            <div className="mt-2 max-h-[220px] overflow-auto pr-1 space-y-1">
                                {folderStats.map(({ folder, count }) => (
                                    <NavItem
                                        key={folder}
                                        active={category === `folder:${folder}`}
                                        label={folder}
                                        right={String(count)}
                                        leftIcon={<Folder className="h-4 w-4 opacity-70" />}
                                        onClick={() => setCategory(`folder:${folder}`)}
                                    />
                                ))}
                            </div>

                            <div className="my-5 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />

                            {/* Tags (collapsed by default like Labs) :contentReference[oaicite:9]{index=9} */}
                            <button
                                type="button"
                                onClick={() => setTagsExpanded((v) => !v)}
                                className="w-full flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-white/40 dark:hover:bg-neutral-800/30 transition"
                                aria-expanded={tagsExpanded}
                            >
                                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">Tags</div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <span className="text-[11px] font-mono opacity-70">{tagStats.length}</span>
                                    <ChevronDown className={["h-4 w-4 transition-transform", tagsExpanded ? "rotate-180" : ""].join(" ")} />
                                </div>
                            </button>

                            <div
                                className={[
                                    "mt-2 overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                                    tagsExpanded ? "max-h-[240px] opacity-100" : "max-h-0 opacity-0",
                                ].join(" ")}
                            >
                                <div className="max-h-[240px] overflow-auto pr-1 space-y-1">
                                    {tagStats.map(({ tag, count }) => (
                                        <NavItem
                                            key={tag}
                                            active={category === `tag:${tag}`}
                                            label={tag}
                                            right={String(count)}
                                            leftIcon={<Hash className="h-4 w-4 opacity-60" />}
                                            onClick={() => setCategory(`tag:${tag}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main */}
                <section className="space-y-6">
                    {/* Search：对齐 Labs 搜索形态 :contentReference[oaicite:10]{index=10} */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="glass w-full rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 px-4 py-3 flex items-center gap-3">
                            <Search className="h-4 w-4 text-neutral-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="搜索笔记：标题 / 标签 / 路径 / 描述…"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                            />
                            {q ? (
                                <button
                                    type="button"
                                    onClick={() => setQ("")}
                                    className="h-7 w-7 rounded-full flex items-center justify-center border border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white/60 dark:hover:bg-neutral-800/60 transition"
                                    aria-label="Clear"
                                >
                                    <X className="h-4 w-4 text-neutral-400" />
                                </button>
                            ) : null}
                        </div>

                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            当前： <span className="text-neutral-900 dark:text-white font-medium">{selectedLabel}</span>
                        </div>
                    </div>

                    {/* Empty */}
                    {filtered.length === 0 ? (
                        <div className="glass rounded-3xl border border-neutral-200/60 dark:border-neutral-800/60 p-10 text-center">
                            <div className="mx-auto w-fit rounded-2xl bg-white/50 p-4 shadow-sm backdrop-blur-md dark:bg-black/20">
                                <Sparkles className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-neutral-900 dark:text-white">没有匹配的笔记</h3>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">换个关键词，或切换左侧分类/标签试试。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((note) => {
                                const tags = safeTags(note);

                                return (
                                    <Link
                                        key={note.slug}
                                        href={`/notes/${note.slug}`}
                                        className="group relative overflow-hidden rounded-[2rem] glass transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                                    >
                                        {/* Preview */}
                                        <div className={["relative h-44 w-full overflow-hidden bg-gradient-to-br", NOTE_STYLE.previewGradient].join(" ")}>
                                            {/* Badge */}
                                            <div className="absolute left-4 top-4 z-20">
                                                <div
                                                    className={[
                                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                                                        "bg-white/60 dark:bg-black/20",
                                                        `bg-gradient-to-r ${NOTE_STYLE.badgeGradient}`,
                                                        NOTE_STYLE.badgeBorder,
                                                        NOTE_STYLE.badgeText,
                                                    ].join(" ")}
                                                >
                                                    <BookText className="h-3.5 w-3.5 opacity-90" />
                                                    <span>Note</span>
                                                </div>
                                            </div>

                                            {/* Glows */}
                                            <div className={["absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-colors", NOTE_STYLE.glowA].join(" ")} />
                                            <div className={["absolute top-10 left-10 h-24 w-24 rounded-full blur-2xl transition-colors", NOTE_STYLE.glowB].join(" ")} />

                                            {/* Center Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-2xl bg-white/55 p-4 shadow-sm backdrop-blur-md dark:bg-black/20">
                                                    <div className={["text-neutral-400 transition-colors", NOTE_STYLE.hoverText].join(" ")}>
                                                        <BookText className="h-8 w-8" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-6">
                                            <h3 className={["text-xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors", NOTE_STYLE.hoverText].join(" ")}>
                                                {note.frontmatter.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                {note.frontmatter.description || "暂无描述…"}
                                            </p>

                                            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span className="font-mono">{note.frontmatter.date}</span>
                                                <span className="mx-2 opacity-40">·</span>
                                                <span className="font-mono opacity-70">{note.slug}</span>
                                            </div>

                                            {/* Tags */}
                                            {tags.length ? (
                                                <div className="mt-4 flex flex-wrap gap-1.5">
                                                    {tags.slice(0, 4).map((t) => (
                                                        <span
                                                            key={t}
                                                            className="rounded-full border border-neutral-200/70 bg-white/50 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-neutral-800/70 dark:bg-neutral-900/40 dark:text-neutral-300"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                    {tags.length > 4 ? <span className="text-[11px] text-neutral-400">+{tags.length - 4}</span> : null}
                                                </div>
                                            ) : null}

                                            {/* CTA */}
                                            <div
                                                className={[
                                                    "mt-6 flex items-center gap-2 text-xs font-semibold opacity-0 transform translate-y-2 transition-all",
                                                    "group-hover:opacity-100 group-hover:translate-y-0",
                                                    NOTE_STYLE.badgeText,
                                                ].join(" ")}
                                            >
                                                Open Note <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function NavItem({
    label,
    right,
    active,
    onClick,
    leftIcon,
}: {
    label: string;
    right?: string;
    active?: boolean;
    onClick: () => void;
    leftIcon?: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition border border-transparent",
                active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                    : "text-neutral-600 hover:bg-white/60 dark:text-neutral-300 dark:hover:bg-neutral-800/50",
            ].join(" ")}
        >
            <span className="flex min-w-0 items-center gap-2">
                {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
                <span className="truncate">{label}</span>
            </span>

            {right ? (
                <span className={["text-[11px] font-mono opacity-70", active ? "text-white/80 dark:text-black/70" : ""].join(" ")}>
                    {right}
                </span>
            ) : null}
        </button>
    );
}
