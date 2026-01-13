"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import * as React from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
    ssr: false,
    loading: () => <div className="h-[600px] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
});

interface EditorProps {
    value: string;
    onChange: (text: string) => void;
}

export default function MarkdownEditor({ value, onChange }: EditorProps) {
    return (
        <div data-color-mode="auto">
            <MDEditor
                value={value}
                onChange={(val?: string) => onChange(val || "")}
                height={600}
                className="rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800"
                previewOptions={{
                    components: {
                        // 修复：直接解构需要的属性，完全移除 node 及其 any 类型
                        img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
                            if (!props.src) return null;
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img {...props} alt={props.alt || ""} style={{ maxWidth: "100%" }} />;
                        },
                    },
                }}
            />
        </div>
    );
}