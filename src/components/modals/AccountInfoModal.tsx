import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { ExnessLogo, MetaQuotesLogo } from '../common/Logos';

export const AccountInfoModal: React.FC = () => {
  const { accountInfoModalOpen, setAccountInfoModalOpen, activeAccount } = useTrading();

  if (!accountInfoModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn"
      onClick={() => setAccountInfoModalOpen(false)}
    >
      <div
        className="bg-[#1b1e24] border border-[#2e333d] rounded-2xl w-full max-w-sm overflow-hidden text-right shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#14161b] border-b border-[#262b34] flex items-center justify-between">
          <button
            onClick={() => setAccountInfoModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8e9aa8] hover:text-white"
          >
            ✕
          </button>
          <h3 className="text-base font-bold text-white">معلومات الحساب</h3>
          <div className="w-8"></div>
        </div>

        {/* Account Specs */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 bg-[#121418] p-3 rounded-xl border border-[#262b34]">
            {activeAccount.logoType === 'exness' ? (
              <ExnessLogo className="w-12 h-12" />
            ) : (
              <MetaQuotesLogo className="w-12 h-12" />
            )}
            <div>
              <h4 className="text-base font-bold text-white">{activeAccount.name}</h4>
              <p className="text-xs text-[#4da6ff] font-semibold">{activeAccount.broker}</p>
              <p className="text-xs text-[#8e9aa8]">{activeAccount.accountNumber}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">نوع الحساب:</span>
              <span className="font-bold text-white uppercase">{activeAccount.type === 'real' ? 'حقيقي (Real)' : 'تجريبي (Demo)'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">الخادم (Server):</span>
              <span className="font-bold text-[#64b5f6]">{activeAccount.server}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">الرافعة المالية (Leverage):</span>
              <span className="font-bold text-white">{activeAccount.leverage}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">العملة الأساسية:</span>
              <span className="font-bold text-white">{activeAccount.currency}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">حالة التداول:</span>
              <span className="font-bold text-[#00c853]">مسموح بالتداول الآلي واليدوي</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#262b34]">
              <span className="text-[#8e9aa8]">زمن الاستجابة (Ping):</span>
              <span className="font-bold text-green-400">12 ms</span>
            </div>
          </div>

          <button
            onClick={() => setAccountInfoModalOpen(false)}
            className="w-full py-2.5 bg-[#3897f0] hover:bg-[#2884dc] text-white font-bold rounded-xl text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
