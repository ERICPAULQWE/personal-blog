"use client";

import * as React from "react";
import { motion } from "framer-motion";

type Props = {
    checked: boolean;
    onCheckedChange: (next: boolean) => void;
    disabled?: boolean;
    /** 可选：用于 a11y */
    "aria-label"?: string;
};

export function IosSwitch({
    checked,
    onCheckedChange,
    disabled = false,
    "aria-label": ariaLabel = "Toggle",
}: Props) {
    return (
        <motion.button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            whileTap={!disabled ? { scale: 0.96 } : undefined}
            transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.7 }}
            className={[
                "relative inline-flex items-center",
                "h-7 w-12 rounded-full p-[3px]",
                "border border-neutral-200/70 dark:border-neutral-800/70",
                "shadow-[0_6px_18px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_22px_rgba(0,0,0,0.35)]",
                "backdrop-blur-xl",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 dark:focus-visible:ring-white/15",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                checked ? "shadow-[0_10px_28px_rgba(52,199,89,0.25)]" : ""
            ].join(" ")}
        >
            {/* Track（带渐变/高光，iOS 感） */}
            <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full"
                animate={{
                    backgroundColor: checked ? "rgba(52, 199, 89, 0.95)" : "rgba(120, 120, 128, 0.22)",
                }}
                transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.7 }}
            />

            {/* 轻微高光（模拟 iOS 玻璃感） */}
            <div
                aria-hidden
                className="absolute inset-[1px] rounded-full opacity-70"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0.05))",
                }}
            />

            {/* Knob */}
            <motion.span
                aria-hidden
                className={[
                    "relative z-10 block h-6 w-6 rounded-full",
                    "bg-white",
                    "shadow-[0_8px_18px_rgba(0,0,0,0.18)]",
                ].join(" ")}
                animate={{ x: checked ? 18 : 0 }}
                transition={{ type: "spring", stiffness: 720, damping: 40, mass: 0.6 }}
            >
                {/* knob 内部的小高光 */}
                <span
                    className="absolute inset-0 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.25) 55%, rgba(255,255,255,0) 70%)",
                    }}
                />
            </motion.span>
        </motion.button>
    );
}
