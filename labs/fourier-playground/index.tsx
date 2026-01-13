"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Activity, Music, Waves, Eraser, Info } from 'lucide-react';

// --- 核心常量 ---
const BUFFER_SIZE = 512;
const SAMPLE_RATE = 44100;

export default function FourierPlaygroundV2() {
    // 状态管理
    const [isPlaying, setIsPlaying] = useState(false);
    const [harmonics, setHarmonics] = useState([1, 0, 0, 0, 0, 0, 0, 0]); // 8阶谐波
    const [noiseLevel, setNoiseLevel] = useState(0);
    const [cutoff, setCutoff] = useState(100);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activeTab, setActiveTab] = useState<'synth' | 'filter'>('synth');

    // Refs
    const audioCtx = useRef<AudioContext | null>(null);
    const oscillator = useRef<OscillatorNode | null>(null);
    const customWave = useRef<Float32Array>(new Float32Array(BUFFER_SIZE).fill(0));
    const canvasRefTime = useRef<HTMLCanvasElement>(null);
    const canvasRefFreq = useRef<HTMLCanvasElement>(null);

    // --- 初始化音频逻辑 ---
    const toggleAudio = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (isPlaying) {
            oscillator.current?.stop();
            setIsPlaying(false);
        } else {
            const osc = audioCtx.current.createOscillator();
            const gain = audioCtx.current.createGain();

            // 创建自定义周期波形
            const real = new Float32Array(harmonics.length + 1).fill(0);
            const imag = new Float32Array(harmonics.length + 1).fill(0);
            harmonics.forEach((v, i) => imag[i + 1] = v); // 主要是正弦分量

            const wave = audioCtx.current.createPeriodicWave(real, imag);
            osc.setPeriodicWave(wave);
            osc.frequency.setValueAtTime(220, audioCtx.current.currentTime); // A3

            gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
            osc.connect(gain).connect(audioCtx.current.destination);
            osc.start();
            oscillator.current = osc;
            setIsPlaying(true);
        }
    };

    // --- 信号处理与 FFT ---
    const { timeData, freqData } = useMemo(() => {
        const time = new Float32Array(BUFFER_SIZE);
        const freq = new Float32Array(BUFFER_SIZE / 2);

        for (let i = 0; i < BUFFER_SIZE; i++) {
            let val = 0;
            // 叠加谐波
            harmonics.forEach((amp, idx) => {
                val += amp * Math.sin((2 * Math.PI * (idx + 1) * i) / BUFFER_SIZE);
            });
            // 叠加噪声
            val += (Math.random() * 2 - 1) * noiseLevel;
            time[i] = val;
        }

        // 简易 DFT
        for (let k = 0; k < BUFFER_SIZE / 2; k++) {
            let real = 0, imag = 0;
            for (let n = 0; n < BUFFER_SIZE; n++) {
                const angle = (2 * Math.PI * k * n) / BUFFER_SIZE;
                real += time[n] * Math.cos(angle);
                imag -= time[n] * Math.sin(angle);
            }
            // 模拟低通滤波效果
            const mag = Math.sqrt(real * real + imag * imag) / (BUFFER_SIZE / 2);
            freq[k] = k > cutoff ? 0 : mag;
        }
        return { timeData: time, freqData: freq };
    }, [harmonics, noiseLevel, cutoff]);

    // --- 绘图函数 (带荧光效果) ---
    const drawGlowPath = (ctx: CanvasRenderingContext2D, data: Float32Array, color: string, type: 'time' | 'freq') => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 画背景网格
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath(); ctx.moveTo(i * 100, 0); ctx.lineTo(i * 100, 200); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * 50); ctx.lineTo(800, i * 50); ctx.stroke();
        }

        // 画数据线
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((val, i) => {
            const x = (i / data.length) * 800;
            const y = type === 'time' ? 100 - val * 40 : 180 - val * 150;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    useEffect(() => {
        const ctxT = canvasRefTime.current?.getContext('2d');
        const ctxF = canvasRefFreq.current?.getContext('2d');
        if (ctxT) drawGlowPath(ctxT, timeData, '#00f2ff', 'time');
        if (ctxF) drawGlowPath(ctxF, freqData, '#ff0077', 'freq');
    }, [timeData, freqData]);

    return (
        <div className="w-full h-full bg-[#0a0a0c] text-neutral-200 flex flex-col font-sans overflow-hidden">
            {/* 顶部导航栏 */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0d0d11]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <Activity size={20} className="text-black" />
                    </div>
                    <h1 className="text-lg font-bold tracking-wider uppercase">Fourier Playground <span className="text-cyan-500">v2.0</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleAudio}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-cyan-500 text-black font-bold'
                            }`}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        {isPlaying ? "STOP AUDIO" : "LISTEN"}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* 左侧控制面板 */}
                <aside className="w-80 border-r border-white/10 p-6 flex flex-col gap-8 bg-[#0d0d11]">
                    <div className="space-y-6">
                        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                            <button
                                onClick={() => setActiveTab('synth')}
                                className={`flex-1 py-1 text-xs rounded ${activeTab === 'synth' ? 'bg-white/10 text-cyan-400' : 'text-neutral-500'}`}
                            >
                                SYNTHESIZER
                            </button>
                            <button
                                onClick={() => setActiveTab('filter')}
                                className={`flex-1 py-1 text-xs rounded ${activeTab === 'filter' ? 'bg-white/10 text-pink-400' : 'text-neutral-500'}`}
                            >
                                DSP FILTER
                            </button>
                        </div>

                        {activeTab === 'synth' ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-neutral-400">HARMONICS (1-8)</span>
                                    <button onClick={() => setHarmonics([1, 0, 0, 0, 0, 0, 0, 0])} className="text-cyan-500 hover:underline">RESET</button>
                                </div>
                                {harmonics.map((h, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-4 text-[10px] text-neutral-500">f{i + 1}</span>
                                        <input
                                            type="range" min="0" max="1" step="0.01" value={h}
                                            onChange={(e) => {
                                                const newH = [...harmonics];
                                                newH[i] = parseFloat(e.target.value);
                                                setHarmonics(newH);
                                            }}
                                            className="flex-1 accent-cyan-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400 flex justify-between">
                                        NOISE FLOOR <span>{Math.round(noiseLevel * 100)}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="1" step="0.01" value={noiseLevel}
                                        onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                                        className="w-full accent-yellow-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400 flex justify-between">
                                        LPF CUTOFF <span>{cutoff} Hz</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="256" value={cutoff}
                                        onChange={(e) => setCutoff(parseInt(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                        <div className="flex gap-2 text-cyan-400 mb-2">
                            <Info size={16} />
                            <span className="text-xs font-bold">DSP Tip</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-neutral-400">
                            方波由基波和奇次谐波组成。尝试将 f1, f3, f5 分别设为 1, 0.33, 0.2 观察波形变化。
                        </p>
                    </div>
                </aside>

                {/* 右侧主绘图区 */}
                <section className="flex-1 p-8 flex flex-col gap-8 bg-gradient-to-br from-[#0a0a0c] to-[#16161d]">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-cyan-500 tracking-widest uppercase">
                            <Waves size={14} /> Oscilloscope (Time Domain)
                        </div>
                        <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group shadow-inner">
                            <canvas ref={canvasRefTime} width={800} height={200} className="w-full h-full" />
                            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-pink-500 tracking-widest uppercase">
                            <Music size={14} /> Spectrum Analyzer (Frequency Domain)
                        </div>
                        <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden shadow-inner">
                            <canvas ref={canvasRefFreq} width={800} height={200} className="w-full h-full" />
                            <div className="absolute top-0 bottom-0 border-r border-pink-500/30 border-dashed" style={{ left: `${(cutoff / 256) * 100}%` }}></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}