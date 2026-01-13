"use client"; // 必须包含 Client 指令

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, Activity, Plus, Trash2, MousePointer2, Play, Pause, RotateCcw, Waves } from 'lucide-react';

interface Complex { re: number; im: number; }

export default function ZTransformViz() {
    // 状态管理
    const [poles, setPoles] = useState<Complex[]>([{ re: 0.5, im: 0.5 }, { re: 0.5, im: -0.5 }]);
    const [zeros, setZeros] = useState<Complex[]>([{ re: -1, im: 0 }]);
    const [dragging, setDragging] = useState<{ type: 'pole' | 'zero', index: number } | null>(null);
    const [selected, setSelected] = useState<{ type: 'pole' | 'zero', index: number } | null>(null);

    // 视图与动画状态
    const [viewMode, setViewMode] = useState<'magnitude' | 'phase'>('magnitude');
    const [isPlaying, setIsPlaying] = useState(true);
    const [theta, setTheta] = useState(0);
    const requestRef = useRef<number>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const responseRef = useRef<HTMLCanvasElement>(null);

    // 核心逻辑：检测系统稳定性
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

    // 计算幅度与相位响应
    const { magnitudeData, phaseData } = useMemo(() => {
        const mags = [], phases = [];
        for (let i = 0; i <= 100; i++) {
            const omega = (Math.PI * i) / 100;
            const z_re = Math.cos(omega), z_im = Math.sin(omega);
            let magNum = 1, magDen = 1, phaseSum = 0;

            zeros.forEach(z => {
                const d_re = z_re - z.re, d_im = z_im - z.im;
                magNum *= Math.sqrt(d_re ** 2 + d_im ** 2);
                phaseSum += Math.atan2(d_im, d_re);
            });
            poles.forEach(p => {
                const d_re = z_re - p.re, d_im = z_im - p.im;
                magDen *= Math.sqrt(d_re ** 2 + d_im ** 2);
                phaseSum -= Math.atan2(d_im, d_re);
            });
            mags.push(magNum / (magDen + 0.00001));
            phases.push(((phaseSum + Math.PI) % (2 * Math.PI)) - Math.PI);
        }
        return { magnitudeData: mags, phaseData: phases };
    }, [poles, zeros]);

    // 绘制 Z 平面
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const size = 400, center = toCanvas(0, size);
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

        // 2. 绘制单位圆 (稳定性预警)
        ctx.beginPath(); ctx.arc(center, center, (1 / 3) * size, 0, Math.PI * 2);
        ctx.strokeStyle = isUnstable ? '#ef4444' : 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = isUnstable ? 2 : 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. 绘制相量扫频点 (修复为白色)
        const cur_re = Math.cos(theta), cur_im = Math.sin(theta);
        const cur_x = toCanvas(cur_re, size), cur_y = toCanvas(cur_im, size);

        ctx.lineWidth = 1;
        zeros.forEach(z => { ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)'; ctx.beginPath(); ctx.moveTo(cur_x, cur_y); ctx.lineTo(toCanvas(z.re, size), toCanvas(z.im, size)); ctx.stroke(); });
        poles.forEach(p => { ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)'; ctx.beginPath(); ctx.moveTo(cur_x, cur_y); ctx.lineTo(toCanvas(p.re, size), toCanvas(p.im, size)); ctx.stroke(); });

        ctx.fillStyle = '#FFFFFF'; // 修复为纯白色
        ctx.shadowBlur = 15; ctx.shadowColor = '#FFFFFF';
        ctx.beginPath(); ctx.arc(cur_x, cur_y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // 4. 绘制零极点
        zeros.forEach((z, i) => {
            const active = selected?.type === 'zero' && selected.index === i;
            ctx.beginPath(); ctx.arc(toCanvas(z.re, size), toCanvas(z.im, size), active ? 8 : 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#10b981'; ctx.lineWidth = active ? 3 : 2; ctx.stroke();
        });
        poles.forEach((p, i) => {
            const active = selected?.type === 'pole' && selected.index === i;
            const x = toCanvas(p.re, size), y = toCanvas(p.im, size), r = active ? 8 : 6;
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = active ? 3 : 2;
            ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke();
        });
    }, [poles, zeros, isUnstable, selected, theta]);

    // 绘制响应曲线
    useEffect(() => {
        const ctx = responseRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, 400, 200);
        const data = viewMode === 'magnitude' ? magnitudeData : phaseData;
        const color = viewMode === 'magnitude' ? '#3b82f6' : '#ec4899';
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
        if (viewMode === 'magnitude') {
            const maxVal = Math.max(...data, 2);
            data.forEach((v, i) => { const x = (i / 100) * 400; const y = 200 - (v / maxVal) * 180; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        } else {
            data.forEach((v, i) => { const x = (i / 100) * 400; const y = 100 - (v / Math.PI) * 90; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        }
        ctx.stroke();
        const scanX = (theta / Math.PI) * 400;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, 200); ctx.stroke(); ctx.setLineDash([]);
    }, [magnitudeData, phaseData, theta, viewMode]);

    return (
        <div className={`w-full p-8 transition-all duration-700 rounded-[2.5rem] border border-white/5 ${isUnstable ? 'bg-red-950/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'bg-neutral-900 shadow-2xl'}`}>
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">

                {/* 左侧区域 */}
                <div className="relative group">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-neutral-500 uppercase">
                            <MousePointer2 size={12} /> Complex Z-Plane
                        </div>
                        <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
                            <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">{isPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
                            <button onClick={() => setTheta(0)} className="p-1.5 rounded-full hover:bg-white/10 text-neutral-500 transition-colors"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} width={400} height={400} className="bg-black/60 rounded-[3rem] border border-white/10 cursor-crosshair shadow-inner"
                        onMouseDown={(e) => {
                            const rect = canvasRef.current!.getBoundingClientRect();
                            const x = fromCanvas(e.clientX - rect.left, 400), y = fromCanvas(e.clientY - rect.top, 400);
                            const pIdx = poles.findIndex(p => Math.hypot(p.re - x, p.im - y) < 0.15);
                            if (pIdx !== -1) { setDragging({ type: 'pole', index: pIdx }); setSelected({ type: 'pole', index: pIdx }); return; }
                            const zIdx = zeros.findIndex(z => Math.hypot(z.re - x, z.im - y) < 0.15);
                            if (zIdx !== -1) { setDragging({ type: 'zero', index: zIdx }); setSelected({ type: 'zero', index: zIdx }); return; }
                            setSelected(null);
                        }}
                        onMouseMove={(e) => {
                            if (!dragging) return;
                            const rect = canvasRef.current!.getBoundingClientRect();
                            const pos = { re: fromCanvas(e.clientX - rect.left, 400), im: fromCanvas(e.clientY - rect.top, 400) };
                            if (dragging.type === 'pole') { const n = [...poles]; n[dragging.index] = pos; setPoles(n); }
                            else { const n = [...zeros]; n[dragging.index] = pos; setZeros(n); }
                        }}
                        onMouseUp={() => setDragging(null)}
                    />
                    {/* 稳定性警告弹窗 */}
                    {isUnstable && (
                        <div className="absolute top-16 right-8 flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full text-xs font-black animate-pulse shadow-xl shadow-red-600/40">
                            <AlertTriangle size={16} /> SYSTEM UNSTABLE
                        </div>
                    )}
                </div>

                {/* 右侧面板 */}
                <div className="flex flex-col gap-8 w-full max-w-sm">
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-6 border border-white/5">
                            <button onClick={() => setViewMode('magnitude')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold transition-all ${viewMode === 'magnitude' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-neutral-500 hover:text-neutral-300'}`}><Activity size={14} /> MAGNITUDE</button>
                            <button onClick={() => setViewMode('phase')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold transition-all ${viewMode === 'phase' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'text-neutral-500 hover:text-neutral-300'}`}><Waves size={14} /> PHASE</button>
                        </div>
                        <canvas ref={responseRef} width={400} height={200} className="w-full h-40" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { setPoles([...poles, { re: 0.5, im: 0 }]); setSelected({ type: 'pole', index: poles.length }); }} className="flex items-center justify-center gap-2 py-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black transition-all active:scale-95"><Plus size={16} /> POLE</button>
                        <button onClick={() => { setZeros([...zeros, { re: -0.5, im: 0 }]); setSelected({ type: 'zero', index: zeros.length }); }} className="flex items-center justify-center gap-2 py-5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black transition-all active:scale-95"><Plus size={16} /> ZERO</button>
                        <button disabled={!selected} onClick={() => { if (!selected) return; if (selected.type === 'pole') setPoles(poles.filter((_, i) => i !== selected.index)); else setZeros(zeros.filter((_, i) => i !== selected.index)); setSelected(null); }} className={`col-span-2 flex items-center justify-center gap-2 py-5 rounded-2xl text-[10px] font-black transition-all ${selected ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-white/5 opacity-50'}`}><Trash2 size={16} /> DELETE NODE</button>
                    </div>
                </div>
            </div>
        </div>
    );
}