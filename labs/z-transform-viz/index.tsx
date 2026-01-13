"use client"; // 必须包含 Client 指令

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, Activity, Plus, Trash2, MousePointer2, Play, Pause, RotateCcw } from 'lucide-react';

interface Complex { re: number; im: number; }

export default function ZTransformViz() {
    const [poles, setPoles] = useState<Complex[]>([{ re: 0.5, im: 0.5 }, { re: 0.5, im: -0.5 }]);
    const [zeros, setZeros] = useState<Complex[]>([{ re: -1, im: 0 }]);
    const [dragging, setDragging] = useState<{ type: 'pole' | 'zero', index: number } | null>(null);
    const [selected, setSelected] = useState<{ type: 'pole' | 'zero', index: number } | null>(null);

    // --- 动画相关状态 ---
    const [isPlaying, setIsPlaying] = useState(true);
    const [theta, setTheta] = useState(0); // 当前扫频角度 (0 to PI)
    const requestRef = useRef<number>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const responseRef = useRef<HTMLCanvasElement>(null);

    const isUnstable = useMemo(() => poles.some(p => (p.re ** 2 + p.im ** 2) >= 0.99), [poles]);

    const toCanvas = (val: number, size: number) => (val + 1.5) * (size / 3);
    const fromCanvas = (val: number, size: number) => (val / (size / 3)) - 1.5;

    // 动画循环
    useEffect(() => {
        if (isPlaying) {
            const animate = () => {
                setTheta(prev => (prev + 0.01) % Math.PI);
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [isPlaying]);

    const deleteSelected = () => {
        if (!selected) return;
        if (selected.type === 'pole') setPoles(prev => prev.filter((_, i) => i !== selected.index));
        else setZeros(prev => prev.filter((_, i) => i !== selected.index));
        setSelected(null);
    };

    const magnitudeResponse = useMemo(() => {
        const res = [];
        for (let i = 0; i <= 100; i++) {
            const omega = (Math.PI * i) / 100;
            const z_re = Math.cos(omega), z_im = Math.sin(omega);
            let num = 1, den = 1;
            zeros.forEach(z => num *= Math.sqrt((z_re - z.re) ** 2 + (z_im - z.im) ** 2));
            poles.forEach(p => den *= Math.sqrt((z_re - p.re) ** 2 + (z_im - p.im) ** 2));
            res.push(num / (den + 0.00001));
        }
        return res;
    }, [poles, zeros]);

    // 绘制 Z 平面 (含相量动画)
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const size = 400;
        const center = toCanvas(0, size);
        ctx.clearRect(0, 0, size, size);

        // 1. 绘制网格与轴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.setLineDash([2, 4]);
        for (let g = -1.5; g <= 1.5; g += 0.5) {
            const pos = toCanvas(g, size);
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, center); ctx.lineTo(size, center);
        ctx.moveTo(center, 0); ctx.lineTo(center, size);
        ctx.stroke();

        // 2. 绘制单位圆
        ctx.beginPath();
        ctx.arc(center, center, (1 / 3) * size, 0, Math.PI * 2);
        ctx.strokeStyle = isUnstable ? '#ef4444' : 'rgba(59, 130, 246, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. 绘制相量扫描动点 (Current Frequency)
        const cur_re = Math.cos(theta), cur_im = Math.sin(theta);
        const cur_x = toCanvas(cur_re, size), cur_y = toCanvas(cur_im, size);

        // 连线到零点和极点 (矢量可视化)
        ctx.lineWidth = 1;
        zeros.forEach(z => {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.beginPath(); ctx.moveTo(cur_x, cur_y); ctx.lineTo(toCanvas(z.re, size), toCanvas(z.im, size)); ctx.stroke();
        });
        poles.forEach(p => {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath(); ctx.moveTo(cur_x, cur_y); ctx.lineTo(toCanvas(p.re, size), toCanvas(p.im, size)); ctx.stroke();
        });

        // 绘制当前频率点
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
        ctx.beginPath(); ctx.arc(cur_x, cur_y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // 4. 绘制点 (零点 O, 极点 X)
        zeros.forEach((z, i) => {
            const isSelected = selected?.type === 'zero' && selected.index === i;
            ctx.beginPath(); ctx.arc(toCanvas(z.re, size), toCanvas(z.im, size), isSelected ? 8 : 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.stroke();
        });
        poles.forEach((p, i) => {
            const isSelected = selected?.type === 'pole' && selected.index === i;
            const x = toCanvas(p.re, size), y = toCanvas(p.im, size), r = isSelected ? 8 : 6;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke();
        });
    }, [poles, zeros, isUnstable, selected, theta]);

    // 绘制幅频曲线与同步扫描线
    useEffect(() => {
        const ctx = responseRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, 400, 200);

        // 绘制幅频特性
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const maxVal = Math.max(...magnitudeResponse, 2);
        magnitudeResponse.forEach((v, i) => {
            const x = (i / 100) * 400;
            const y = 200 - (v / maxVal) * 180;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // 绘制同步扫描线
        const scanX = (theta / Math.PI) * 400;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, 200); ctx.stroke();
        ctx.setLineDash([]);
    }, [magnitudeResponse, theta]);

    return (
        <div className={`w-full p-8 transition-all duration-700 rounded-3xl ${isUnstable ? 'bg-red-950/30' : 'bg-neutral-900 shadow-2xl'}`}>
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">

                {/* 左侧：Z-Plane 交互区 */}
                <div className="relative group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                            <MousePointer2 size={12} /> Interactive Z-Plane
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button onClick={() => setTheta(0)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors">
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>
                    <canvas
                        ref={canvasRef}
                        width={400} height={400}
                        className="bg-black/60 rounded-3xl border border-white/10 cursor-crosshair shadow-inner"
                        onMouseDown={(e) => {
                            const rect = canvasRef.current!.getBoundingClientRect();
                            const x = fromCanvas(e.clientX - rect.left, 400);
                            const y = fromCanvas(e.clientY - rect.top, 400);
                            const pIdx = poles.findIndex(p => Math.hypot(p.re - x, p.im - y) < 0.15);
                            if (pIdx !== -1) { setDragging({ type: 'pole', index: pIdx }); setSelected({ type: 'pole', index: pIdx }); return; }
                            const zIdx = zeros.findIndex(z => Math.hypot(z.re - x, z.im - y) < 0.15);
                            if (zIdx !== -1) { setDragging({ type: 'zero', index: zIdx }); setSelected({ type: 'zero', index: zIdx }); return; }
                            setSelected(null);
                        }}
                        onMouseMove={(e) => {
                            if (!dragging) return;
                            const rect = canvasRef.current!.getBoundingClientRect();
                            const newPos = { re: fromCanvas(e.clientX - rect.left, 400), im: fromCanvas(e.clientY - rect.top, 400) };
                            if (dragging.type === 'pole') { const n = [...poles]; n[dragging.index] = newPos; setPoles(n); }
                            else { const n = [...zeros]; n[dragging.index] = newPos; setZeros(n); }
                        }}
                        onMouseUp={() => setDragging(null)}
                    />
                    {isUnstable && (
                        <div className="absolute top-14 right-6 flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black animate-bounce shadow-lg shadow-red-500/50">
                            <AlertTriangle size={14} /> SYSTEM UNSTABLE
                        </div>
                    )}
                </div>

                {/* 右侧：分析与控制面板 */}
                <div className="flex flex-col gap-8 w-full max-w-sm">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl">
                        <div className="flex items-center gap-2 mb-6 text-cyan-400">
                            <Activity size={18} />
                            <span className="text-xs font-bold uppercase tracking-tighter">Magnitude Response</span>
                        </div>
                        <canvas ref={responseRef} width={400} height={200} className="w-full h-36" />
                        <div className="flex justify-between mt-4 text-[9px] text-neutral-500 font-mono uppercase tracking-widest">
                            <span>0 (DC)</span>
                            <span>Sweep Frequency</span>
                            <span>π (Nyquist)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { setPoles([...poles, { re: 0.5, im: 0 }]); setSelected({ type: 'pole', index: poles.length }); }} className="flex items-center justify-center gap-2 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-bold hover:bg-red-500/20 active:scale-95 transition-all"><Plus size={14} /> POLE</button>
                        <button onClick={() => { setZeros([...zeros, { re: -0.5, im: 0 }]); setSelected({ type: 'zero', index: zeros.length }); }} className="flex items-center justify-center gap-2 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 active:scale-95 transition-all"><Plus size={14} /> ZERO</button>
                        <button disabled={!selected} onClick={deleteSelected} className={`col-span-2 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-bold transition-all ${selected ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'}`}><Trash2 size={14} /> DELETE SELECTED</button>
                    </div>

                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase mb-3 tracking-widest">Real-time Stats</h4>
                        <div className="space-y-2 font-mono text-[10px]">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Current ω:</span>
                                <span className="text-cyan-400">{(theta / Math.PI).toFixed(2)}π rad/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Stability:</span>
                                <span className={isUnstable ? 'text-red-500 font-bold' : 'text-emerald-500'}>{isUnstable ? 'UNSTABLE' : 'STABLE'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}