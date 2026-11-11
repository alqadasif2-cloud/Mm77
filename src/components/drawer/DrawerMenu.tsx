import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ExnessLogo, MetaQuotesLogo } from '../common/Logos';

export const DrawerMenu: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    activeAccount,
    setActiveTab,
    unreadCount,
    currentUser,
    signInWithGoogle,
    signOutUser
  } = useTrading();

  const [dialogInfo, setDialogInfo] = useState<{ title: string; content: string } | null>(null);

  if (!isDrawerOpen) return null;

  const handleOpenAccounts = () => {
    setActiveTab('accounts');
    setIsDrawerOpen(false);
  };

  const handleNavigate = (tab: any) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 select-none animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Slide-out Menu Panel (Anchored to the right side of the screen) */}
      <div className="fixed top-0 bottom-0 right-0 w-80 max-w-[85vw] h-full bg-[#000000] text-white flex flex-col shadow-2xl z-10 border-l border-[#1c1f26] animate-slide-right">
        {/* Top Header: Account Info & "إدارة الحسابات" (Matching Screenshot_20261110142325.jpg) */}
        <div
          onClick={handleOpenAccounts}
          className="p-5 pb-4 bg-[#000000] border-b border-[#181a1f] cursor-pointer hover:bg-white/[0.03] transition-colors"
        >
          {/* Account Name, Server & Logo Row */}
          <div className="flex items-center justify-between">
            {/* Left side: Account Name and Server (truncated) */}
            <div className="text-right">
              <h2 className="text-[17px] font-bold text-white tracking-tight leading-snug">
                {activeAccount.name}
              </h2>
              <p className="text-[13px] text-[#8e9aa8] mt-0.5 truncate max-w-[195px] tabular-nums" dir="ltr">
                {activeAccount.accountNumber} - {activeAccount.server}
              </p>
            </div>

            {/* Right side: Exness / MetaQuotes Logo */}
            <div className="shrink-0 mr-3">
              {activeAccount.logoType === 'exness' ? (
                <ExnessLogo className="w-11 h-11 rounded-[8px] shadow-md" />
              ) : (
                <MetaQuotesLogo className="w-11 h-11" />
              )}
            </div>
          </div>

          {/* "إدارة الحسابات" link in blue */}
          <div className="mt-3 text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAccounts();
              }}
              className="text-[#3f96f3] text-[15px] font-semibold hover:text-[#64b5f6] transition-colors cursor-pointer"
            >
              إدارة الحسابات
            </button>
          </div>
        </div>

        {/* Menu Navigation List (Matching Screenshot_20261110142325.jpg exactly) */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin">
          {/* 1. التداول (Trade) */}
          <button
            onClick={() => handleNavigate('trade')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              التداول
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Trend line with nodes icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="3 17 9 11 13 15 21 7" />
                <circle cx="21" cy="7" r="2" fill="currentColor" />
                <circle cx="9" cy="11" r="1.5" fill="currentColor" />
                <circle cx="13" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </div>
          </button>

          {/* 2. الأخبار (News) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'الأخبار المالية (MQL5 News)',
                content: '• مؤشر أسعار المستهلكين الأمريكي (CPI) يسجل 3.1% متوافقاً مع التوقعات.\n• الذهب يرتفع وسط استمرار الطلب على الملاذات الآمنة والتوترات الجيوسياسية.\n• أوبك+ تؤكد التزامها بتخفيضات الإنتاج الطوعية لدعم أسواق النفط الخام.'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              الأخبار
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Newspaper folded document icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 4h16v16H4z" rx="2" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="12" y2="16" />
              </svg>
            </div>
          </button>

          {/* 3. صندوق البريد (Mailbox) with Red Badge '7' */}
          <button
            onClick={() => handleNavigate('messages')}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            {/* Red badge on the left as in screenshot */}
            <div className="flex items-center justify-center">
              <span className="bg-[#e53935] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {unreadCount > 0 ? unreadCount : 7}
              </span>
            </div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              صندوق البريد
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Envelope / Mail icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </div>
          </button>

          {/* 4. دفتر اليومية (Journal) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'دفتر اليومية (Journal)',
                content: '2026.11.10 09:30:00: الاتصال بنجاح بخادم ' + activeAccount.server + '\n2026.11.10 09:30:01: مزامنة الأسعار الحية لـ 15 رمز تداول\n2026.11.10 09:30:02: زمن استجابة الاتصال (Ping): 21.4 ms\n2026.11.10 09:30:03: البروتوكول مشفر TLS 1.3 معتمد'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              دفتر اليومية
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Split Ledger / Journal icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="6" y1="8" x2="9" y2="8" />
                <line x1="6" y1="12" x2="9" y2="12" />
                <line x1="15" y1="8" x2="18" y2="8" />
                <line x1="15" y1="12" x2="18" y2="12" />
              </svg>
            </div>
          </button>

          {/* 5. الأعدادات (Settings) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'إعدادات المنصة',
                content: '• أصوات الأوامر والتنفيذ: مفعلة\n• التداول السريع بنقرة واحدة: مفعل\n• إشعارات الأسعار والتنبيهات: مفعلة\n• لغة الواجهة: العربية (افتراضي)\n• نوع الشارت: شموع يابانية (Japanese Candlesticks)'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              الأعدادات
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Gear / Settings icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </button>

          {/* 6. التقويم الاقتصادي (Economic Calendar) with "Ads" Blue Pill Badge */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'التقويم الاقتصادي',
                content: '• قرار الفائدة من البنك المركزي الأمريكي (FED) - الأربعاء 21:00\n• تقرير الوظائف غير الزراعية (NFP) - الجمعة 15:30\n• مؤشر مديري المشتريات الصناعي PMI - الخميس 17:00'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            {/* Blue "Ads" Badge as in Screenshot */}
            <div className="flex items-center">
              <span className="bg-[#0d47a1] text-[#90caf9] border border-[#1976d2] text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                Ads
              </span>
            </div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              التقويم الاقتصادي
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Calendar outline icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </button>

          {/* 7. مجتمع المتداولين (Traders Community) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'مجتمع المتداولين (MQL5 Community)',
                content: 'انضم إلى مجتمع أكثر من 7 مليون متداول حول العالم عبر MQL5:\n• نسخ الصفقات وإشارات التداول المباشرة\n• تبادل التحليلات الفنية والرسوم البيانية\n• مناقشات منتديات التداول والمؤشرات المجانية'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              مجتمع المتداولين
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* People / Community icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </button>

          {/* 8. MQL5 Algo Trading */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'MQL5 Algo Trading',
                content: 'سوق الخوارزميات والتداول الآلي (Expert Advisors):\n• أكثر من 20,000 روبوت تداول آلي ومؤشر فني\n• إمكانية تشغيل المستشارين الآليين على مدار 24/7\n• استئجار خادم افتراضي خاص (Forex VPS) بنقرة واحدة'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-bold text-white group-hover:text-[#64b5f6] transition-colors tracking-wide" dir="ltr">
              MQL5 Algo Trading
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Paper airplane / Navigation send icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
          </button>

          {/* 9. دليل المستخدم (User Guide) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'دليل المستخدم (User Guide)',
                content: 'دليل الاستخدام الكامل لمنصة MetaTrader 5 للهاتف:\n1. فتح وإغلاق الصفقات بأسعار السوق الفورية\n2. تحديد وقف الخسارة (Stop Loss) وجني الأرباح (Take Profit)\n3. تخصيص مؤشرات الشارت والفريمات الزمنية\n4. إدارة الحسابات المتعددة وسجل الصفقات المغلقة'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              دليل المستخدم
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Question mark circle icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </button>

          {/* 10. عن (About) */}
          <button
            onClick={() => {
              setDialogInfo({
                title: 'عن MetaTrader 5',
                content: 'MetaTrader 5 Mobile Edition\nالإصدار: 5.0.3800\nالمطور: MetaQuotes Ltd.\nالوسيط المعتمد: Exness Technologies Ltd.\nجميع الحقوق محفوظة © 2000-2026.'
              });
            }}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right group"
          >
            <div className="w-6"></div>
            <span className="text-[15px] font-semibold text-white group-hover:text-[#64b5f6] transition-colors">
              عن
            </span>
            <div className="w-6 h-6 flex items-center justify-center text-white shrink-0">
              {/* Information circle icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Info Dialog Popup */}
      {dialogInfo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setDialogInfo(null)}
        >
          <div
            className="bg-[#1c1e24] border border-[#2e333d] rounded-2xl w-full max-w-xs p-5 text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-white text-base mb-2">{dialogInfo.title}</h4>
            <p className="text-xs text-[#8e9aa8] whitespace-pre-line leading-relaxed mb-4">
              {dialogInfo.content}
            </p>
            <button
              onClick={() => setDialogInfo(null)}
              className="w-full py-2.5 bg-[#3897f0] hover:bg-[#2884dc] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
