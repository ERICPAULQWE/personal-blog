"use client";

import Link from "next/link";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
    AnimatePresence,
    Variants
} from "framer-motion";
import {
    ArrowRight,
    BookText,
    Beaker,
    Hash,
    RefreshCcw,
    Clock,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { labs } from "@/labs/_registry";

// --- 0. 动画变体配置 (Animation Variants) ---
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 40,
            damping: 15,
            mass: 1
        }
    },
};

// Hero 文字特定舒适动画
const heroSlideRight: Variants = {
    hidden: { opacity: 0, x: -60 },
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
    }
};

const heroSlideLeft: Variants = {
    hidden: { opacity: 0, x: 60 },
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
    }
};

const heroSlideUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    }
};

// --- 1. 升级版背景：流体背景 (保持之前的视觉参数) ---
function FluidBackground() {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-neutral-50/50 dark:bg-black/50">
            {/* 噪点纹理 */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] z-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* 动态流动的色彩球 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <motion.div
                    animate={{
                        x: ["-20%", "20%", "-20%"],
                        y: ["-10%", "20%", "-10%"],
                        scale: [1, 1.2, 1],
                        rotate: [0, 120, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-25%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 opacity-50 blur-[90px] mix-blend-multiply dark:mix-blend-screen"
                />

                <motion.div
                    animate={{
                        x: ["20%", "-20%", "20%"],
                        y: ["10%", "-20%", "10%"],
                        scale: [1, 1.3, 1],
                        rotate: [0, -120, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-25%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-purple-400/40 to-pink-400/40 opacity-50 blur-[90px] mix-blend-multiply dark:mix-blend-screen"
                />
            </div>
        </div>
    );
}

// --- 2. 核心交互组件：TiltCard (样式保持) ---
interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    href?: string;
    gradient?: string;
}

function TiltCard({ children, className, href, gradient = "from-blue-500/20 to-purple-500/20" }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-12deg", "12deg"]);

    const sheenX = useTransform(mouseX, [-0.5, 0.5], ["-100%", "200%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXRel = (e.clientX - rect.left) / width - 0.5;
        const mouseYRel = (e.clientY - rect.top) / height - 0.5;

        x.set(mouseXRel);
        y.set(mouseYRel);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const Content = (
        <motion.div
            ref={ref}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative h-full w-full rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors duration-300",
                "hover:shadow-2xl hover:shadow-neutral-500/20 dark:hover:shadow-black/50 hover:z-10",
                className
            )}
        >
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10 h-full">
                {children}
            </div>

            <motion.div
                style={{
                    background: useMotionTemplate`linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.4) 40%, transparent 60%)`,
                    left: sheenX,
                    top: 0,
                    bottom: 0,
                    width: "200%",
                    position: "absolute",
                    zIndex: 1,
                    pointerEvents: "none",
                    opacity: 0.1,
                    mixBlendMode: "overlay"
                }}
            />

            <div
                className={cn(
                    "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl -z-10",
                    "bg-gradient-to-br",
                    gradient
                )}
            />
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full perspective-1000">
                {Content}
            </Link>
        );
    }

    return <div className="h-full perspective-1000">{Content}</div>;
}

// --- 3. Hero Section (修复：视差幅度大幅增加 & 交互锁逻辑修复) ---
function ParallaxHero() {
    // 交互锁：动画播放完前为 false
    const [isHoverEnabled, setIsHoverEnabled] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        // 只有动画结束后，才开始监听鼠标
        if (!isHoverEnabled) return;

        const handleMove = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth - 0.5);
            mouseY.set(e.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, [isHoverEnabled, mouseX, mouseY]);

    // 视差参数 - 大幅增加幅度
    // 旋转角度扩大到 ±15度
    const titleRotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const titleRotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    // 位移扩大到 ±40px
    const badgeX = useTransform(mouseX, [-0.5, 0.5], [40, -40]);
    const badgeY = useTransform(mouseY, [-0.5, 0.5], [40, -40]);

    return (
        <section className="relative mx-auto max-w-5xl pt-24 pb-16 text-center md:pt-36 md:pb-24 perspective-1000">
            <motion.div
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* 嵌套分离：外层 FadeIn，内层 Parallax */}
                <motion.div variants={fadeInUp}>
                    <motion.div
                        style={{ x: badgeX, y: badgeY }}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/50 px-4 py-1.5 text-xs font-semibold backdrop-blur-md transition-transform hover:scale-105 dark:border-white/10 dark:bg-white/5"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300">正在构建交互式数字花园</span>
                    </motion.div>
                </motion.div>

                {/* 标题左右划入 */}
                <motion.h1
                    style={{ rotateX: titleRotateX, rotateY: titleRotateY }}
                    className="relative text-5xl font-extrabold tracking-tight md:text-8xl flex flex-col md:block items-center"
                >
                    <motion.span
                        variants={heroSlideRight}
                        className="block md:inline-block text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-500 pb-2 md:mr-4"
                    >
                        学习笔记 &
                    </motion.span>
                    <motion.span
                        variants={heroSlideLeft}
                        className="block md:inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x"
                    >
                        交互实验室
                    </motion.span>
                </motion.h1>

                {/* 副标题：下方划入，并在结束后开启交互 */}
                <motion.p
                    variants={heroSlideUp}
                    className="mx-auto max-w-2xl text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed"
                >
                    沉淀 Obsidian 笔记，探索 React 交互实验。<br className="hidden md:block" />
                    追求视觉的高级感与知识的结构化。
                </motion.p>

                {/* 装饰线 - 动画结束后触发交互开启 */}
                <motion.div
                    variants={heroSlideUp}
                    onAnimationComplete={() => setIsHoverEnabled(true)}
                    className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700 mt-8"
                />
            </motion.div>
        </section>
    );
}

// --- 4. 真实内容瀑布流 (修复版 Flatten 逻辑) ---
type FeedItem = {
    id: string;
    type: 'note' | 'lab';
    title: string;
    description: string;
    tags: string[];
    date: string;
    link: string;
    color: string;
};

// 定义节点接口以避免 any
interface NoteNode {
    type?: string;
    name?: string;
    path?: string;
    children?: NoteNode[];
    [key: string]: unknown;
}

// 核心修复：基于递归的深度扁平化函数，兼容任意树状结构
const flattenNotes = (node: NoteNode | NoteNode[]): NoteNode[] => {
    let files: NoteNode[] = [];

    // 如果传入的是数组，遍历处理
    if (Array.isArray(node)) {
        node.forEach(n => files = files.concat(flattenNotes(n)));
        return files;
    }

    // 单节点处理
    if (!node) return [];

    // 核心判断：如果是 Markdown 文件 (有 path 且以 .md 结尾)
    // 忽略 README，忽略非 .md
    if (node.path && typeof node.path === 'string' && node.path.endsWith('.md')) {
        if (!node.name?.toLowerCase().includes('readme')) {
            files.push(node);
        }
    }

    // 递归子节点
    if (node.children) {
        files = files.concat(flattenNotes(node.children));
    }

    return files;
};

function MasonryFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        async function fetchContent() {
            // 1. Labs
            const labItems: FeedItem[] = labs.map(lab => ({
                id: `lab-${lab.slug}`,
                type: 'lab',
                title: lab.title,
                description: lab.description,
                tags: lab.tags ?? [],
                date: lab.date,
                link: `/labs/${lab.slug}`,
                color: "from-purple-500/30 to-pink-500/30"
            }));

            // 2. Real Notes (修复获取逻辑)
            let noteItems: FeedItem[] = [];
            try {
                const res = await fetch('/api/notes-index');
                if (res.ok) {
                    const treeData = await res.json();
                    // 使用修复后的扁平化函数，直接处理整个 API 响应
                    const flatFiles = flattenNotes(treeData);

                    noteItems = flatFiles.map((file) => {
                        const path = file.path as string;
                        const name = file.name as string;
                        const pathClean = path.replace(/\.md$/, '');
                        const pathParts = pathClean.split('/');
                        const category = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Note';

                        return {
                            id: `note-${path}`,
                            type: 'note',
                            title: name.replace(/\.md$/, ''),
                            description: "", // 保持真实，无摘要则留空
                            tags: [category],
                            date: "2026",
                            link: `/notes/${pathClean}`,
                            color: "from-blue-500/30 to-cyan-500/30"
                        };
                    });
                }
            } catch (e) {
                console.error("Failed to fetch notes:", e);
            }

            // 3. 混合并随机排序
            const allItems = [...labItems, ...noteItems].sort(() => Math.random() - 0.5);
            setItems(allItems);
            setDisplayedItems(allItems.slice(0, ITEMS_PER_PAGE));
            setLoading(false);
        }

        fetchContent();
    }, []);

    const loadMore = useCallback(() => {
        if (loading || displayedItems.length >= items.length) return;

        setLoading(true);
        setTimeout(() => {
            const nextItems = items.slice(0, (page + 1) * ITEMS_PER_PAGE);
            setDisplayedItems(nextItems);
            setPage(p => p + 1);
            setLoading(false);
        }, 500);
    }, [items, displayedItems.length, loading, page]);

    // 滚动监听
    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        const handleScroll = () => {
            if (timeoutId) return;
            timeoutId = setTimeout(() => {
                const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
                if (scrollTop + clientHeight >= scrollHeight - 300) {
                    loadMore();
                }
                timeoutId = null;
            }, 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    // 只要有数据就渲染，不因为 Notes 失败而隐藏 Labs
    if (items.length === 0 && !loading) return null;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "100px" }}
            className="space-y-8 mt-20"
        >
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-8 px-2">
                <RefreshCcw className={cn("h-5 w-5 text-neutral-400", loading && "animate-spin")} />
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Latest Stream</h3>
            </motion.div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                <AnimatePresence>
                    {displayedItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "50px" }}
                            transition={{ duration: 0.4 }}
                            className="break-inside-avoid"
                        >
                            <div className="h-full min-h-[160px]">
                                <TiltCard href={item.link} gradient={item.color} className="bg-white dark:bg-black/40">
                                    <div className="flex flex-col h-full p-6 justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                    item.type === 'note'
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                                        : "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                                                )}>
                                                    {item.type === 'note' ? <FileText className="h-3 w-3" /> : <Beaker className="h-3 w-3" />}
                                                    {item.type}
                                                </div>
                                                <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                                                    {item.date && item.date !== "2026" && <><Clock className="h-3 w-3" /> {item.date}</>}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-tight">
                                                {item.title}
                                            </h4>
                                            {item.description && (
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {item.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] text-neutral-400 dark:text-neutral-500">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="h-24 flex items-center justify-center opacity-50">
                {loading && <span className="text-xs text-neutral-400 tracking-widest uppercase">Loading content...</span>}
                {!loading && displayedItems.length >= items.length && items.length > 0 && (
                    <span className="text-xs text-neutral-400 tracking-widest uppercase">End of stream</span>
                )}
            </div>
        </motion.div>
    );
}

