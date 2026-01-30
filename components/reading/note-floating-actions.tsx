"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Maximize2, Minimize2 } from "lucide-react";
import { useImmersive } from "./immersive-context";
import { useState } from "react";
import { NoteSearch } from "./note-search";

export function NoteFloatingActions() {
    const { immersive, toggle } = useImmersive();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            {/* ✅ 右上角悬浮操作区 */}
            <div className="fixed right-6 top-6 z-[60] flex gap-2">
                {/* 沉浸模式 */}
                <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={toggle}
                    className="
                        glass h-10 w-10 rounded-2xl
                        flex items-center justify-center
                        border border-neutral-200/60
                        bg-white/70
                        backdrop-blur-xl
                        shadow-sm
                        hover:bg-white/85
                        transition
                    "
                    aria-label="沉浸模式"
                    title="沉浸模式"
                >
                    {immersive ? (
                        <Minimize2 className="h-4 w-4" />
                    ) : (
                        <Maximize2 className="h-4 w-4" />
                    )}
                </motion.button>

                {/* 当前文章搜索 */}
                <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSearchOpen((v) => !v)}
                    className="
                        glass h-10 w-10 rounded-2xl
                        flex items-center justify-center
                        border border-neutral-200/60
                        bg-white/70
                        backdrop-blur-xl
                        shadow-sm
                        hover:bg-white/85
                        transition
                    "
                    aria-label="搜索当前文章"
                    title="搜索当前文章"
                >
                    <Search className="h-4 w-4" />
                </motion.button>
            </div>

            {/* 搜索弹层 */}
            <AnimatePresence>
                {searchOpen && (
                    <NoteSearch onClose={() => setSearchOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}