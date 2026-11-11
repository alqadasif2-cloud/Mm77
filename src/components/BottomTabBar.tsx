import React from 'react';
import { useTrading } from '../context/TradingContext';
import { TabType } from '../types/mt5';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount } = useTrading();

  const tabs: {
    id: TabType;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'quotes',
      label: 'طلبات الأسعار',
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Arrow up on left, arrow down on right */}
          <path d="M7 20V4M7 4L3 8M7 4L11 8" />
          <path d="M17 4V20M17 20L13 16M17 20L21 16" />
        </svg>
      )
    },
    {
      id: 'chart',
      label: 'الرسم البياني',
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          {/* MT5 Candlestick icon */}
          <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="1.8" />
          <rect x="6" y="7" width="4" height="9" fill={isActive ? "currentColor" : "none"} stroke="currentColor" rx="0.5" />
          <line x1="8" y1="16" x2="8" y2="21" stroke="currentColor" strokeWidth="1.8" />

          <line x1="16" y1="5" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="9" width="4" height="7" fill="none" stroke="currentColor" rx="0.5" />
          <line x1="16" y1="16" x2="16" y2="20" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'trade',
      label: 'التداول',
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Trend line with nodes */}
          <polyline points="3 17 9 11 13 15 21 7" />
          <circle cx="21" cy="7" r="2" fill="currentColor" />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" />
          <circle cx="13" cy="15" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'history',
      label: 'السجل',
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Clock with counter-clockwise arrow */}
          <path d="M12 8v4l3 3" />
          <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>
      )
    },
    {
      id: 'messages',
      label: 'الرسائل',
      badge: unreadCount,
      icon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Dual speech bubbles */}
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="13" y2="13" />
        </svg>
      )
    }
  ];

  return (
    <nav className="w-full bg-[#000000] border-t border-[#181818] py-1.5 px-1 flex items-center justify-around select-none z-40">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] transition-all group"
          >
            {/* Pill highlight around icon when active (as seen in MT5 Android screenshot) */}
            <div
              className={`relative px-4 py-1 rounded-full flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#1a2936] text-[#64b5f6]'
                  : 'text-[#8e9aa8] hover:text-[#cfd8dc]'
              }`}
            >
              {tab.icon(isActive)}

              {/* Notification badge */}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ea4335] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-black">
                  {tab.badge}
                </span>
              )}
            </div>

            {/* Tab text label */}
            <span
              className={`text-[11px] font-semibold mt-1 tracking-tight transition-colors ${
                isActive ? 'text-[#ffffff]' : 'text-[#8e9aa8]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
