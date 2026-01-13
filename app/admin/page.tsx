import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
    const session = await getServerSession();

    // 路由守卫：如果没有登录，强制踢回登录页
    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="container mx-auto py-10 px-6 max-w-5xl">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm bg-white dark:bg-neutral-900">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">控制台</h1>
                        <p className="text-neutral-500 mt-2">
                            你好，{session.user.name}。系统已准备就绪。
                        </p>
                    </div>
                    <div className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded">
                        {/* 显示当前连接的仓库，方便调试 */}
                        Env: {process.env.NODE_ENV}
                    </div>
                </div>

                {/* 功能入口卡片 */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        title="发布笔记"
                        desc="撰写新的 Markdown 笔记"
                        href="/admin/write"
                        
                    />
                    <Card
                        title="Obsidian 导入"
                        desc="直接拖入 MD 和图片，自动处理存放路径与语法"
                        href="/admin/obsidian"
                    />
                    <Card
                        title="代码实验室"
                        desc="React 组件发布 (开发中...)"
                        href="#"
                        disabled
                    />
                    <Card
                        title="删除笔记"
                        desc="删除 Markdown 文件，并清理同名资源文件夹"
                        href="/admin/delete"
                    />
                    <Card
                        title="媒体库"
                        desc="图片资源管理 (开发中...)"
                        href="#"
                        disabled
                    />
                </div>
            </div>
        </div>
    );
}

function Card({ title, desc, href, disabled }: { title: string; desc: string; href: string; disabled?: boolean }) {
    return (
        <Link
            href={href}
            className={`block p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-all ${disabled
                    ? "opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-950"
                    : "hover:border-blue-500 hover:shadow-md bg-white dark:bg-neutral-900"
                }`}
        >
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {title}
                {disabled && <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">TODO</span>}
            </h3>
            <p className="text-sm text-neutral-500">{desc}</p>
        </Link>
    );
}