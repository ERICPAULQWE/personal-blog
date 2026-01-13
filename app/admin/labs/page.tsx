"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/admin/md-editor";
import SimpleCodeEditor from "@/components/admin/code-editor";

type Mode = "hybrid" | "fullscreen";

interface FormData {
    title: string;
    slug: string;
    description: string;
    tags: string;
    date: string; // YYYY-MM-DD
    mode: Mode;
    doc: string; // markdown body (不含 frontmatter 也可)
    code: string; // labs/[slug]/index.tsx
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-\u4e00-\u9fa5]/g, "");
}

function ensureUseClient(code: string) {
    const trimmed = code.trimStart();
    if (trimmed.startsWith('"use client"') || trimmed.startsWith("'use client'")) {
        return code;
    }
    // 如果 code 为空，就只返回 use client（避免生成孤零零的空白行也行）
    if (!code.trim()) return `"use client";\n`;
    return `"use client";\n\n${code}`;
}

function buildLabDocFile(form: FormData) {
    const tagsArr = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    return `---
title: "${form.title}"
date: "${form.date}"
description: "${form.description}"
tags: [${tagsArr.map((t) => `"${t}"`).join(", ")}]
---

${form.doc || ""}`.trimEnd();
}

function extractExistingSlugs(registryContent: string): string[] {
    const out: string[] = [];
    const re = /slug:\s*["'`](.+?)["'`]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(registryContent)) !== null) {
        out.push(m[1]);
    }
    return Array.from(new Set(out));
}

function injectLabIntoRegistry(registryContent: string, entry: string) {
    const endToken = "];";
    const idx = registryContent.lastIndexOf(endToken);
    if (idx === -1) throw new Error("Registry format not recognized: missing '];'");

    const before = registryContent.slice(0, idx);
    const after = registryContent.slice(idx);

    return `${before}\n${entry}\n${after}`;
}

function buildRegistryEntry(form: FormData) {
    const tagsArr = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const fullScreen = form.mode === "fullscreen";

    // 缩进风格尽量贴近你现有 registry
    return `    {
        slug: "${form.slug}",
        title: "${form.title}",
        description: "${form.description}",
        date: "${form.date}",
        tags: [${tagsArr.map((t) => `"${t}"`).join(", ")}],
        fullScreen: ${fullScreen},
    },`;
}

function defaultCodeTemplate(slug: string, mode: Mode) {
    const compName =
        slugify(slug)
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
            .replace(/^\d+/, "") || "Lab";

    if (mode === "fullscreen") {
        return `"use client";

import React, { useState } from "react";

export default function ${compName}() {
  const [count, setCount] = useState(0);

  // 全屏模式：建议根节点 w-full h-full
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full p-6 md:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Full Screen Lab</h2>
          <span className="text-xs font-mono opacity-60">labs/${slug}/index.tsx</span>
        </div>

        <div className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold tabular-nums">{count}</div>
            <div className="flex items-center justify-center gap-2">
              <button
                className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
                onClick={() => setCount((c) => c + 1)}
              >
                +1
              </button>
              <button
                className="px-4 py-2 rounded border border-neutral-200 dark:border-neutral-800"
                onClick={() => setCount(0)}
              >
                reset
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-neutral-500">
          这是一个全屏模式示例。你可以把这里替换成任何复杂应用（表单/图表/Canvas 等）。
        </p>
      </div>
    </div>
  );
}
`.trimEnd();
    }

    return `"use client";

import React, { useState } from "react";

export default function ${compName}() {
  const [count, setCount] = useState(0);

  // 混合模式：组件通常放在舞台中间，宽高随内容即可
  return (
    <div className="w-full flex items-center justify-center">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm w-full max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Hybrid Lab</h2>
          <span className="text-xs font-mono opacity-60">labs/${slug}/index.tsx</span>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-4xl font-bold tabular-nums">{count}</div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
              onClick={() => setCount((c) => c + 1)}
            >
              +1
            </button>
            <button
              className="px-4 py-2 rounded border border-neutral-200 dark:border-neutral-800"
              onClick={() => setCount(0)}
            >
              reset
            </button>
          </div>
        </div>

        <p className="text-sm text-neutral-500 mt-6">
          混合模式下，页面下方会渲染对应的 Markdown 文档（如果存在）。
        </p>
      </div>
    </div>
  );
}
`.trimEnd();
}

