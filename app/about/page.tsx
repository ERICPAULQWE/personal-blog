"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Sparkles,
    Layers,
    Wand2,
    Clock,
    Shield,
    PenLine,
    Code2,
    Cpu,
    BookOpen,
    Mail,
    Github,
} from "lucide-react";

type RevealProps = {
    children: React.ReactNode;
    className?: string;
    delay?: number; // ms
};

function useReveal() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        setShown(true);
                        io.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.15 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return { ref, shown };
}

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
    const { ref, shown } = useReveal();
    return (
        <div
            ref={ref}
            className={[
                className,
                "transition-all duration-700 ease-out will-change-transform",
                shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-[2px]",
            ].join(" ")}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            const v = max <= 0 ? 0 : h.scrollTop / max;
            setP(Math.min(1, Math.max(0, v)));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return p;
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

/**
 * 轻量 tilt：不引入库，用 mousemove 做“微倾斜”
 * 类苹果风：角度很小、过渡柔和、不会晃眼
 */
function TiltCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [t, setT] = useState({ rx: 0, ry: 0 });

    return (
        <div
            ref={ref}
            className={[
                className,
                "transition-transform duration-300 ease-out will-change-transform",
            ].join(" ")}
            style={{
                transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
            }}
            onMouseMove={(e) => {
                const el = ref.current;
                if (!el) return;
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width; // 0..1
                const py = (e.clientY - r.top) / r.height; // 0..1
                const ry = clamp((px - 0.5) * 8, -6, 6);
                const rx = clamp(-(py - 0.5) * 8, -6, 6);
                setT({ rx, ry });
            }}
            onMouseLeave={() => setT({ rx: 0, ry: 0 })}
        >
            {children}
        </div>
    );
}

