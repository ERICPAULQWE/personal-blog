import Link from "next/link";

export default function HomePage() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                    学习笔记 & 交互实验室
                </h1>
                <p className="prose-base max-w-2xl">
                    这里用于沉淀 Obsidian 笔记（Markdown）以及由 Gemini/ChatGPT 生成的 React
                    交互页面（Labs）。目标是：时尚高级、交互高级、发布维护轻松。
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <Link
                    href="/notes"
                    className="group rounded-2xl border border-neutral-200/70 p-5 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                >
                    <h2 className="text-lg font-semibold">Notes</h2>
                    <p className="prose-base mt-2">
                        学习笔记、知识总结、可检索归档（Markdown/MDX）。
                    </p>
                    <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                        进入 Notes →
                    </p>
                </Link>

                <Link
                    href="/labs"
                    className="group rounded-2xl border border-neutral-200/70 p-5 transition hover:bg-neutral-50 dark:border-neutral-800/70 dark:hover:bg-neutral-900/40"
                >
                    <h2 className="text-lg font-semibold">Labs</h2>
                    <p className="prose-base mt-2">
                        交互式页面、可视化 demo、小工具与实验（React/MDX）。
                    </p>
                    <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                        进入 Labs →
                    </p>
                </Link>
            </section>

            <section className="rounded-2xl border border-neutral-200/70 p-5 dark:border-neutral-800/70">
                <h3 className="text-base font-semibold">接下来要做的</h3>
                <ul className="prose-base mt-3 list-disc space-y-1 pl-5">
                    <li>接入内容系统：从 content/notes 和 content/labs 读取 Markdown/MDX</li>
                    <li>支持 Obsidian 常用语法 + LaTeX 公式渲染</li>
                    <li>生成 Tags / Archive / Search</li>
                    <li>接入 GitHub 登录评论（Giscus）</li>
                </ul>
            </section>
        </div>
    );
}