// --- 5. 随机 Tags 组件 ---
function RandomTagsCloud() {
    const noteTags = [
        "信号与系统", "DSP", "数字信号处理",
        "通信原理", "高频电子线路",
        "信息论", "微机原理", "算法",
        "React", "Next.js", "Obsidian"
    ];

    return (
        <div className="flex h-full flex-col justify-between p-6">
            <div className="flex items-center gap-2 mb-4 text-orange-500">
                <Hash className="h-5 w-5" />
                <span className="text-xs font-bold uppercase">Note Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {noteTags.map((tag) => (
                    <Link key={tag} href={`/tags/${tag}`}>
                        <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-white hover:shadow-md dark:hover:bg-neutral-700 transition-all cursor-pointer">
                            {tag}
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-auto pt-4 text-right">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">More Notes →</span>
            </div>
        </div>
    );
}

// --- 主页面 ---
export default function HomePage() {
    return (
        <div className="min-h-screen px-4 pb-20 sm:px-6 font-sans selection:bg-blue-500/30">
            <FluidBackground />
            <ParallaxHero />

            <div className="mx-auto max-w-6xl">

                {/* --- Bento Grid Section --- */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[340px]"
                >

                    {/* 1. Notes (Left, Large) */}
                    <motion.div variants={fadeInUp} className="md:col-span-2">
                        <TiltCard href="/notes" gradient="from-blue-500/30 to-cyan-500/30" className="bg-white dark:bg-black/40 backdrop-blur-xl">
                            <div className="flex h-full flex-col justify-between p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-500/20">
                                            <BookText className="h-7 w-7" />
                                        </div>
                                        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 rounded-full px-3 py-1">
                                            Core
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">知识库 / Notes</h2>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                            系统化的技术沉淀。<br />
                                            从微机原理到前端工程化。
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform">
                                    进入花园 <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* 2. Labs (Center) */}
                    <motion.div variants={fadeInUp} className="md:col-span-1">
                        <TiltCard href="/labs" gradient="from-purple-500/30 to-pink-500/30" className="bg-white dark:bg-black/40">
                            <div className="flex h-full flex-col p-6 relative overflow-hidden justify-between">
                                {/* 背景装饰 */}
                                <div className="absolute top-0 right-0 p-24 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                <div>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 ring-1 ring-purple-500/20">
                                        <Beaker className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Labs</h2>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        React 交互组件与 DSP 可视化实验。
                                    </p>
                                </div>
                                {/* 抽象装饰 */}
                                <div className="space-y-1.5 opacity-50">
                                    <div className="h-1.5 w-3/4 rounded bg-purple-100 dark:bg-purple-900/30" />
                                    <div className="h-1.5 w-full rounded bg-purple-100 dark:bg-purple-900/30" />
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                                    View All <ArrowRight className="h-3 w-3" />
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>

                    {/* 3. Random Tags (Right) */}
                    <motion.div variants={fadeInUp} className="md:col-span-1">
                        <TiltCard gradient="from-orange-500/30 to-red-500/30" className="bg-white dark:bg-black/40">
                            <RandomTagsCloud />
                        </TiltCard>
                    </motion.div>
                </motion.div>

                {/* --- Waterfall Feed Section --- */}
                <MasonryFeed />

                <div className="h-10" />
            </div>
        </div>
    );
}