"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Moon, Sun } from "lucide-react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        // SessionProvider 需要包裹，保持你原本逻辑
        <SessionProvider>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            // storageKey 默认就是 "theme"，不写也会持久化；写上更显式也可以：
            // storageKey="theme"
            >
                {children}
            </NextThemesProvider>
        </SessionProvider>
    );
}

/**
 * 真·全局主题切换按钮：
 * - 默认跟随系统（theme === "system"）
 * - 点击后强制 light/dark，并持久化
 * - 用 resolvedTheme 让 system 模式下也能正确判断当前实际主题
 */
export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // 避免 hydration mismatch：在客户端挂载前先不渲染图标状态
    if (!mounted) {
        return (
            <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
                aria-label="Toggle theme"
            />
        );
    }

    const current = resolvedTheme; // "light" | "dark"
    const toggleTheme = () => {
        setTheme(current === "dark" ? "light" : "dark");
    };

    // 可选：给个更准确的 aria-label（尤其 theme === system 时）
    const label =
        theme === "system"
            ? `Toggle theme (system, currently ${current})`
            : `Toggle theme (currently ${current})`;

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
            aria-label={label}
        >
            {/* 用 resolvedTheme 来决定显示哪个图标（更直观、更不容易错） */}
            {current === "dark" ? (
                <Moon className="h-[18px] w-[18px] text-blue-400" />
            ) : (
                <Sun className="h-[18px] w-[18px] text-amber-500" />
            )}
        </button>
    );
}
