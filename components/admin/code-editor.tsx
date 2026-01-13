"use client";

import dynamic from "next/dynamic";
import * as React from "react";

// 这个包是“textarea + 语法高亮覆盖层”，非常轻量
// 注意：它自己的样式文件有的版本需要引入，有的版本不需要；
// 如果你发现样式没生效，再取消注释 CSS 引入即可。
// import "@uiw/react-textarea-code-editor/dist.css";

const CodeEditor = dynamic(() => import("@uiw/react-textarea-code-editor"), {
    ssr: false,
    loading: () => (
        <div className="h-[520px] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
    ),
});

type Props = {
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
};

export default function SimpleCodeEditor({ value, onChange, placeholder }: Props) {
    return (
        <div className="rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <CodeEditor
                value={value}
                language="tsx"
                placeholder={placeholder}
                onChange={(evn: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onChange(evn.target.value)
                }
                padding={16}
                style={{
                    fontSize: 13,
                    fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    minHeight: 520,
                    backgroundColor: "transparent",
                }}
            />
        </div>
    );
}
