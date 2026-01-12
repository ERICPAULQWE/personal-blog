"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export default function CounterLab() {
    const [count, setCount] = useState(0);

    const vibe = useMemo(() => {
        if (count <= 0) return "calm";
        if (count < 10) return "warm";
        return "electric";
    }, [count]);

    return (
        <div className="rounded-2xl border border-neutral-200/70 p-6 dark:border-neutral-800/70">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Counter Lab</h2>
                    <p className="prose-base text-sm">
                        一个稳定的交互页面骨架：状态 + 动效 + 组件化。
                    </p>
                </div>

                <motion.div
                    key={count}
                    initial={{ scale: 0.9, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl font-semibold tabular-nums"
                >
                    {count}
                </motion.div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <button
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40"
                    onClick={() => setCount((c) => c - 1)}
                >
                    -1
                </button>
                <button
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40"
                    onClick={() => setCount((c) => c + 1)}
                >
                    +1
                </button>
                <button
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/40"
                    onClick={() => setCount(0)}
                >
                    Reset
                </button>
            </div>

            <div className="mt-5 text-sm text-neutral-600 dark:text-neutral-400">
                vibe: <span className="font-medium">{vibe}</span>
            </div>
        </div>
    );
}
