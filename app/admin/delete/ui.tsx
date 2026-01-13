"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TreeNode } from "@/lib/tree";
import {
    SelectableNoteTree,
    type SelectedNode,
} from "@/components/admin/selectable-note-tree";

type DeleteTarget = {
    type: "file" | "dir" | "";
    path: string;      // 传给 API 的 path
    display: string;   // UI 显示
    extra?: string;    // file 时的资源目录提示
};

type DeleteApiResponse = {
    success: boolean;
    mode: "file" | "dir";
    deleted: string[];
    skipped: string[];
    assetDir?: string;
    dirPath?: string;
};

export default function AdminDeleteClient({ tree }: { tree: TreeNode[] }) {
    const router = useRouter();

    const [selected, setSelected] = useState<SelectedNode | undefined>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeleteApiResponse | null>(null);

    const target: DeleteTarget = useMemo(() => {
        if (!selected) return { type: "", path: "", display: "（未选择）" };

        if (selected.type === "file") {
            const mdPath = `content/notes/${selected.slug}.md`;
            const assetDir = `content/notes/${selected.slug}/`;
            return { type: "file", path: mdPath, display: mdPath, extra: assetDir };
        }

        const dirPath = `content/notes/${selected.slug}`;
        return {
            type: "dir",
            path: dirPath,
            display: dirPath.endsWith("/") ? dirPath : `${dirPath}/`,
        };
    }, [selected]);

    const confirmMessage = useMemo(() => {
        if (!selected || !target.type) return "";

        if (target.type === "file") {
            return [
                "确认删除这篇笔记？",
                "",
                `- ${target.path}`,
                target.extra ? `- 同名资源目录：${target.extra}` : "",
                "",
                "此操作不可撤销。",
            ]
                .filter(Boolean)
                .join("\n");
        }

        return [
            "确认删除该文件夹及其全部内容？",
            "",
            `- ${target.display}`,
            "",
            "将递归删除该目录下所有文件和子目录中的文件。",
            "此操作不可撤销。",
        ].join("\n");
    }, [selected, target]);

    const handleDelete = async () => {
        if (!selected || !target.type || !target.path) {
            alert("请先在左侧选择一个文件或文件夹");
            return;
        }

        const ok = confirm(confirmMessage);
        if (!ok) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: target.path, type: target.type }),
            });

            if (!res.ok) throw new Error(await res.text());

            const data = (await res.json()) as DeleteApiResponse;
            setResult(data);

            alert("删除完成！");
            router.refresh();
            router.push("/notes");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "删除失败";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen px-4 py-6 md:px-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* 左侧：树 */}
                <aside
                    className="w-full md:w-72 shrink-0 sticky top-24 self-start border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white/50 dark:bg-neutral-900/50"
                    style={{ height: "calc(100vh - 6rem)" }}
                >
                    <div className="mb-3">
                        <h2 className="font-semibold text-xs text-neutral-400 uppercase tracking-widest">
                            Notes Tree
                        </h2>
                        <p className="text-xs text-neutral-500 mt-1">
                            文件：点击选中；文件夹：点右侧“选择”
                        </p>
                    </div>

                    <div className="overflow-y-auto h-[calc(100%-3rem)] pr-1">
                        <SelectableNoteTree
                            tree={tree}
                            selected={selected}
                            onSelect={setSelected}
                        />
                    </div>
                </aside>

                {/* 右侧：详情 + 删除按钮 */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl space-y-4">
                        <h1 className="text-2xl font-bold">删除内容</h1>

                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
                            <div className="text-sm text-neutral-500">已选中</div>

                            <div className="mt-1 font-mono text-sm break-all">
                                {target.display}
                            </div>

                            {target.type === "file" && target.extra && (
                                <div className="mt-2 text-xs text-neutral-500 break-all">
                                    将同时删除资源目录：<code>{target.extra}</code>
                                </div>
                            )}

                            {target.type === "dir" && (
                                <div className="mt-2 text-xs text-red-600">
                                    注意：文件夹删除会递归清空该目录下所有内容（高风险操作）。
                                </div>
                            )}

                            <button
                                onClick={handleDelete}
                                disabled={!target.type || loading}
                                className="mt-4 w-full bg-red-600 text-white py-3 rounded-lg disabled:opacity-50"
                            >
                                {loading
                                    ? "删除中..."
                                    : target.type === "file"
                                        ? "一键删除（笔记 + 图片目录）"
                                        : "一键删除（整个文件夹）"}
                            </button>

                            <p className="text-xs text-neutral-500 mt-3">
                                API 端有安全保护：仅允许删除 <code>content/notes/</code> 目录下的内容。
                            </p>
                        </div>

                        {result && (
                            <pre className="text-xs p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 overflow-auto border border-neutral-200 dark:border-neutral-800">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
