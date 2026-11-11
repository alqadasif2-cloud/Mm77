import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ExnessLogo, MetaQuotesLogo } from '../common/Logos';
import { Account } from '../../types/mt5';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    activeAccount,
    setActiveAccount,
    setIsDrawerOpen,
    setAccountInfoModalOpen,
    setOtpModalOpen,
    setAddAccountModalOpen,
    deleteAccount,
    setActiveTab,
    currentUser,
    signInWithGoogle
  } = useTrading();

  const [menuOpen, setMenuOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [qrModalAccount, setQrModalAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [notificationsMuted, setNotificationsMuted] = useState(false);

  const handleSelectAccount = (account: Account) => {
    setActiveAccount(account);
  };

  const inactiveAccounts = accounts.filter((acc) => acc.id !== activeAccount.id);

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden select-none">
      {/* 1. Header (Matching Screenshot_20261110131229_b76251f9.jpg) */}
      <header className="h-14 px-3 flex items-center justify-between border-b border-[#141517] bg-[#000000] z-20 shrink-0">
        {/* Right side: Hamburger and Title "الحسابات" */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="القائمة الرئيسية"
            className="w-10 h-10 flex items-center justify-center text-white active:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">الحسابات</h1>
        </div>

        {/* Left side icons: Certificate/Medal, Plus, 3-dots */}
        <div className="flex items-center gap-1 text-[#ffffff]">
          {/* Certificate with star / medal icon */}
          <button
            onClick={() => setCertModalOpen(true)}
            aria-label="الشهادات وإدارة المفاتيح"
            title="الشهادات"
            className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.5 13.5L18 22l-6-3-6 3 2.5-8.5" />
              <path d="M10 7.5l1.5-1 1.5 1-.5 1.8h-2z" fill="currentColor" />
            </svg>
          </button>

          {/* Add Account Plus */}
          <button
            onClick={() => setAddAccountModalOpen(true)}
            aria-label="إضافة حساب جديد"
            title="إضافة حساب"
            className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Three vertical dots menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="خيارات إضافية"
              className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute left-0 top-11 w-52 bg-[#202226] border border-[#2e3238] rounded-xl shadow-2xl py-1.5 z-50 text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => setActiveTab('trade')}
                  className="w-full text-right px-4 py-2 hover:bg-white/10 text-white flex items-center justify-between"
                >
                  <span>بدء التداول</span>
                  <span className="text-xs text-blue-400">⚡</span>
                </button>
                <button
                  onClick={() => setAccountInfoModalOpen(true)}
                  className="w-full text-right px-4 py-2 hover:bg-white/10 text-[#d8dfe6]"
                >
                  خصائص الحساب
                </button>
                <button
                  onClick={() => setOtpModalOpen(true)}
                  className="w-full text-right px-4 py-2 hover:bg-white/10 text-[#d8dfe6]"
                >
                  مولد OTP
                </button>
                <button
                  onClick={() => setAddAccountModalOpen(true)}
                  className="w-full text-right px-4 py-2 hover:bg-white/10 text-[#d8dfe6]"
                >
                  تسجيل الدخول إلى حساب آخر
                </button>
                <div className="h-px bg-[#2e3238] my-1"></div>
                <button
                  onClick={() => {
                    setStatusNotice('تم مسح كلمات المرور المحفوظة من الذاكرة بنجاح.');
                    setTimeout(() => setStatusNotice(null), 3000);
                  }}
                  className="w-full text-right px-4 py-2 hover:bg-white/10 text-[#e57373]"
                >
                  مسح كلمات المرور المحفوظة
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {statusNotice && (
        <div className="bg-[#1e293b] text-[#38bdf8] border-b border-[#334155] px-4 py-2 text-xs flex items-center justify-between shrink-0">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-white">✕</button>
        </div>
      )}

      {/* 2. Main Accounts Container */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 scrollbar-thin">
        {/* Active Account Card (Center Logo Layout matching Screenshot_20261110131229_b76251f9.jpg) */}
        {activeAccount && (
          <div className="relative bg-[#1e1e24] rounded-[24px] p-5 shadow-lg border border-[#2b2e38] overflow-hidden">
            {/* Top Center Logo */}
            <div className="flex flex-col items-center justify-center w-full">
              <div className="shrink-0 mb-3">
                {activeAccount.logoType === 'exness' ? (
                  <ExnessLogo className="w-14 h-14 rounded-[12px] shadow-md" />
                ) : (
                  <MetaQuotesLogo className="w-14 h-14" />
                )}
              </div>

              {/* Account Title */}
              <h2 className="text-[18px] font-bold text-white tracking-tight leading-snug">
                {activeAccount.name}
              </h2>

              {/* Broker Name in Light Blue */}
              <p className="text-[14px] font-medium text-[#3f96f3] mt-0.5">
                {activeAccount.broker}
              </p>

              {/* Server and Account Number */}
              <p className="text-[13px] font-normal text-[#8e9aa8] mt-1 tabular-nums" dir="ltr">
                {activeAccount.accountNumber} — {activeAccount.server}
              </p>

              {/* Access Point subtitle */}
              <p className="text-[12px] font-normal text-[#8e9aa8] mt-0.5">
                {activeAccount.lastKnownLabel === 'Access point' ? 'Access point' : 'Access point'}
              </p>

              {/* Big Bold Balance */}
              <div className="text-[30px] font-bold text-white tracking-tight tabular-nums mt-3 mb-1">
                {activeAccount.balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                <span className="text-[20px] font-normal text-white">{activeAccount.currency}</span>
              </div>
            </div>

            {/* Active Card Footer: Bell on Left, Delete and QR on Right */}
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#2a2c36]/80">
              {/* Left: Bell notification button */}
              <button
                onClick={() => {
                  setNotificationsMuted(!notificationsMuted);
                  setStatusNotice(notificationsMuted ? 'تم تفعيل إشعارات الحساب.' : 'تم كتم إشعارات الحساب.');
                  setTimeout(() => setStatusNotice(null), 2500);
                }}
                aria-label="تنبيهات الحساب"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  notificationsMuted ? 'text-[#e57373]' : 'text-[#8e9aa8] hover:text-white'
                }`}
                title="تنبيهات الحساب"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>

              {/* Right: Delete and QR icons */}
              <div className="flex items-center gap-3">
                {/* Delete button */}
                <button
                  onClick={() => setAccountToDelete(activeAccount)}
                  aria-label="حذف الحساب"
                  title="حذف هذا الحساب"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e9aa8] hover:text-[#ef5350] hover:bg-[#ef5350]/15 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                {/* QR Code Icon */}
                <button
                  onClick={() => setQrModalAccount(activeAccount)}
                  aria-label="QR Code"
                  className="w-8 h-8 flex items-center justify-center text-[#8e9aa8] hover:text-white transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="6" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="17" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="17" y="17" width="1" height="1" fill="currentColor" />
                    <rect x="6" y="17" width="1" height="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Separator Text: "الاتصال إلى" (Matching Screenshot_20261110131229_b76251f9.jpg) */}
        {inactiveAccounts.length > 0 && (
          <div className="text-right text-[#8e9aa8] text-[13px] font-semibold pr-1 pt-1 pb-0.5">
            الاتصال إلى
          </div>
        )}

        {/* Inactive Accounts List */}
        {inactiveAccounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => handleSelectAccount(acc)}
            className="relative bg-[#1e1e24] rounded-[22px] p-4 border border-[#262831] hover:border-[#3897f0]/60 transition-all cursor-pointer overflow-hidden group shadow-md"
          >
            {/* Top Right Diagonal Ribbon: Green Demo Banner (Matching Screenshot_20261110131229_b76251f9.jpg) */}
            {acc.type === 'demo' && (
              <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-10">
                <div className="bg-[#00c853] text-white font-extrabold text-[11px] tracking-wider text-center py-1 absolute top-4 -right-9 w-32 rotate-45 shadow-sm">
                  Demo
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex items-start justify-between">
              {/* Left side: Account details */}
              <div className="text-right pr-1">
                <h3 className="text-[17px] font-bold text-white tracking-tight">
                  {acc.name}
                </h3>
                <p className="text-[13px] font-medium text-[#3f96f3] mt-0.5">
                  {acc.broker}
                </p>
                <p className="text-[12px] font-normal text-[#8e9aa8] mt-0.5 tabular-nums" dir="ltr">
                  {acc.accountNumber} — {acc.server}
                </p>
              </div>

              {/* Right side: Broker Logo */}
              <div className="shrink-0 pl-1 mr-4">
                {acc.logoType === 'exness' ? (
                  <ExnessLogo className="w-12 h-12 rounded-[10px]" />
                ) : (
                  <MetaQuotesLogo className="w-12 h-12" />
                )}
              </div>
            </div>

            {/* Lower Right Balance Section */}
            <div className="text-right mt-3 px-1">
              <div className="text-[22px] font-bold text-white tracking-tight tabular-nums">
                {acc.balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <div className="text-[12px] text-[#8e9aa8] mt-0.5">
                {acc.lastKnownLabel || 'آخر ما عرف ، USD'}
              </div>
            </div>

            {/* Card Footer: (i) on the left, Delete and QR on the right */}
            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#2a2c36]/80">
              {/* Info (i) icon button on the left */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAccount(acc);
                  setAccountInfoModalOpen(true);
                }}
                aria-label="معلومات الحساب"
                className="w-7 h-7 rounded-full border border-[#8e9aa8]/70 flex items-center justify-center text-[#8e9aa8] hover:text-white hover:border-white transition-colors cursor-pointer"
              >
                <span className="text-xs font-serif font-bold italic leading-none">i</span>
              </button>

              {/* Right Actions: Delete & QR Code */}
              <div className="flex items-center gap-2">
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToDelete(acc);
                  }}
                  aria-label="حذف الحساب"
                  title="حذف هذا الحساب"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#8e9aa8] hover:text-[#ef5350] hover:bg-[#ef5350]/15 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                {/* QR Code */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrModalAccount(acc);
                  }}
                  aria-label="QR Code"
                  className="w-7 h-7 flex items-center justify-center text-[#8e9aa8] hover:text-white transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="6" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="17" y="6" width="1" height="1" fill="currentColor" />
                    <rect x="17" y="17" width="1" height="1" fill="currentColor" />
                    <rect x="6" y="17" width="1" height="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {certModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setCertModalOpen(false)}
        >
          <div
            className="bg-[#1f2125] border border-[#2e3238] rounded-2xl w-full max-w-sm p-5 text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
              <h3 className="font-bold text-lg text-white">إدارة الشهادات الرقمية</h3>
              <span className="text-yellow-400 text-xl">🎖️</span>
            </div>
            <p className="text-sm text-[#8e9aa8] my-4 leading-relaxed">
              شهادة أمان الحساب مشفرة ومصادق عليها من قبل شركة Exness و MetaQuotes.
              <br />
              الحساب النشط: <strong className="text-white">{activeAccount.name} ({activeAccount.accountNumber})</strong>
            </p>
            <div className="bg-[#15171a] p-3 rounded-xl border border-[#282b30] text-xs font-mono text-green-400 break-all mb-4" dir="ltr">
              SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
            </div>
            <button
              onClick={() => setCertModalOpen(false)}
              className="w-full py-2.5 bg-[#3897f0] hover:bg-[#2884dc] text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalAccount && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setQrModalAccount(null)}
        >
          <div
            className="bg-[#1c1e24] border border-[#2e333d] rounded-2xl w-full max-w-xs p-5 text-center flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mb-2">
              {qrModalAccount.logoType === 'exness' ? (
                <ExnessLogo className="w-12 h-12 rounded-[10px]" />
              ) : (
                <MetaQuotesLogo className="w-12 h-12" />
              )}
            </div>
            <h3 className="font-bold text-white text-base mb-0.5">{qrModalAccount.name}</h3>
            <p className="text-xs text-[#3f96f3] mb-1">{qrModalAccount.broker}</p>
            <p className="text-xs text-[#8e9aa8] tabular-nums mb-4" dir="ltr">
              {qrModalAccount.accountNumber} — {qrModalAccount.server}
            </p>

            <div className="bg-white p-3.5 rounded-xl shadow-lg mb-4 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <rect x="0" y="0" width="30" height="30" fill="black" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="black" />

                <rect x="70" y="0" width="30" height="30" fill="black" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="black" />

                <rect x="0" y="70" width="30" height="30" fill="black" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="black" />

                <rect x="40" y="10" width="5" height="15" fill="black" />
                <rect x="50" y="5" width="10" height="5" fill="black" />
                <rect x="40" y="35" width="20" height="5" fill="black" />
                <rect x="10" y="40" width="15" height="10" fill="black" />
                <rect x="35" y="45" width="10" height="10" fill="black" />
                <rect x="55" y="45" width="15" height="5" fill="black" />
                <rect x="75" y="40" width="10" height="15" fill="black" />
                <rect x="45" y="65" width="15" height="10" fill="black" />
                <rect x="65" y="70" width="10" height="5" fill="black" />
                <rect x="70" y="80" width="15" height="10" fill="black" />
                <rect x="35" y="80" width="5" height="10" fill="black" />
              </svg>
            </div>

            <p className="text-[11px] text-[#8e9aa8] mb-4">
              امسح الرمز بواسطة تطبيق MetaTrader 5 لمزامنة بيانات الحساب تلقائياً.
            </p>

            <button
              onClick={() => setQrModalAccount(null)}
              className="w-full py-2.5 bg-[#3897f0] hover:bg-[#2884dc] text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {accountToDelete && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setAccountToDelete(null)}
        >
          <div
            className="bg-[#1c1e24] border border-[#2e333d] rounded-2xl w-full max-w-xs p-5 text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl mb-3">
              🗑️
            </div>
            <h3 className="font-bold text-white text-base mb-1">حذف الحساب</h3>
            <p className="text-xs text-[#8e9aa8] mb-3 leading-relaxed">
              هل أنت متأكد من حذف حساب <strong className="text-white">{accountToDelete.name}</strong>؟
              <br />
              <span className="text-[11px] text-[#3f96f3] tabular-nums" dir="ltr">
                {accountToDelete.accountNumber} — {accountToDelete.server}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deleteAccount(accountToDelete.id);
                  setStatusNotice(`تم حذف الحساب ${accountToDelete.name} بنجاح.`);
                  setAccountToDelete(null);
                  setTimeout(() => setStatusNotice(null), 3000);
                }}
                className="flex-1 py-2.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 bg-[#252830] hover:bg-[#303440] text-[#8e9aa8] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
