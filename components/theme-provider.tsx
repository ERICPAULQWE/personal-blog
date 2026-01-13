"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react"; // 新增
import { Moon, Sun } from "lucide-react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        // 新增 SessionProvider 包裹，否则 site-header 会报错
        <SessionProvider>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
        </SessionProvider>
    );
}

// 保持你之前的 ThemeToggle 不变
export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
        >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
        </button>
    );
}