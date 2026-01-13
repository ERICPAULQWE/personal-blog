"use client";

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Plus, Download, Smartphone, Clock, ChevronLeft, MoreHorizontal, Mic } from 'lucide-react';
import html2canvas from 'html2canvas';

// --- 类型定义 ---
type MessageType = 'text' | 'image' | 'time' | 'voice';
type Sender = 'me' | 'other';

interface Message {
    id: string;
    type: MessageType;
    sender?: Sender;
    content: string;
    duration?: number; // 仅语音使用
}

interface Settings {
    nickname: string;
    time: string;
    battery: number;
    signal: number;
    showWifi: boolean;
    avatarMe: string;
    avatarOther: string;
}

const DEFAULT_AVATAR_ME = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
const DEFAULT_AVATAR_OTHER = "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka";

export default function WeChatSimulator() {
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
        avatarMe: DEFAULT_AVATAR_ME,
        avatarOther: DEFAULT_AVATAR_OTHER,
    });

    const previewRef = useRef<HTMLDivElement>(null);

    // --- 功能函数 ---
    const addMessage = (type: MessageType, sender?: Sender, extra?: Partial<Message>) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type,
            sender,
            content: type === 'text' ? '输入内容...' : (type === 'time' ? '12:00' : ''),
            ...extra
        };
        setMessages([...messages, newMessage]);
    };

    const deleteMessage = (id: string) => {
        setMessages(messages.filter(m => m.id !== id));
    };

    const updateMessage = (id: string, updates: Partial<Message>) => {
        setMessages(messages.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            callback(url);
        }
    };

    const exportImage = async () => {
        if (!previewRef.current) return;
        const canvas = await html2canvas(previewRef.current, {
            useCORS: true,
            scale: 3, // 提高到3倍渲染，导出超清原图
            backgroundColor: '#f3f3f3',
            logging: false,
        });
        const link = document.createElement('a');
        link.download = `wechat-export-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 overflow-hidden font-sans">

            {/* --- 左侧控制台 --- */}
            <div className="w-full md:w-96 h-full overflow-y-auto p-6 border-r border-neutral-200 dark:border-neutral-800 space-y-8 bg-white dark:bg-neutral-950 z-10">
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                        <Smartphone size={16} /> 界面设置
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs mb-1 block opacity-60">对方昵称</label>
                            <input
                                className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded border-none focus:ring-2 ring-green-500 outline-none"
                                value={settings.nickname}
                                onChange={e => setSettings({ ...settings, nickname: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs mb-1 block opacity-60">我的头像</label>
                                <input type="file" className="text-[10px]" onChange={e => handleImageUpload(e, url => setSettings({ ...settings, avatarMe: url }))} />
                            </div>
                            <div>
                                <label className="text-xs mb-1 block opacity-60">对方头像</label>
                                <input type="file" className="text-[10px]" onChange={e => handleImageUpload(e, url => setSettings({ ...settings, avatarOther: url }))} />
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                        <Plus size={16} /> 快速插入
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => addMessage('text', 'other')} className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs hover:bg-neutral-200 transition-colors">他人文本</button>
                        <button onClick={() => addMessage('text', 'me')} className="px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors">我的文本</button>
                        <button onClick={() => addMessage('time')} className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs hover:bg-neutral-200">插入时间</button>
                        <label className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs cursor-pointer hover:bg-neutral-200 text-center">
                            插入图片
                            <input type="file" className="hidden" onChange={e => handleImageUpload(e, url => addMessage('image', 'me', { content: url }))} />
                        </label>
                        <button onClick={() => addMessage('voice', 'other', { duration: 5 })} className="px-3 py-2 border border-neutral-200 rounded text-xs hover:bg-neutral-50 flex items-center justify-center gap-1 dark:text-white">
                            <Mic size={12} /> 他人语音
                        </button>
                    </div>
                </section>

                <section className="flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                        <Clock size={16} /> 消息管理
                    </h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg group border border-transparent hover:border-green-500/30 transition-all">
                                <input
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    value={msg.content}
                                    onChange={e => updateMessage(msg.id, { content: e.target.value })}
                                />
                                <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <button
                    onClick={exportImage}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98]"
                >
                    <Download size={20} /> 导出高清 PNG 截图
                </button>
            </div>

            {/* --- 右侧预览区 (iPhone 模拟) --- */}
            <div className="flex-1 flex justify-center items-center p-8 overflow-y-auto bg-[#e0e0e0] dark:bg-neutral-900/80">
                <div
                    ref={previewRef}
                    className="w-[375px] min-h-[720px] bg-[#f3f3f3] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative flex flex-col overflow-hidden select-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' }}
                >
                    {/* iOS 状态栏 */}
                    <div className="h-12 px-8 flex justify-between items-end pb-2 text-black font-semibold text-[14px]">
                        <span>{settings.time}</span>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="flex gap-0.5 items-end h-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-[3px] rounded-full ${i < settings.signal ? 'bg-black' : 'bg-black/20'}`} style={{ height: `${(i + 1) * 25}%` }} />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold">5G</span>
                            <div className="w-6 h-3 border border-black/30 rounded-[3px] p-[1px] relative">
                                <div className="h-full bg-black rounded-[1px]" style={{ width: `${settings.battery}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* 微信导航栏 */}
                    <div className="h-12 px-4 flex justify-between items-center bg-[#f3f3f3]/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-20">
                        <div className="flex items-center">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                            <span className="text-[14px] ml-[-4px]">微信</span>
                        </div>
                        <span className="font-bold text-[17px] truncate max-w-[180px]">{settings.nickname}</span>
                        <MoreHorizontal size={24} />
                    </div>

                    {/* 聊天内容区 */}
                    <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                        {messages.map((msg) => {
                            if (msg.type === 'time') {
                                return <div key={msg.id} className="text-center text-[12px] text-black/30 my-4">{msg.content}</div>;
                            }

                            const isMe = msg.sender === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
                                    <img
                                        src={isMe ? settings.avatarMe : settings.avatarOther}
                                        className="w-10 h-10 rounded-[4px] object-cover flex-shrink-0"
                                        alt="avatar"
                                    />
                                    <div className={`relative group max-w-[70%] text-[16px] leading-[1.4]
                    ${msg.type === 'text' ? (isMe ? 'bg-[#95ec69] text-black px-3 py-2.5 rounded-[6px]' : 'bg-white text-black px-3 py-2.5 rounded-[6px]') : ''}
                  `}>
                                        {/* 文本内容 */}
                                        {msg.type === 'text' && msg.content}

                                        {/* 图片内容 */}
                                        {msg.type === 'image' && (
                                            <img src={msg.content} className="max-w-full rounded-[4px] border border-black/5" alt="msg" />
                                        )}

                                        {/* 语音内容 */}
                                        {msg.type === 'voice' && (
                                            <div className={`flex items-center gap-2 min-w-[60px] h-10 ${isMe ? 'flex-row-reverse' : ''} ${isMe ? 'bg-[#95ec69]' : 'bg-white'} px-3 rounded-[6px]`}>
                                                <Mic size={16} className={isMe ? 'rotate-0' : 'rotate-0'} />
                                                <span className="text-xs opacity-40">{msg.duration || 5}"</span>
                                            </div>
                                        )}

                                        {/* 气泡小箭头 - 仅针对非图片消息 */}
                                        {msg.type !== 'image' && (
                                            <div className={`absolute top-[14px] w-2 h-2 rotate-45 
                        ${isMe ? '-right-[4px] bg-[#95ec69]' : '-left-[4px] bg-white'}
                      `} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 底部栏模拟 */}
                    <div className="h-14 bg-[#f7f7f7] border-t border-black/5 flex items-center px-4 gap-3">
                        <div className="w-7 h-7 border-[1.5px] border-black/60 rounded-full flex items-center justify-center">
                            <Mic size={18} />
                        </div>
                        <div className="flex-1 h-9 bg-white rounded-md border border-black/5" />
                        <span className="text-2xl opacity-70">☺</span>
                        <span className="text-2xl opacity-70">+</span>
                    </div>
                    <div className="h-6 bg-[#f7f7f7] flex justify-center items-center pb-2">
                        <div className="w-32 h-1 bg-black rounded-full opacity-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}