"use client";

import { useState } from "react";
import { Settings2, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useReadingSettings } from "./use-reading-settings";
import { FontSizeStep, LineHeightStep, ReadingFont } from "@/lib/reading-settings";
import { AnimatePresence, motion } from "framer-motion";
import { IosSwitch } from "@/components/ui/ios-switch";
import { useImmersive } from "./immersive-context";

export function ReadingToolbar() {
    const { immersive } = useImmersive();

    // ✅ Hooks 必须始终以同样顺序执行：不能放在 return null 后面
    const [open, setOpen] = useState(false);
    const { settings, setSettings, reset } = useReadingSettings();

    if (immersive) return null;

    return (
        <div className="fixed bottom-6 right-6 w-[360px] flex flex-col items-end">
            {/* 展开内容：悬浮工具条（不是“弹窗/浮层”那种） */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="reading-toolbar-panel"
                        initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
                        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
                        className="
        mb-3 w-[360px] rounded-3xl p-3
        border border-neutral-200/60 dark:border-neutral-800/70
        bg-white/85 dark:bg-neutral-950/70
        backdrop-blur-xl
        shadow-2xl shadow-black/10 dark:shadow-black/40
      "
                    >
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                阅读设置
                            </div>

                            <button
                                onClick={reset}
                                className="
            inline-flex items-center gap-1 rounded-xl px-2 py-1
            text-xs text-neutral-600 dark:text-neutral-300
            hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60
            transition-colors
          "
                                type="button"
                                title="恢复默认"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                默认
                            </button>
                        </div>

                        {/* 字号 */}
                        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/40 p-3">
                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 mb-2">
                                <span>字体大小</span>
                                <span className="font-mono">{settings.fontSize}/5</span>
                            </div>
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[settings.fontSize]}
                                onValueChange={(v) =>
                                    setSettings((p) => ({ ...p, fontSize: v[0] as FontSizeStep }))
                                }
                                onValueCommit={(v) =>
                                    setSettings((p) => ({ ...p, fontSize: v[0] as FontSizeStep }))
                                }
                            />
                            <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
                                <span>小</span><span>默认</span><span>大</span>
                            </div>
                        </div>

                        <div className="h-2.5" />

                        {/* 行距 */}
                        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/40 p-3">
                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 mb-2">
                                <span>行距</span>
                                <span className="font-mono">{settings.lineHeight}/5</span>
                            </div>
                            <Slider
                                min={1}
                                max={5}
                                step={1}
                                value={[settings.lineHeight]}
                                onValueChange={(v) =>
                                    setSettings((p) => ({ ...p, lineHeight: v[0] as LineHeightStep }))
                                }
                                onValueCommit={(v) =>
                                    setSettings((p) => ({ ...p, lineHeight: v[0] as LineHeightStep }))
                                }
                            />
                            <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
                                <span>紧凑</span><span>默认</span><span>宽松</span>
                            </div>
                        </div>

                        <div className="h-2.5" />

                        {/* 字体 */}
                        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/40 p-3">
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-2">
                                字体
                            </div>

                            <Select
                                value={settings.font}
                                onValueChange={(v) => setSettings((p) => ({ ...p, font: v as ReadingFont }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择字体" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">系统（推荐）</SelectItem>
                                    <SelectItem value="hei">黑体</SelectItem>
                                    <SelectItem value="song">宋体</SelectItem>
                                    <SelectItem value="kai">楷体</SelectItem>
                                    <SelectItem value="serif">衬线</SelectItem>
                                    <SelectItem value="mono">等宽</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* 自动上色 */}
                        <div className="h-2.5" />
                        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/40 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-xs text-neutral-700 dark:text-neutral-200">
                                        Markdown 自动上色
                                    </div>
                                    <div className="mt-1 text-[10px] text-neutral-400">
                                        H3 蓝 / H4 紫 / H5 深绿，Strong 粉红
                                    </div>
                                </div>

                                <IosSwitch
                                    checked={settings.mdAutoColor}
                                    onCheckedChange={(next) =>
                                        setSettings((p) => ({ ...p, mdAutoColor: next }))
                                    }
                                    aria-label="Markdown 自动上色"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* 折叠按钮：胶囊（Apple-like） */}
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="阅读设置"
                // 悬停：轻微上浮
                whileHover={{ y: -1 }}
                // 按下：轻微收缩
                whileTap={{ scale: 0.97 }}
                transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 32,
                    mass: 0.7,
                }}
                className="
                            inline-flex items-center gap-2 rounded-2xl px-3 py-2
                            border border-neutral-200/60 dark:border-neutral-800/70
                            bg-white/70 dark:bg-neutral-900/60
                            backdrop-blur-xl
                            shadow-lg shadow-black/5 dark:shadow-black/30
                            text-sm font-medium
                            text-neutral-800 dark:text-neutral-100
                            hover:bg-white/80 dark:hover:bg-neutral-900/75
                            focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-neutral-900/15
                            dark:focus-visible:ring-white/15
                            transition-colors
                          "
            >
                {/* icon：略微缩放以显得更“实心” */}
                <Settings2 className="h-4 w-4 opacity-80 scale-[1.02]" />
                <span>阅读设置</span>
            </motion.button>
        </div>
    );
}