"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { Engine as EngineType, IEventCollision, Pair, Body } from 'matter-js';

const EMOJI_LEVELS = [
    { emoji: '🎈', size: 25, score: 1 },
    { emoji: '🍊', size: 35, score: 2 },
    { emoji: '🍎', size: 50, score: 4 },
    { emoji: '🥥', size: 65, score: 8 },
    { emoji: '🍍', size: 80, score: 16 },
    { emoji: '🍉', size: 100, score: 32 },
];

export default function EmojiMergeLab() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<EngineType | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [score, setScore] = useState(0);
    const [nextIndex, setNextIndex] = useState(0);

    // 纯代码生成音效（Web Audio API）
    const playPopSound = (frequency: number = 400) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.warn("Audio play failed", e);
        }
    };

    useEffect(() => {
        // 动态导入 Matter.js
        const initGame = async () => {
            const Matter = await import('matter-js');
            const { Engine, Runner, Bodies, Composite, Events } = Matter.default;

            if (!canvasRef.current || !containerRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            canvasRef.current.width = width;
            canvasRef.current.height = height;

            const engine = Engine.create();
            engineRef.current = engine;

            // 静态物理边界
            const wallOptions = { isStatic: true, render: { visible: false } };
            Composite.add(engine.world, [
                Bodies.rectangle(width / 2, height + 30, width, 60, wallOptions), // 地面
                Bodies.rectangle(-30, height / 2, 60, height, wallOptions), // 左墙
                Bodies.rectangle(width + 30, height / 2, 60, height, wallOptions) // 右墙
            ]);

            // 核心碰撞与合成逻辑
            Events.on(engine, 'collisionStart', (event: IEventCollision<EngineType>) => {
                event.pairs.forEach((pair: Pair) => {
                    const { bodyA, bodyB } = pair;

                    if (bodyA.label === bodyB.label && bodyA.label.startsWith('emoji_')) {
                        const level = parseInt(bodyA.label.split('_')[1]);

                        if (level < EMOJI_LEVELS.length - 1) {
                            Composite.remove(engine.world, [bodyA, bodyB]);

                            const newLevel = level + 1;
                            const newEmoji = Bodies.circle(
                                (bodyA.position.x + bodyB.position.x) / 2,
                                (bodyA.position.y + bodyB.position.y) / 2,
                                EMOJI_LEVELS[newLevel].size,
                                {
                                    label: `emoji_${newLevel}`,
                                    restitution: 0.4,
                                    friction: 0.1
                                }
                            );

                            Composite.add(engine.world, newEmoji);
                            setScore(s => s + EMOJI_LEVELS[newLevel].score);
                            playPopSound(350 + newLevel * 80); // 合成音效
                        }
                    }
                });
            });

            const ctx = canvasRef.current.getContext('2d');
            const runner = Runner.create();
            Runner.run(runner, engine);

            // 手动渲染循环：简单、直接、性能高
            const render = () => {
                if (!ctx || !engineRef.current) return;

                ctx.clearRect(0, 0, width, height);
                const bodies = Composite.allBodies(engine.world);

                bodies.forEach((body) => {
                    if (body.label.startsWith('emoji_')) {
                        const level = parseInt(body.label.split('_')[1]);
                        const config = EMOJI_LEVELS[level];

                        ctx.save();
                        ctx.translate(body.position.x, body.position.y);
                        ctx.rotate(body.angle);

                        // 绘制纯净的 Emoji
                        ctx.font = `${config.size * 1.5}px serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(config.emoji, 0, 0);

                        ctx.restore();
                    }
                });

                requestAnimationFrame(render);
            };

            render();

            return () => {
                Runner.stop(runner);
                Engine.clear(engine);
            };
        };

        initGame();
    }, []);

    const handleDrop = async (e: React.MouseEvent) => {
        if (!engineRef.current || !containerRef.current) return;
        const Matter = await import('matter-js');
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const config = EMOJI_LEVELS[nextIndex];
        const newBody = Matter.default.Bodies.circle(x, 50, config.size, {
            label: `emoji_${nextIndex}`,
            restitution: 0.4,
            friction: 0.1
        });

        Matter.default.Composite.add(engineRef.current.world, newBody);

        // 更新预览
        setNextIndex(Math.floor(Math.random() * 3));
        playPopSound(200); // 掉落提示音
    };

    // 全屏模式布局规范
    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-white dark:bg-neutral-950 relative overflow-hidden flex flex-col"
        >
            {/* 顶部 UI */}
            <div className="absolute top-10 left-10 z-10 pointer-events-none select-none">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-1">Current Score</p>
                <div className="text-7xl font-black text-neutral-900 dark:text-white tabular-nums">
                    {score}
                </div>
            </div>

            <div className="absolute top-10 right-10 z-10 flex flex-col items-end pointer-events-none select-none">
                <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-widest">Next Up</p>
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-5xl">
                    {EMOJI_LEVELS[nextIndex].emoji}
                </div>
            </div>

            {/* 游戏交互区域 */}
            <canvas
                ref={canvasRef}
                className="flex-1 w-full cursor-crosshair"
                onClick={handleDrop}
            />

            <div className="absolute bottom-10 w-full text-center pointer-events-none opacity-20">
                <p className="text-xs font-semibold tracking-widest uppercase dark:text-white">Tap to Drop</p>
            </div>
        </div>
    );
}