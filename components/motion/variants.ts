// components/motion/variants.ts
"use client";

import type { Variants } from "framer-motion";

// 这些参数直接复用 Home 的动画变体（见 app/page.tsx）
// staggerContainer / fadeInUp / heroSlideRight / heroSlideLeft / heroSlideUp
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 40,
            damping: 15,
            mass: 1,
        },
    },
};

export const heroSlideRight: Variants = {
    hidden: { opacity: 0, x: -60 },
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
};

export const heroSlideLeft: Variants = {
    hidden: { opacity: 0, x: 60 },
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
};

export const heroSlideUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
    },
};
