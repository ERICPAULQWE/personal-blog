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
            <body className="relative min-h-screen">
                <ThemeProvider>
                    {/* 背景氛围层：顶部氛围光 + 低频网格 */}
                    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                        {/* 浅色模式下的淡紫色氛围光，深色模式下自动减弱 */}
                        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px] dark:bg-blue-600/10" />
                        <div className="absolute top-[10%] -right-[10%] h-[35%] w-[35%] rounded-full bg-purple-500/5 blur-[120px] dark:bg-purple-600/10" />

                        {/* 极细微网格背景 */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)]" />
                    </div>

                    <SiteHeader />

                    {/* 增加页面入场动画容器 */}
                    <main className="mx-auto min-h-[calc(100vh-120px)] max-w-5xl px-6 py-16 md:py-24">
                        {children}
                    </main>

                    <footer className="border-t border-neutral-200/50 py-12 text-sm text-neutral-500 dark:border-neutral-800/50 dark:text-neutral-400">
                        <div className="mx-auto max-w-5xl px-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium">© {new Date().getFullYear()} ERICPAULQWE</p>
                                    <p className="text-xs opacity-70">记录思考，实验未来。</p>
                                </div>
                                <p className="text-xs font-mono opacity-60">Built with Next.js & Vercel</p>
                            </div>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