export default function AboutPage() {
    const progress = useScrollProgress();

    // 鼠标跟随“柔光”
    const [cursor, setCursor] = useState({ x: 50, y: 30 });
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setCursor({ x, y });
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const sections = useMemo(
        () => [
            { id: "now", label: "Now" },
            { id: "highlights", label: "Highlights" },
            { id: "principles", label: "Principles" },
            { id: "toolkit", label: "Toolkit" },
            { id: "timeline", label: "Timeline" },
            { id: "contact", label: "Contact" },
        ],
        []
    );

    return (
        <div className="relative pb-32">
            {/* 顶部滚动进度条（细、克制，但很“高级”） */}
            <div className="fixed left-0 top-0 z-50 h-[2px] w-full bg-transparent">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {/* 动态光晕背景（鼠标跟随 + mesh 渐变） */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* mesh layer */}
                <div
                    className="fixed inset-0 -z-10 opacity-90"
                    style={{
                        backgroundImage: `
                                radial-gradient(900px circle at 50% -10%, rgba(56,189,248,0.20), transparent 60%),
                                radial-gradient(800px circle at 20% 20%, rgba(59,130,246,0.14), transparent 60%),
                                radial-gradient(900px circle at 85% 30%, rgba(168,85,247,0.16), transparent 60%),
                                radial-gradient(900px circle at 50% 85%, rgba(16,185,129,0.10), transparent 65%)
                                        `,
                    }}
                />

                {/* cursor glow */}
                <div
                    className="absolute h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-70"
                    style={{
                        left: `${cursor.x}%`,
                        top: `${cursor.y}%`,
                        background:
                            "radial-gradient(circle at center, rgba(56,189,248,0.18), rgba(59,130,246,0.10), transparent 60%)",
                    }}
                />
            </div>

            {/* 顶部 Hero */}
            <section className="relative mx-auto max-w-6xl px-6 pt-24">
                <Reveal>
                    <div className="flex flex-col items-center text-center">
                        {/* Badge row */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/60 px-4 py-2 text-xs font-medium text-neutral-700 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-neutral-300">
                            <Sparkles className="h-4 w-4 text-cyan-500" />
                            <span className="font-mono opacity-80">ABOUT</span>
                            <span className="opacity-50">·</span>
                            <span>Apple-like · Glass · Motion</span>
                        </div>

                        <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
                            <span className="text-neutral-900 dark:text-white">Eric He</span>
                            <span className="text-neutral-300 dark:text-neutral-700"> — </span>
                            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Systems Builder
                            </span>
                        </h1>

                        {/* “少叙事”：一句强定位 + 一行标签 */}
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                            我把写作当作压缩思维，把代码当作扩展现实，把设计当作降低摩擦。
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="#contact"
                                className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/70 px-5 py-3 text-sm font-semibold text-neutral-900 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 dark:border-neutral-800/60 dark:bg-neutral-900/55 dark:text-white dark:hover:shadow-black/20"
                            >
                                <Mail className="h-4 w-4 text-cyan-500" />
                                Contact
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>

                            <Link
                                href="/tags"
                                className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/55 px-5 py-3 text-sm font-semibold text-neutral-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-blue-500/25 hover:text-neutral-900 dark:border-neutral-800/60 dark:bg-neutral-900/45 dark:text-neutral-300 dark:hover:text-white"
                            >
                                <Layers className="h-4 w-4 text-blue-500" />
                                Explore Tags
                                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Link>

                            <a
                                href="https://github.com/ERICPAULQWE"
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/45 px-5 py-3 text-sm font-semibold text-neutral-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-purple-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-300"
                            >
                                <Github className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                GitHub
                                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>
                </Reveal>

                {/* 快速导航（更“产品化”，且交互感强） */}
                <Reveal delay={150} className="mt-14">
                    <div className="mx-auto w-fit rounded-3xl border border-neutral-200/60 bg-white/55 p-2 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/45">
                        <div className="flex flex-wrap justify-center gap-2">
                            {sections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className="rounded-2xl px-4 py-2 text-xs font-semibold text-neutral-700 transition-all hover:bg-white/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white"
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* Now（信息化，而非叙事） */}
            <section id="now" className="relative mx-auto mt-24 max-w-6xl px-6">
                <Reveal>
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                                Now
                            </h2>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                                当前关注点（持续更新）
                            </p>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-mono">LIVE</span>
                            <span className="h-1 w-1 rounded-full bg-emerald-400" />
                            <span>motion & systems</span>
                        </div>
                    </div>
                </Reveal>

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {[
                        {
                            icon: PenLine,
                            title: "写作系统",
                            desc: "把笔记变成可检索、可演进的知识结构。",
                            grad: "from-cyan-500/14 to-blue-500/14",
                            iconColor: "text-cyan-500",
                        },
                        {
                            icon: Code2,
                            title: "产品化表达",
                            desc: "用更好的交互与结构，让内容更易被理解。",
                            grad: "from-purple-500/14 to-pink-500/14",
                            iconColor: "text-purple-500",
                        },
                        {
                            icon: Cpu,
                            title: "AI 工具链",
                            desc: "把重复劳动交给工具，把判断力留给自己。",
                            grad: "from-emerald-500/12 to-teal-500/12",
                            iconColor: "text-emerald-500",
                        },
                    ].map((c, idx) => (
                        <Reveal key={c.title} delay={80 * idx}>
                            <TiltCard
                                className={[
                                    "rounded-3xl border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md",
                                    "dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                    "hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/25",
                                    "transition-all duration-300",
                                ].join(" ")}
                            >
                                <div className={`rounded-2xl bg-gradient-to-br ${c.grad} p-4`}>
                                    <c.icon className={`h-6 w-6 ${c.iconColor}`} />
                                </div>
                                <div className="mt-5">
                                    <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {c.title}
                                    </div>
                                    <div className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                        {c.desc}
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Highlights（更强视觉：bento + 互动 hover） */}
            <section id="highlights" className="relative mx-auto mt-28 max-w-6xl px-6">
                <Reveal>
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                                Highlights
                            </h2>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                                这不是履历，是我做事的“手感”
                            </p>
                        </div>
                    </div>
                </Reveal>

                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-6 lg:auto-rows-[160px]">
                    {/* 大卡 1 */}
                    <Reveal className="lg:col-span-4 lg:row-span-2">
                        <TiltCard className="h-full">
                            <div className="group relative h-full overflow-hidden rounded-[2rem] border border-neutral-200/60 bg-white/55 p-7 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/45">
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/18 blur-3xl" />
                                    <div className="absolute top-20 left-16 h-40 w-40 rounded-full bg-cyan-500/16 blur-3xl" />
                                </div>

                                <div className="relative z-10 flex h-full flex-col justify-between">
                                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Wand2 className="h-4 w-4 text-blue-500" />
                                        Interaction & Structure
                                    </div>

                                    <div>
                                        <div className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                            用“结构”减少内容理解成本
                                        </div>
                                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            我更在意信息如何被阅读：导航、密度、节奏、层级、反馈。
                                            让内容像产品一样自然地被使用。
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {["Information Architecture", "Motion", "Glass UI", "DX"].map((t) => (
                                                <span
                                                    key={t}
                                                    className="rounded-full border border-neutral-200/60 bg-white/55 px-3 py-1 text-[11px] font-medium text-neutral-700 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-800/40 dark:text-neutral-300"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                            micro-motion · not noisy
                                        </span>
                                        <Link
                                            href="/archive"
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                        >
                                            View Archive <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    </Reveal>

                    {/* 右侧两张小卡 */}
                    {[
                        {
                            icon: Shield,
                            title: "偏好稳健",
                            desc: "可维护 > 可炫技",
                            grad: "from-amber-500/14 to-orange-500/14",
                            accent: "hover:border-amber-500/25 hover:shadow-amber-500/10",
                        },
                        {
                            icon: BookOpen,
                            title: "偏好清晰",
                            desc: "清晰 > 聪明",
                            grad: "from-emerald-500/12 to-teal-500/12",
                            accent: "hover:border-emerald-500/25 hover:shadow-emerald-500/10",
                        },
                    ].map((c, idx) => (
                        <Reveal key={c.title} delay={120 + idx * 80} className="lg:col-span-2 lg:row-span-1">
                            <TiltCard className="h-full">
                                <div
                                    className={[
                                        "group relative h-full overflow-hidden rounded-[2rem] border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md transition-all",
                                        "hover:-translate-y-1 hover:shadow-2xl",
                                        c.accent,
                                        "dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                    ].join(" ")}
                                >
                                    <div className={`rounded-2xl bg-gradient-to-br ${c.grad} p-4`}>
                                        <c.icon className="h-6 w-6 text-neutral-900/80 dark:text-white/80" />
                                    </div>
                                    <div className="mt-5">
                                        <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {c.title}
                                        </div>
                                        <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                            {c.desc}
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}

                    {/* 底部横向卡 */}
                    <Reveal className="lg:col-span-6 lg:row-span-1" delay={220}>
                        <div className="rounded-[2rem] border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/45">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-gradient-to-br from-purple-500/12 to-blue-500/12 p-3">
                                        <Layers className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-neutral-900 dark:text-white">
                                            这个博客不是作品集，而是一个系统
                                        </div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Tags / Archive / Labs 是可组合的入口
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href="/tags"
                                        className="rounded-2xl border border-neutral-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-neutral-800 transition-all hover:-translate-y-0.5 hover:border-cyan-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-200"
                                    >
                                        Tags
                                    </Link>
                                    <Link
                                        href="/archive"
                                        className="rounded-2xl border border-neutral-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-neutral-800 transition-all hover:-translate-y-0.5 hover:border-amber-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-200"
                                    >
                                        Archive
                                    </Link>
                                    <Link
                                        href="/labs"
                                        className="rounded-2xl border border-neutral-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-neutral-800 transition-all hover:-translate-y-0.5 hover:border-purple-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-200"
                                    >
                                        Labs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Principles：更“系统设置”感 */}
            <section id="principles" className="relative mx-auto mt-28 max-w-6xl px-6">
                <Reveal>
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        Principles
                    </h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        像系统偏好设置一样短、硬、可执行
                    </p>
                </Reveal>

                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[
                        {
                            icon: Shield,
                            title: "清晰优先",
                            desc: "表达要被理解，而不是被惊叹。",
                            accent: "hover:border-blue-500/25 hover:shadow-blue-500/10",
                        },
                        {
                            icon: Clock,
                            title: "长期主义",
                            desc: "做慢变量：结构、品味、判断力。",
                            accent: "hover:border-amber-500/25 hover:shadow-amber-500/10",
                        },
                        {
                            icon: Layers,
                            title: "结构先于细节",
                            desc: "先把盒子做好，再谈装饰。",
                            accent: "hover:border-emerald-500/25 hover:shadow-emerald-500/10",
                        },
                        {
                            icon: Sparkles,
                            title: "动效是反馈，不是表演",
                            desc: "动效只做两件事：引导与确认。",
                            accent: "hover:border-purple-500/25 hover:shadow-purple-500/10",
                        },
                    ].map((p, idx) => (
                        <Reveal key={p.title} delay={idx * 90}>
                            <div
                                className={[
                                    "group rounded-[2rem] border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md transition-all",
                                    "hover:-translate-y-0.5 hover:shadow-2xl",
                                    p.accent,
                                    "dark:border-neutral-800/60 dark:bg-neutral-900/45",
                                ].join(" ")}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-neutral-100/70 p-3 dark:bg-neutral-800/60">
                                        <p.icon className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {p.title}
                                        </div>
                                        <div className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            {p.desc}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Toolkit：色彩更丰富但仍克制 */}
            <section id="toolkit" className="relative mx-auto mt-28 max-w-6xl px-6">
                <Reveal>
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        Toolkit
                    </h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        我常用的工具与偏好（不求全，求稳定）
                    </p>
                </Reveal>

                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {[
                        {
                            title: "Design",
                            items: ["Typography", "Spacing System", "Motion", "Glass UI"],
                            grad: "from-purple-500/12 to-blue-500/12",
                        },
                        {
                            title: "Engineering",
                            items: ["Next.js", "TypeScript", "Tailwind", "DX-first"],
                            grad: "from-cyan-500/12 to-sky-500/12",
                        },
                        {
                            title: "Thinking",
                            items: ["Notes → Systems", "Atomic ideas", "Long-term value", "Iteration"],
                            grad: "from-amber-500/12 to-orange-500/12",
                        },
                    ].map((b, idx) => (
                        <Reveal key={b.title} delay={idx * 100}>
                            <TiltCard>
                                <div className="rounded-[2rem] border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/45">
                                    <div className={`rounded-2xl bg-gradient-to-br ${b.grad} p-4`}>
                                        <div className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
                                            {b.title.toUpperCase()}
                                        </div>
                                        <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
                                            {b.title}
                                        </div>
                                    </div>
                                    <div className="mt-5 space-y-2">
                                        {b.items.map((it) => (
                                            <div
                                                key={it}
                                                className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-white/50 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-800/60 dark:bg-neutral-900/35 dark:text-neutral-300"
                                            >
                                                <span className="truncate">{it}</span>
                                                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Timeline：更视觉化的时间线（仍克制，但有记忆点） */}
            <section id="timeline" className="relative mx-auto mt-28 max-w-6xl px-6">
                <Reveal>
                    <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                        Timeline
                    </h2>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        用“阶段”而不是“简历”
                    </p>
                </Reveal>

                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {[
                        {
                            year: "2019–2020",
                            title: "记录开始",
                            desc: "从碎片到习惯",
                            grad: "from-sky-500/14 to-cyan-500/14",
                        },
                        {
                            year: "2021–2022",
                            title: "结构意识",
                            desc: "从内容到系统",
                            grad: "from-purple-500/14 to-pink-500/14",
                        },
                        {
                            year: "2023–Now",
                            title: "产品化表达",
                            desc: "从写给自己到写给使用者",
                            grad: "from-amber-500/14 to-orange-500/14",
                        },
                    ].map((t, idx) => (
                        <Reveal key={t.year} delay={idx * 120}>
                            <TiltCard>
                                <div className="group relative overflow-hidden rounded-[2rem] border border-neutral-200/60 bg-white/55 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/45">
                                    <div className={`rounded-2xl bg-gradient-to-br ${t.grad} p-4`}>
                                        <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {t.title}
                                        </div>
                                    </div>

                                    <div className="mt-5 text-sm text-neutral-600 dark:text-neutral-400">
                                        {t.desc}
                                    </div>
                                </div>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Contact：强记忆点 CTA（带磁吸手感/动效） */}
            <section id="contact" className="relative mx-auto mt-32 max-w-6xl px-6">
                <Reveal>
                    <div className="overflow-hidden rounded-[2.5rem] border border-neutral-200/60 bg-white/55 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/45">
                        <div className="relative p-10 md:p-14">
                            {/* 背景光斑（增强记忆点） */}
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/16 blur-3xl" />
                                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/14 blur-3xl" />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/60 px-4 py-2 text-xs font-semibold text-neutral-700 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-neutral-300">
                                    <Mail className="h-4 w-4 text-cyan-500" />
                                    <span>Let’s connect</span>
                                </div>

                                <h3 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-4xl">
                                    如果你也在做系统、做表达、做长期价值
                                </h3>
                                <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
                                    我更喜欢讨论：结构、设计、工具链、创作节奏，以及如何把复杂变简单。
                                </p>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    <a
                                        href="mailto:ericpaulqwe@gmail.com"
                                        className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/70 px-5 py-3 text-sm font-semibold text-neutral-900 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 dark:border-neutral-800/60 dark:bg-neutral-900/55 dark:text-white"
                                    >
                                        <Mail className="h-4 w-4 text-cyan-500" />
                                        Email
                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </a>

                                    <a
                                        href="https://github.com/ERICPAULQWE"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/55 px-5 py-3 text-sm font-semibold text-neutral-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-purple-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/45 dark:text-neutral-300"
                                    >
                                        <Github className="h-4 w-4" />
                                        GitHub
                                        <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </a>

                                    <Link
                                        href="/"
                                        className="group inline-flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white/45 px-5 py-3 text-sm font-semibold text-neutral-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-500/25 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:text-neutral-300"
                                    >
                                        Back Home
                                        <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}
