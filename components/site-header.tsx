"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Search, Lock, TerminalSquare } from "lucide-react"; // 新增图标
import { useTheme } from "next-themes";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // 新增 Hook

const nav = [
    { href: "/", label: "Home" },
    { href: "/notes", label: "Notes" },
    { href: "/labs", label: "Labs" },
    { href: "/tags", label: "Tags" },
    { href: "/archive", label: "Archive" },
    { href: "/about", label: "About" },
];

export function SiteHeader() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    // 新增：获取登录状态
    const { data: session } = useSession();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                scrolled ? "py-3" : "py-5"
            )}
        >
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
                {/* Logo 部分 (保持不变) */}
                <Link
                    href="/"
                    className="group flex items-center gap-2 font-bold tracking-tight text-lg"
                >
                    <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white dark:bg-white dark:text-black transition-transform group-hover:scale-110">
                        E
                    </div>
                    <span className="hidden sm:inline-block text-neutral-900 dark:text-white">
                        ERIC&apos;s Notes
                    </span>
                </Link>

                {/* 悬浮灵动岛导航中心 (保持不变) */}
                <nav className="glass flex items-center gap-1 rounded-full px-2 py-1.5 shadow-sm">
                    {nav.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 md:text-sm",
                                    "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white",
                                    active && "text-neutral-900 dark:text-white"
                                )}
                            >
                                {active && (
                                    <div className="absolute inset-0 -z-10 rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
                                )}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* 右侧功能区：新增 Admin -> 搜索 -> 主题 */}
                <div className="flex items-center gap-2">
                    {/* --- 新增：登录/控制台按钮 --- */}
                    {/* 样式完全复用 Search 按钮的样式，保持统一 */}
                    {session ? (
                        <Link
                            href="/admin"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
                            title="控制台"
                        >
                            <TerminalSquare className="h-[18px] w-[18px] text-neutral-500 dark:text-neutral-400" />
                        </Link>
                    ) : (
                        <Link
                            href="/api/auth/signin"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
                            title="管理员登录"
                        >
                            <Lock className="h-[18px] w-[18px] text-neutral-500 dark:text-neutral-400" />
                        </Link>
                    )}

                    {/* 搜索按钮 (保持不变) */}
                    <Link
                        href="/search"
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800",
                            pathname === "/search" && "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                        )}
                        aria-label="Search"
                    >
                        <Search className="h-[18px] w-[18px] text-neutral-500 dark:text-neutral-400" />
                    </Link>

                    {/* 主题切换按钮 (保持不变) */}
                    <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/50 bg-white/50 transition-all hover:bg-white hover:shadow-md dark:border-neutral-800/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-800"
                        aria-label="Toggle theme"
                    >
                        <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                        <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                    </button>
                </div>
            </div>
        </header>
    );
}