"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { RefreshCcw } from "lucide-react";

export function LabStageImmersive({ slug }: { slug: string }) {
    const DynamicComponent = useMemo(() => {
        return dynamic(
            () =>
                import(`@/labs/${slug}/index`).catch((err) => {
                    console.error("Dynamic Import Error:", err);
                    return {
                        default: function ErrorDisplay() {
                            return (
                                <div className="w-full rounded-xl border border-red-200 bg-red-50/50 p-6 text-red-600">
                                    <p className="font-mono text-sm">Component not found</p>
                                    <p className="text-xs opacity-60">labs/{slug}/index.tsx</p>
                                </div>
                            );
                        },
                    };
                }),
            {
                loading: function LoadingSpinner() {
                    return (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-400 animate-pulse">
                            <RefreshCcw className="h-6 w-6 animate-spin" />
                            <span className="text-xs font-mono">Loading experiment...</span>
                        </div>
                    );
                },
                ssr: false,
            }
        );
    }, [slug]);

    return <DynamicComponent />;
}
