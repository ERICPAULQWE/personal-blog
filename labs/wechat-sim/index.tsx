"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Plus, Download, User, Smartphone, Clock, ChevronLeft, MoreHorizontal } from 'lucide-react';
import html2canvas from 'html2canvas';

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
  signal: number; // 1-4
  showWifi: boolean;
  backgroundImg: string;
  bottomBarImg: string;
  avatarMe: string;
  avatarOther: string;
}

// --- 默认配置 ---
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
    backgroundImg: '',
    bottomBarImg: '',
    avatarMe: DEFAULT_AVATAR_ME,
    avatarOther: DEFAULT_AVATAR_OTHER,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  // --- 功能函数 ---
  const addMessage = (type: MessageType, sender?: Sender) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      sender,
      content: type === 'text' ? '输入内容...' : (type === 'time' ? '12:00' : ''),
    };
    setMessages([...messages, newMessage]);
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const updateMessageContent = (id: string, content: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, content } : m));
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
      scale: 2,
      backgroundColor: '#f3f3f3',
    });
    const link = document.createElement('a');
    link.download = `wechat-export-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 overflow-hidden">
      
      {/* --- 左侧编辑区 --- */}
      <div className="w-full md:w-96 h-full overflow-y-auto p-6 border-r border-neutral-200 dark:border-neutral-800 space-y-8 bg-white dark:bg-neutral-950">
        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Smartphone size={20} /> 全局设置</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-neutral-500">对方昵称</label>
              <input 
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded border-none focus:ring-2 ring-green-500"
                value={settings.nickname} 
                onChange={e => setSettings({...settings, nickname: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">我的头像</label>
                <input type="file" className="text-xs" onChange={e => handleImageUpload(e, url => setSettings({...settings, avatarMe: url}))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">对方头像</label>
                <input type="file" className="text-xs" onChange={e => handleImageUpload(e, url => setSettings({...settings, avatarOther: url}))} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus size={20} /> 添加消息</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addMessage('text', 'other')} className="px-3 py-1.5 bg-white border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">他人文本</button>
            <button onClick={() => addMessage('text', 'me')} className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600">我的文本</button>
            <button onClick={() => addMessage('time')} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 rounded text-sm hover:bg-neutral-300">时间戳</button>
            <label className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 rounded text-sm cursor-pointer hover:bg-neutral-300">
              添加图片
              <input type="file" className="hidden" onChange={e => handleImageUpload(e, url => {
                const id = Date.now().toString();
                setMessages([...messages, { id, type: 'image', sender: 'me', content: url }]);
              })} />
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={20} /> 消息管理 (拖动/编辑)</h3>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 rounded group">
                <span className={`text-[10px] px-1 rounded ${msg.sender === 'me' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {msg.type === 'time' ? 'TIME' : msg.sender}
                </span>
                <input 
                  className="flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-green-500"
                  value={msg.content} 
                  onChange={e => updateMessageContent(msg.id, e.target.value)}
                />
                <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={exportImage}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
        >
          <Download size={20} /> 导出高清 PNG
        </button>
      </div>

      {/* --- 右侧预览区 --- */}
      <div className="flex-1 flex justify-center items-center p-4 overflow-y-auto bg-neutral-200 dark:bg-neutral-900/50">
        <div 
          ref={previewRef}
          className="w-[375px] min-h-[667px] bg-[#f3f3f3] shadow-2xl relative flex flex-col overflow-hidden"
          style={{ backgroundImage: settings.backgroundImg ? `url(${settings.backgroundImg})` : 'none', backgroundSize: 'cover' }}
        >
          {/* iOS 状态栏模拟 */}
          <div className="h-11 px-6 flex justify-between items-center text-black font-medium text-[14px]">
            <span>{settings.time}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-0.5 h-3 rounded-full ${i < settings.signal ? 'bg-black' : 'bg-black/20'}`} />
                ))}
              </div>
              <div className="w-6 h-3 border border-black/30 rounded-sm relative">
                <div className="absolute left-0 top-0 h-full bg-black" style={{ width: `${settings.battery}%` }} />
              </div>
            </div>
          </div>

          {/* 微信导航栏 */}
          <div className="h-12 px-4 flex justify-between items-center border-b border-black/5">
            <ChevronLeft size={24} />
            <span className="font-bold text-[17px]">{settings.nickname}</span>
            <MoreHorizontal size={24} />
          </div>

          {/* 聊天内容区 */}
          <div className="flex-1 p-4 space-y-4">
            {messages.map((msg) => {
              if (msg.type === 'time') {
                return <div key={msg.id} className="text-center text-[12px] text-black/30 py-2">{msg.content}</div>;
              }

              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2`}>
                  <img 
                    src={isMe ? settings.avatarMe : settings.avatarOther} 
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                    alt="avatar" 
                  />
                  <div className={`relative max-w-[70%] px-3 py-2.5 rounded-md text-[16px] break-words shadow-sm
                    ${isMe ? 'bg-[#95ec69] text-black' : 'bg-white text-black'}
                  `}>
                    {msg.type === 'text' ? (
                      msg.content
                    ) : (
                      <img src={msg.content} className="max-w-full rounded-sm" alt="msg" />
                    )}
                    {/* 气泡小箭头 */}
                    <div className={`absolute top-3 w-2 h-2 rotate-45 
                      ${isMe ? '-right-1 bg-[#95ec69]' : '-left-1 bg-white'}
                    `} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部栏模拟 */}
          {settings.bottomBarImg ? (
            <img src={settings.bottomBarImg} className="w-full" alt="footer" />
          ) : (
            <div className="h-14 bg-[#f7f7f7] border-t border-black/5 flex items-center px-4 gap-3">
              <div className="w-7 h-7 border-[1.5px] border-black/60 rounded-full" />
              <div className="flex-1 h-9 bg-white rounded-md" />
              <div className="w-7 h-7 border-[1.5px] border-black/60 rounded-full flex items-center justify-center text-xl">☺</div>
              <div className="w-7 h-7 border-[1.5px] border-black/60 rounded-full flex items-center justify-center text-xl">+</div>
            </div>
          )}
          <div className="h-5 bg-[#f7f7f7]" /> {/* iOS 底部横条区域 */}
        </div>
      </div>
    </div>
  );
}