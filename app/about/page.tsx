import { Github, Mail, Twitter, MapPin, Code2, Cpu, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    const skills = [
        { name: "React / Next.js", icon: <Code2 className="h-4 w-4" /> },
        { name: "TypeScript", icon: <Cpu className="h-4 w-4" /> },
        { name: "Obsidian Workflow", icon: <Globe className="h-4 w-4" /> },
    ];

    return (
        <div className="mx-auto max-w-4xl space-y-10 pb-20">
            {/* 顶部个人名片区域 */}
            <section className="flex flex-col items-center text-center space-y-4 py-10">
                <div className="relative group">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
                    <div className="relative h-28 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-4xl font-bold glass">
                        E
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">ERICPAULQWE</h1>
                    <p className="text-neutral-500 flex items-center justify-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5" /> 开发者 · 学习者 · 记录者
                    </p>
                </div>
            </section>

            {/* Bento 风格详细信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 自我介绍 - 占据 2x1 */}
                <div className="md:col-span-2 rounded-3xl glass p-8 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">关于我</h2>
                    <div className="prose-base dark:prose-invert text-neutral-600 dark:text-neutral-300 space-y-4">
                        <p>
                            你好！我是 ERIC。这是一个用来沉淀技术笔记和记录交互实验的数字花园。
                        </p>
                        <p>
                            我追求极简且高效的工作流，目前深度依赖 Obsidian 进行知识建模，并尝试通过这个站点将静态的知识转化为动态的交互体验。
                        </p>
                    </div>
                </div>

                {/* 社交链接 - 占据 1x1 */}
                <div className="rounded-3xl glass p-8 flex flex-col justify-between">
                    <h2 className="text-xl font-bold">联络方式</h2>
                    <div className="space-y-3">
                        <Link href="https://github.com" className="flex items-center gap-3 text-neutral-600 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-white transition-colors">
                            <Github className="h-5 w-5" /> GitHub
                        </Link>
                        <Link href="mailto:example@mail.com" className="flex items-center gap-3 text-neutral-600 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-white transition-colors">
                            <Mail className="h-5 w-5" /> Email
                        </Link>
                        <Link href="#" className="flex items-center gap-3 text-neutral-600 hover:text-blue-500 dark:text-neutral-400 dark:hover:text-white transition-colors">
                            <Twitter className="h-5 w-5" /> Twitter
                        </Link>
                    </div>
                </div>

                {/* 技能栈 - 占据 1x1 */}
                <div className="rounded-3xl glass p-8 space-y-4">
                    <h2 className="text-xl font-bold">技能栈</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <div key={skill.name} className="flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium">
                                {skill.icon}
                                {skill.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 站点说明 - 占据 2x1 */}
                <div className="md:col-span-2 rounded-3xl glass p-8 flex flex-col justify-center">
                    <h2 className="text-xl font-bold mb-2">站点构建</h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                        基于 Next.js 15 + Tailwind CSS 构建。UI 灵感源自 Apple 设计规范。
                        所有笔记均由 Markdown/MDX 驱动，支持 LaTeX 公式与代码高亮。
                    </p>
                </div>
            </div>
        </div>
    );
}