function defaultDocTemplate(mode: Mode) {
    if (mode === "fullscreen") {
        return `# 使用说明

- 这是一个 **全屏 React Lab**。
- 建议组件根节点使用 \`w-full h-full\`，以适配舞台容器。
- 文档可选：留空则不会写入 \`content/labs/{slug}.md\`。`;
    }

    return `# 实验说明

这里写你的实验设计、交互说明、实现细节、以及截图等。

## 使用方式
- 上方是 React 组件
- 下方是本 Markdown 文档`;
}

export default function AdminLabsPage() {
    const router = useRouter();

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [loading, setLoading] = useState(false);

    const [registryRaw, setRegistryRaw] = useState<string>("");
    const [existingSlugs, setExistingSlugs] = useState<string[]>([]);

    const [form, setForm] = useState<FormData>({
        title: "",
        slug: "",
        description: "",
        tags: "",
        date: today,
        mode: "hybrid",
        doc: defaultDocTemplate("hybrid"),
        // ✅ 关键修改：默认代码为空
        code: "",
    });

    // 读取 registry，用于 slug 冲突校验
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/repo-file?path=labs/_registry.ts");
                if (!res.ok) throw new Error(await res.text());
                const data = (await res.json()) as { content: string };
                setRegistryRaw(data.content);
                setExistingSlugs(extractExistingSlugs(data.content));
            } catch (e) {
                console.error(e);
                alert("读取 labs/_registry.ts 失败（请检查 GitHub Token/权限/环境变量）");
            }
        })();
    }, []);

    const slugConflict = form.slug && existingSlugs.includes(form.slug);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const auto = slugify(title);
        setForm((prev) => ({
            ...prev,
            title,
            slug: prev.slug || auto,
        }));
    };

    const handleModeChange = (mode: Mode) => {
        // ✅ 关键修改：切换模式时不自动填充 code（保持为空，除非用户点“重置为模板”）
        setForm((prev) => ({
            ...prev,
            mode,
            doc: prev.doc && prev.doc.trim().length > 0 ? prev.doc : defaultDocTemplate(mode),
        }));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.slug || !form.description) {
            alert("请填写：Title / Slug / Description");
            return;
        }
        if (slugConflict) {
            alert(`Slug 已存在：${form.slug}\n请更换一个 slug。`);
            return;
        }
        if (!registryRaw) {
            alert("尚未加载 registry，稍后再试。");
            return;
        }

        // ✅ 关键修改：默认 code 为空时不允许发布（避免发布出空组件文件）
        if (!form.code || form.code.trim().length === 0) {
            alert("组件代码为空。请先编写组件代码，或点击「重置为模板」。");
            return;
        }

        setLoading(true);
        try {
            const entry = buildRegistryEntry(form);
            const nextRegistry = injectLabIntoRegistry(registryRaw, entry);

            const files: { path: string; content: string; isBase64?: boolean }[] = [];

            // 1) 写组件（必写）
            const codeFinal = ensureUseClient(form.code);
            files.push({
                path: `labs/${form.slug}/index.tsx`,
                content: codeFinal,
            });

            // 2) 写 doc（可选；混合模式推荐写）
            const docFile = buildLabDocFile(form);
            const shouldWriteDoc =
                (form.mode === "hybrid" && docFile.trim().length > 0) ||
                (form.mode === "fullscreen" && form.doc.trim().length > 0);

            if (shouldWriteDoc) {
                files.push({
                    path: `content/labs/${form.slug}.md`,
                    content: docFile,
                });
            }

            // 3) 更新 registry（必写）
            files.push({
                path: "labs/_registry.ts",
                content: nextRegistry,
            });

            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files }),
            });

            if (!res.ok) throw new Error(await res.text());

            alert("发布成功！等待 Vercel 新部署完成后即可访问。");
            router.push(`/labs/${form.slug}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "提交失败";
            alert("错误: " + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-6xl px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">发布代码实验室 (Labs)</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        发布后将提交到 GitHub，并触发 Vercel 新部署；新页面将出现在{" "}
                        <span className="font-mono">{`/labs/{slug}`}</span>。
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-md disabled:opacity-50"
                >
                    {loading ? "发布中..." : "发布到 GitHub"}
                </button>
            </div>

            {/* 基础信息 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={handleTitleChange}
                            placeholder="例如：FIRE 计算器"
                            className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            Slug
                            {slugConflict && (
                                <span className="text-xs text-red-500 font-mono">已存在</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                            placeholder="例如：fire-calculator"
                            className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="一句话说明这个实验做什么"
                            className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags（逗号分隔）</label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                            placeholder="例如：React, Tool, Finance"
                            className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                            className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">模式</label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => handleModeChange("hybrid")}
                                className={`px-3 py-2 rounded border text-sm ${form.mode === "hybrid"
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "border-neutral-200 dark:border-neutral-800"
                                    }`}
                            >
                                混合模式（组件 + 文档）
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange("fullscreen")}
                                className={`px-3 py-2 rounded border text-sm ${form.mode === "fullscreen"
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "border-neutral-200 dark:border-neutral-800"
                                    }`}
                            >
                                纯 React 全屏模式
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500">
                            说明：前台通过 <span className="font-mono">fullScreen</span> 控制舞台高度与布局。
                        </p>
                    </div>
                </div>

                <div className="pt-2 text-xs text-neutral-500 space-y-1">
                    <div>
                        组件加载路径：
                        <span className="font-mono ml-2">{`import(@/labs/{slug}/index)`}</span>
                    </div>
                    <div>
                        文档路径：
                        <span className="font-mono ml-2">{`content/labs/{slug}.md`}</span>
                    </div>
                </div>
            </div>

            {/* 组件代码 */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-3">
                <div className="flex items-end justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-lg font-semibold">
                            组件代码（{`labs/${form.slug || "slug"}/index.tsx`}）
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                            注意：Lab 组件为 Client Component。发布时会自动补{" "}
                            <span className="font-mono">&quot;use client&quot;</span>。
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            默认情况下这里是空的；请自行编写，或点击右侧「重置为模板」生成示例。
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="text-xs font-mono px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800"
                            onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    code: ensureUseClient(p.code),
                                }))
                            }
                        >
                            一键补 use client
                        </button>

                        <button
                            type="button"
                            className="text-xs font-mono px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800"
                            onClick={() =>
                                setForm((p) => ({
                                    ...p,
                                    code: defaultCodeTemplate(p.slug || "your-lab-slug", p.mode),
                                }))
                            }
                        >
                            重置为模板
                        </button>
                    </div>
                </div>

                <SimpleCodeEditor
                    value={form.code}
                    onChange={(next) => setForm((p) => ({ ...p, code: next }))}
                    placeholder={`// 默认为空：请编写组件代码，或点击“重置为模板”\n\n"use client";\n\nexport default function Lab(){\n  return <div />\n}`}
                />

                <p className="text-xs text-neutral-500">
                    小贴士：全屏模式建议根节点 <span className="font-mono">w-full h-full</span>。
                </p>
            </div>

            {/* 文档（Markdown） */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-3">
                <div className="flex items-end justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-lg font-semibold">
                            实验文档（{`content/labs/${form.slug || "slug"}.md`}）
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                            混合模式推荐填写；全屏模式可留空（留空不会写入 md 文件）。
                        </p>
                    </div>

                    <button
                        type="button"
                        className="text-xs font-mono px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800"
                        onClick={() => setForm((p) => ({ ...p, doc: defaultDocTemplate(p.mode) }))}
                    >
                        生成文档模板
                    </button>
                </div>

                <MarkdownEditor
                    value={form.doc}
                    onChange={(text) => setForm((p) => ({ ...p, doc: text }))}
                />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs text-neutral-500">
                    {slugConflict ? (
                        <span className="text-red-500 font-mono">
                            Slug 冲突：{form.slug}
                        </span>
                    ) : (
                        <span>
                            将写入：
                            <span className="font-mono ml-2">{`labs/${form.slug || "{slug}"}/index.tsx`}</span>
                            <span className="font-mono ml-2">{`content/labs/${form.slug || "{slug}"}.md`}</span>
                            <span className="font-mono ml-2">{`labs/_registry.ts`}</span>
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-md disabled:opacity-50"
                >
                    {loading ? "发布中..." : "发布到 GitHub"}
                </button>
            </div>
        </div>
    );
}
