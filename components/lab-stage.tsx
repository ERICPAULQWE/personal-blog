"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw } from "lucide-react";

interface LabStageProps {
    slug: string;
}

export function LabStage({ slug }: LabStageProps) {
    // 使用 useMemo 确保只在 slug 变化时重新创建组件定义
    const DynamicComponent = useMemo(() => {
        return dynamic(
            () =>
                import(`@/labs/${slug}/index`)
                    .catch((err) => {
                        console.error("Dynamic Import Error:", err);

                        // 【关键修复】React.lazy 要求必须返回 { default: Component } 结构
                        // 之前的代码直接返回了函数，导致了 "Element type is invalid" 报错
                        return {
                            default: function ErrorDisplay() {
                                return (
                                    <div className="flex flex-col items-center justify-center h-32 text-red-500 bg-red-50/50 rounded-xl border border-red-200">
                                        <p className="font-mono text-sm">Component not found</p>
                                        <p className="text-xs opacity-60">labs/{slug}/index.tsx</p>
                                    </div>
                                );
                            }
                        };
                    }),
            {
                loading: function LoadingSpinner() {
                    return (
                        <div className="flex flex-col items-center gap-2 text-neutral-400 animate-pulse">
                            <RefreshCcw className="h-6 w-6 animate-spin" />
                            <span className="text-xs font-mono">Loading experiment...</span>
                        </div>
                    );
                },
                ssr: false,
            }
        );
    }, [slug]);

    return (
        <div className="w-full h-full flex justify-center">
            <DynamicComponent />
        </div>
    );
}