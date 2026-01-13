"use client";

import { useState } from "react";
import MarkdownEditor from "@/components/admin/md-editor";
import { useRouter } from "next/navigation";

interface FormData {
    title: string;
    slug: string;
    description: string;
    tags: string;
    content: string;
}

export default function WritePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<FormData>({
        title: "",
        slug: "",
        description: "",
        tags: "",
        content: "# Hello World",
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-\u4e00-\u9fa5]/g, "");
        setForm((prev) => ({ ...prev, title, slug: prev.slug || slug }));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.slug || !form.content) {
            alert("请填写完整信息！");
            return;
        }

        setLoading(true);
        try {
            const fileContent = `---
title: "${form.title}"
date: "${new Date().toISOString().split("T")[0]}"
description: "${form.description}"
tags: [${form.tags.split(",").map((t) => `"${t.trim()}"`).join(", ")}]
---

${form.content}`;

            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [{
                        path: `content/notes/${form.slug}.md`,
                        content: fileContent
                    }]
                }),
            });

            if (!res.ok) throw new Error(await res.text());

            alert("发布成功！");
            router.push("/notes");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "提交失败";
            alert("错误: " + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-5xl px-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">写新文章</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-md disabled:opacity-50"
                >
                    {loading ? "发布中..." : "发布到 GitHub"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">标题</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={handleTitleChange}
                        className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full p-2 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent font-mono text-sm"
                    />
                </div>
            </div>

            <div className="pt-4">
                <MarkdownEditor value={form.content} onChange={(text) => setForm({ ...form, content: text })} />
            </div>
        </div>
    );
}