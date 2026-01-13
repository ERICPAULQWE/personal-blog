"use client";

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Trash2, Plus, Download, Smartphone, Clock, ChevronLeft, MoreHorizontal, Mic, Wifi, Image as ImageIcon } from 'lucide-react';

// --- 类型定义 ---
type MessageType = 'text' | 'image' | 'time';
type Sender = 'me' | 'other';

interface Message {
    id: string;
    type: MessageType;
    sender?: Sender;
    content: string;
}

interface Settings {
    nickname: string;
    time: string;
    battery: number;
    signal: number;
    showWifi: boolean;
    unreadCount: number;
    avatarMe: string;
    avatarOther: string;
}

export default function WeChatSimulator() {
    // 1. 默认对话内容
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', type: 'time', content: '10:24' },
        { id: '2', type: 'text', sender: 'other', content: '这个微信模拟器好用吗？' },
        { id: '3', type: 'text', sender: 'me', content: '非常丝滑，甚至可以一键导出高清图！' },
    ]);

    const [settings, setSettings] = useState<Settings>({
        nickname: '张三',
        time: '14:20',
        battery: 85,
        signal: 4,
        showWifi: true,
        unreadCount: 0,
        avatarMe: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        avatarOther: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    });

    const [activeId, setActiveId] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // --- 通用文件上传处理 ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            callback(url);
        }
    };

    // --- 添加消息逻辑 ---
    const addMessage = (type: MessageType, sender?: Sender, content?: string) => {
        const id = Date.now().toString();
        setMessages([...messages, {
            id,
            type,
            sender,
            content: content || (type === 'text' ? '请输入内容...' : '12:00')
        }]);
        setActiveId(id);
    };

    const updateMessage = (id: string, content: string) => {
        setMessages(messages.map(m => m.id === id ? { ...m, content } : m));
    };

    const exportImage = async () => {
        if (!previewRef.current) return;
        try {
            const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, backgroundColor: '#f3f3f3' });
            const link = document.createElement('a');
            link.download = `wechat-export.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { alert('导出失败'); }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-[#f0f0f0] dark:bg-neutral-900 overflow-hidden font-sans">

            {/* --- 左侧编辑面板 --- */}
            <div className="w-full md:w-[420px] h-full overflow-y-auto p-6 border-r border-neutral-200 dark:border-neutral-800 space-y-8 bg-white dark:bg-neutral-950 z-20">
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={14} /> 身份与全局设置
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] opacity-50 block mb-1">对方昵称</label>
                            <input className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-sm text-black dark:text-white"
                                value={settings.nickname} onChange={e => setSettings({ ...settings, nickname: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] opacity-50 block">我的头像</label>
                                <div className="flex items-center gap-2">
                                    <img src={settings.avatarMe} className="w-10 h-10 rounded border" alt="me" />
                                    <label className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded cursor-pointer hover:bg-neutral-200">
                                        <ImageIcon size={16} />
                                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, avatarMe: url }))} />
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] opacity-50 block">对方头像</label>
                                <div className="flex items-center gap-2">
                                    <img src={settings.avatarOther} className="w-10 h-10 rounded border" alt="other" />
                                    <label className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded cursor-pointer hover:bg-neutral-200">
                                        <ImageIcon size={16} />
                                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, url => setSettings({ ...settings, avatarOther: url }))} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Plus size={14} /> 插入消息
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addMessage('text', 'other')} className="py-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs border border-neutral-200">他人文本</button>
                        <button onClick={() => addMessage('text', 'me')} className="py-2 bg-green-500 text-white rounded text-xs">我的文本</button>

                        {/* 他人图片上传 */}
                        <label className="py-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs border border-neutral-200 text-center cursor-pointer flex items-center justify-center gap-1">
                            <ImageIcon size={12} /> 他人图片
                            <input type="file" className="hidden" onChange={e => handleFileUpload(e, url => addMessage('image', 'other', url))} />
                        </label>

                        {/* 我的图片上传 */}
                        <label className="py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs border border-green-200 text-center cursor-pointer flex items-center justify-center gap-1">
                            <ImageIcon size={12} /> 我的图片
                            <input type="file" className="hidden" onChange={e => handleFileUpload(e, url => addMessage('image', 'me', url))} />
                        </label>

                        <button onClick={() => addMessage('time')} className="py-2 col-span-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs border border-neutral-200">插入时间戳</button>
                    </div>
                </section>

                <section className="flex-1 space-y-3">
                    <h3 className="text-xs font-bold text-neutral-400">管理已发送内容</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} id={`edit-${msg.id}`}
                                className={`flex items-center gap-2 p-2 rounded border transition-all ${activeId === msg.id ? 'border-green-500 bg-green-50' : 'border-transparent bg-neutral-50 dark:bg-neutral-800'}`}>
                                {msg.type === 'image' ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <img src={msg.content} className="w-10 h-10 object-cover rounded" />
                                        <span className="text-[10px] opacity-40">图片消息</span>
                                    </div>
                                ) : (
                                    <input className="flex-1 bg-transparent text-sm outline-none text-black dark:text-white" value={msg.content} onChange={e => updateMessage(msg.id, e.target.value)} onFocus={() => setActiveId(msg.id)} />
                                )}
                                <button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </section>

                <button onClick={exportImage} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
                    <Download size={18} /> 导出高清 PNG 截图
                </button>
            </div>

            {/* --- 右侧预览区 --- */}
            <div className="flex-1 flex justify-center items-start md:items-center p-4 bg-neutral-200 dark:bg-black/30 overflow-auto">
                <div
                    ref={previewRef}
                    className="w-[375px] h-[750px] bg-[#f3f3f3] shadow-2xl relative flex flex-col shrink-0 overflow-hidden"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif' }}
                >
                    {/* 1. 状态栏 - 采用 sticky 确保不消失 */}
                    <div className="h-11 w-full px-6 flex justify-between items-end pb-1.5 shrink-0 z-[100] bg-[#f3f3f3] sticky top-0">
                        <span className="text-[15px] font-bold text-black tracking-tight">{settings.time}</span>
                        <div className="flex items-center gap-1.5 mb-[1px]">
                            <div className="flex gap-[1.5px] items-end h-[10px]">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-[3px] rounded-[0.5px] ${i < settings.signal ? 'bg-black' : 'bg-black/20'}`} style={{ height: `${(i + 1) * 2.5}px` }} />
                                ))}
                            </div>
                            <Wifi size={14} strokeWidth={3} className="text-black" />
                            <div className="relative flex items-center ml-0.5">
                                <div className="w-[22px] h-[11.5px] border border-black/30 rounded-[2.5px] p-[1px]">
                                    <div className="h-full bg-black rounded-[0.5px]" style={{ width: `${settings.battery}%` }} />
                                </div>
                                <div className="w-[1.5px] h-[4px] bg-black/30 rounded-r-full ml-[-0.5px]" />
                            </div>
                        </div>
                    </div>

                    {/* 2. 导航栏 */}
                    <div className="h-12 w-full flex justify-between items-center px-2 bg-[#f3f3f3] border-b border-black/5 shrink-0 z-[90] sticky top-11">
                        <div className="flex items-center relative min-w-[60px]">
                            <ChevronLeft size={28} strokeWidth={2} className="text-black" />
                            {settings.unreadCount > 0 && (
                                <div className="absolute left-7 top-0 min-w-[18px] h-[18px] bg-[#fa5151] rounded-full flex items-center justify-center text-white text-[11px] px-1 font-medium">
                                    {settings.unreadCount}
                                </div>
                            )}
                        </div>
                        <div className="font-bold text-[17px] text-black tracking-wide truncate max-w-[180px]">
                            {settings.nickname}
                        </div>
                        <div className="min-w-[60px] flex justify-end pr-2">
                            <MoreHorizontal size={24} className="text-black" />
                        </div>
                    </div>

                    {/* 3. 聊天内容区 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#f3f3f3]">
                        {messages.map((msg) => {
                            if (msg.type === 'time') return <div key={msg.id} className="text-center text-[12px] text-black/20 my-4">{msg.content}</div>;

                            const isMe = msg.sender === 'me';
                            return (
                                <div key={msg.id}
                                    onClick={() => {
                                        setActiveId(msg.id);
                                        document.getElementById(`edit-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5 cursor-pointer`}>
                                    <img src={isMe ? settings.avatarMe : settings.avatarOther} className="w-10 h-10 rounded-[4px] object-cover shrink-0 shadow-sm" alt="avatar" />

                                    <div className={`relative max-w-[70%] text-[16px] leading-[1.45] break-words
                    ${msg.type === 'text' ? (isMe ? 'bg-[#95ec69] text-black px-3 py-2.5 rounded-[6px] shadow-sm' : 'bg-white text-black px-3 py-2.5 rounded-[6px] shadow-sm') : ''}
                    ${activeId === msg.id ? 'ring-2 ring-green-400 ring-offset-1' : ''}
                  `}>
                                        {msg.type === 'text' ? (
                                            msg.content
                                        ) : (
                                            <img src={msg.content} className="max-w-full rounded-[4px] border border-black/5 block" alt="msg" />
                                        )}

                                        {/* 文本气泡尖角 */}
                                        {msg.type === 'text' && (
                                            <div className={`absolute top-[14px] w-2 h-2 rotate-45 ${isMe ? '-right-[4px] bg-[#95ec69]' : '-left-[4px] bg-white'}`} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 4. 底部输入栏 */}
                    <div className="h-14 w-full bg-[#f7f7f7] border-t border-black/5 flex items-center px-4 gap-3 shrink-0 z-[90]">
                        <div className="w-7 h-7 border-[1.2px] border-black/40 rounded-full flex items-center justify-center opacity-70"><Mic size={18} /></div>
                        <div className="flex-1 h-9 bg-white rounded-md border border-black/5" />
                        <span className="text-2xl opacity-40">☺</span>
                        <span className="text-2xl opacity-40">+</span>
                    </div>
                    <div className="h-5 w-full bg-[#f7f7f7] shrink-0 flex justify-center items-center pb-1">
                        <div className="w-32 h-1 bg-black rounded-full opacity-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}