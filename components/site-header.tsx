"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../lib/utils";

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

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/60">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="font-semibold tracking-tight">
                    ERIC&apos;s Notes
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {nav.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-sm transition",
                                    "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900",
                                    active &&
                                    "bg-neutral-100 text-neutral-950 dark:bg-neutral-900 dark:text-white"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative inline-flex items-center justify-center rounded-full border border-neutral-200 p-2 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    aria-label="Toggle theme"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </button>
            </div>
        </header>
    );
}
