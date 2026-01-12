import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "../components/theme-provider";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
    title: "ERIC's Blog",
    description: "Learning notes & interactive labs.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <body>
                <ThemeProvider>
                    <SiteHeader />
                    <main className="mx-auto min-h-[calc(100vh-56px)] max-w-6xl px-4 py-10">
                        {children}
                    </main>
                    <footer className="border-t border-neutral-200/60 py-10 text-sm text-neutral-600 dark:border-neutral-800/60 dark:text-neutral-400">
                        <div className="mx-auto max-w-6xl px-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <p>© {new Date().getFullYear()} ERICPAULQWE</p>
                                <p className="opacity-80">Built with Next.js + Vercel</p>
                            </div>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
