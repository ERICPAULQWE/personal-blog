"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, Folder, X } from "lucide-react"; // 删除了未使用的 CheckCircle2, AlertCircle
import { useRouter } from "next/navigation";

interface FileItem {
    file: File;
    path: string;
    type: 'markdown' | 'image';
}

export default function ObsidianImport() {
    const [targetDir, setTargetDir] = useState("学习/");
    const [files, setFiles] = useState<FileItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            path: "",
            type: (file.name.endsWith('.md') ? 'markdown' : 'image') as 'markdown' | 'image'
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);

        try {
            const payload: { path: string, content: string, isBase64?: boolean }[] = [];
            const mdFiles = files.filter(f => f.type === 'markdown');
            const imgFiles = files.filter(f => f.type === 'image');

            for (const mdItem of mdFiles) {
                const content = await mdItem.file.text(); // 改为 const
                const noteName = mdItem.file.name.replace(".md", "");

                const cleanDir = targetDir.endsWith('/') ? targetDir : targetDir + '/';
                const mdPath = `content/notes/${cleanDir}${mdItem.file.name}`;
                const assetSubDir = `${cleanDir}${noteName}/`;

                payload.push({ path: mdPath, content });

                for (const imgItem of imgFiles) {
                    if (content.includes(imgItem.file.name)) {
                        const reader = new FileReader();
                        const base64Promise = new Promise<string>((resolve) => {
                            reader.onload = () => {
                                const base64 = (reader.result as string).split(',')[1];
                                resolve(base64);
                            };
                            reader.readAsDataURL(imgItem.file);
                        });
                        const base64Content = await base64Promise;
                        payload.push({
                            path: `content/notes/${assetSubDir}${imgItem.file.name}`,
                            content: base64Content,
                            isBase64: true
                        });
                    }
                }
            }

            const res = await fetch("/api/admin/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files: payload }),
            });

            if (!res.ok) throw new Error(await res.text());

            alert("发布成功！");
            router.push("/notes");
        } catch (error: unknown) { // 改为 unknown
            const message = error instanceof Error ? error.message : "未知错误";
            alert("错误: " + message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl px-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileUp className="w-6 h-6" /> Obsidian 批量导入
            </h1>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                        <Folder className="w-4 h-4" /> 保存至目录 (content/notes/...)
                    </label>
                    <input
                        type="text"
                        value={targetDir}
                        onChange={(e) => setTargetDir(e.target.value)}
                        placeholder="例如: 学习/算法/"
                        className="w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent"
                    />
                </div>

                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
                        isDragActive ? "border-blue-500 bg-blue-50/50" : "border-neutral-200 dark:border-neutral-800"
                    )}
                >
                    <input {...getInputProps()} />
                    <FileUp className="w-10 h-10 mx-auto mb-4 text-neutral-400" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                        将 Obsidian 的 .md 文件和图片拖入此处
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto border-t pt-4">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                                <span className="flex items-center gap-2">
                                    {f.type === 'markdown' ? "📄" : "🖼️"} {f.file.name}
                                </span>
                                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                    <X className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-xl font-bold disabled:opacity-50 transition-transform"
                >
                    {uploading ? "正在上传..." : `确认发布 ${files.length} 个文件`}
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) { // 修复 any
    return classes.filter(Boolean).join(' ');
}