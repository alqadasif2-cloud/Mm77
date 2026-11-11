import React from 'react';
import { useTrading } from '../../context/TradingContext';

export const MessagesView: React.FC = () => {
  const { messages, markMessageAsRead, setIsDrawerOpen } = useTrading();

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 px-3.5 flex items-center justify-between border-b border-[#181818] bg-[#000000]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="القائمة"
            className="w-10 h-10 flex items-center justify-center text-white active:bg-white/10 rounded-full"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-wide">الرسائل والتنبيهات</h1>
        </div>

        <button
          onClick={() => messages.forEach((m) => markMessageAsRead(m.id))}
          className="text-xs text-[#3897f0] font-semibold hover:underline"
        >
          قراءة الكل
        </button>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#16181b]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => markMessageAsRead(msg.id)}
            className={`p-4 transition-colors cursor-pointer ${
              msg.read ? 'bg-transparent' : 'bg-[#15181e]/60'
            } hover:bg-[#15171b]`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {!msg.read && (
                  <span className="w-2 h-2 rounded-full bg-[#e53935] shrink-0"></span>
                )}
                <span className="text-xs font-bold text-[#3897f0]">{msg.sender}</span>
              </div>
              <span className="text-[11px] text-[#707c8b]">{msg.time}</span>
            </div>

            <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
              {msg.title}
            </h3>

            <p className="text-xs text-[#8e9aa8] mt-1 leading-relaxed">
              {msg.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
