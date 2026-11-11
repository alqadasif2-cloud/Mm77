import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ExnessLogo, MetaQuotesLogo } from '../common/Logos';

export const AddAccountModal: React.FC = () => {
  const { addAccountModalOpen, setAddAccountModalOpen, addNewAccount } = useTrading();

  // Broker selection: 'exness' or 'metaquotes'
  const [selectedBroker, setSelectedBroker] = useState<'exness' | 'metaquotes'>('exness');
  const [accountName, setAccountName] = useState<string>('حسابي الجديد');
  const [accountType, setAccountType] = useState<'real' | 'demo'>('real');
  const [accountPlan, setAccountPlan] = useState<string>('إسلامي (Islamic Swap-Free)');
  const [server, setServer] = useState<string>('Exness-MT5Real35');
  const [deposit, setDeposit] = useState<string>('3000');
  const [currency, setCurrency] = useState<string>('USD');
  const [leverage, setLeverage] = useState<string>('1:2000');
  const [accountNumber, setAccountNumber] = useState<string>(() => 
    String(Math.floor(250000000 + Math.random() * 9999999))
  );
  const [password, setPassword] = useState<string>('Ex#9948Trade');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!addAccountModalOpen) return null;

  const handleBrokerChange = (broker: 'exness' | 'metaquotes') => {
    setSelectedBroker(broker);
    if (broker === 'exness') {
      setServer('Exness-MT5Real35');
      setLeverage('1:2000');
    } else {
      setServer('MetaQuotes-Demo');
      setLeverage('1:100');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(deposit) || 1000;
    
    setIsSuccess(true);

    setTimeout(() => {
      addNewAccount({
        name: accountName.trim() || (selectedBroker === 'exness' ? 'حساب إسلام' : 'Eslam Alqadasi'),
        broker: selectedBroker === 'exness' ? 'Exness Technologies Ltd' : 'MetaQuotes Ltd.',
        server,
        type: accountType,
        accountNumber: accountNumber || String(Math.floor(250000000 + Math.random() * 9999999)),
        balance: balanceNum,
        currency,
        leverage,
        logoType: selectedBroker,
        lastKnownLabel: `آخر ما عرف . ${currency}`
      });
      setIsSuccess(false);
      setAddAccountModalOpen(false);
    }, 600);
  };

  const quickAmounts = ['500', '1000', '3000', '5000', '10000', '50000'];

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 z-50 select-none animate-fadeIn"
      onClick={() => setAddAccountModalOpen(false)}
    >
      <div
        className="bg-[#17191e] border border-[#2c3039] rounded-2xl w-full max-w-[420px] max-h-[92vh] overflow-hidden text-right shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 bg-[#121418] border-b border-[#242831] flex items-center justify-between">
          <button
            onClick={() => setAddAccountModalOpen(false)}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e9aa8] hover:text-white transition-colors"
          >
            ✕
          </button>
          <div className="text-center">
            <h3 className="text-base font-bold text-white">إضافة حساب تداول جديد</h3>
            <p className="text-[11px] text-[#8e9aa8]">اختر الوسيط وحدد بيانات الحساب والمبلغ</p>
          </div>
          <div className="w-8"></div>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#00c853]/20 text-[#00c853] flex items-center justify-center text-2xl font-bold mb-3 border border-[#00c853]/40 animate-pulse">
              ✓
            </div>
            <h4 className="text-lg font-bold text-white mb-1">تم إنشاء الحساب بنجاح!</h4>
            <p className="text-xs text-[#8e9aa8]">جاري الاتصال بالسيرفر {server} وتسجيل الدخول...</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-4 space-y-3.5 overflow-y-auto max-h-[calc(92vh-120px)] scrollbar-thin text-xs">
            {/* 1. Broker Choice Cards: Exness vs MT5 */}
            <div>
              <label className="text-[#a0acba] font-semibold block mb-2">
                اختر شركة الوساطة (Broker):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Exness Card */}
                <button
                  type="button"
                  onClick={() => handleBrokerChange('exness')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
                    selectedBroker === 'exness'
                      ? 'bg-[#1e232d] border-[#ffd200] ring-1 ring-[#ffd200]/50 shadow-md'
                      : 'bg-[#121418] border-[#262a33] hover:border-[#353a47]'
                  }`}
                >
                  <ExnessLogo className="w-10 h-10 shadow-md" />
                  <div>
                    <span className="font-bold text-white block text-xs">Exness</span>
                    <span className="text-[10px] text-[#ffd200]">Technologies Ltd</span>
                  </div>
                  {selectedBroker === 'exness' && (
                    <span className="text-[9px] bg-[#ffd200] text-black font-extrabold px-1.5 py-0.2 rounded-full">
                      محدد
                    </span>
                  )}
                </button>

                {/* MetaQuotes / MT5 Card */}
                <button
                  type="button"
                  onClick={() => handleBrokerChange('metaquotes')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
                    selectedBroker === 'metaquotes'
                      ? 'bg-[#1e232d] border-[#3897f0] ring-1 ring-[#3897f0]/50 shadow-md'
                      : 'bg-[#121418] border-[#262a33] hover:border-[#353a47]'
                  }`}
                >
                  <MetaQuotesLogo className="w-10 h-10 drop-shadow-md" />
                  <div>
                    <span className="font-bold text-white block text-xs">MetaQuotes</span>
                    <span className="text-[10px] text-[#64b5f6]">MT5 Official</span>
                  </div>
                  {selectedBroker === 'metaquotes' && (
                    <span className="text-[9px] bg-[#3897f0] text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      محدد
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Account Name */}
            <div>
              <label className="text-[#a0acba] font-semibold block mb-1">
                اسم الحساب / صاحب الحساب:
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="مثال: حسابي الحقيقي أو إسلام"
                className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#3897f0]"
              />
            </div>

            {/* 3. Account Deposit / Balance Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#a0acba] font-semibold">
                  مبلغ الرصيد / الإيداع:
                </label>
                <span className="text-[#64b5f6] text-[11px] font-bold">
                  {currency}
                </span>
              </div>
              <input
                type="number"
                min="10"
                step="any"
                required
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="أدخل أي مبلغ تريده (مثلاً: 3000)"
                className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-3 py-2 text-white font-extrabold text-sm outline-none focus:border-[#3897f0] tabular-nums"
              />
              {/* Quick amount chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDeposit(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                      deposit === amt
                        ? 'bg-[#3897f0] text-white'
                        : 'bg-[#1b1e25] text-[#8e9aa8] hover:text-white border border-[#282d38]'
                    }`}
                  >
                    ${Number(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Real or Demo + Account Plan */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#a0acba] font-semibold block mb-1">نوع الحساب:</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2.5 py-2 text-white font-bold outline-none cursor-pointer"
                >
                  <option value="real">حقيقي (Real)</option>
                  <option value="demo">تجريبي (Demo)</option>
                </select>
              </div>

              <div>
                <label className="text-[#a0acba] font-semibold block mb-1">نوع الباقة:</label>
                <select
                  value={accountPlan}
                  onChange={(e) => setAccountPlan(e.target.value)}
                  className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2.5 py-2 text-white font-bold outline-none cursor-pointer"
                >
                  <option value="إسلامي (Islamic Swap-Free)">إسلامي (Swap-Free)</option>
                  <option value="ستاندرد (Standard)">ستاندرد (Standard)</option>
                  <option value="برو (Pro)">برو (Pro)</option>
                  <option value="رو سبريد (Raw Spread)">رو سبريد (Raw Spread)</option>
                </select>
              </div>
            </div>

            {/* 5. Server & Leverage */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#a0acba] font-semibold block mb-1">الخادم (Server):</label>
                {selectedBroker === 'exness' ? (
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2 py-2 text-white font-bold outline-none cursor-pointer text-[11px]"
                  >
                    <option value="Exness-MT5Real35">Exness-MT5Real35</option>
                    <option value="Exness-MT5Real19">Exness-MT5Real19</option>
                    <option value="Exness-MT5Real1">Exness-MT5Real1</option>
                    <option value="Exness-MT5Trial">Exness-MT5Trial</option>
                  </select>
                ) : (
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2 py-2 text-white font-bold outline-none cursor-pointer text-[11px]"
                  >
                    <option value="MetaQuotes-Demo">MetaQuotes-Demo</option>
                    <option value="MetaQuotes-Real">MetaQuotes-Real</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-[#a0acba] font-semibold block mb-1">الرافعة المالية:</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2 py-2 text-white font-bold outline-none cursor-pointer text-[11px]"
                >
                  <option value="1:2000">1:2000 (Exness)</option>
                  <option value="1:500">1:500</option>
                  <option value="1:200">1:200</option>
                  <option value="1:100">1:100</option>
                  <option value="1:غير محدود">1:غير محدود</option>
                </select>
              </div>
            </div>

            {/* 6. Currency & Login Number */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#a0acba] font-semibold block mb-1">العملة الأساسية:</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2.5 py-2 text-white font-bold outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="SAR">SAR (ر.س)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#a0acba] font-semibold">رقم الحساب (Login):</label>
                  <button
                    type="button"
                    onClick={() => setAccountNumber(String(Math.floor(250000000 + Math.random() * 9999999)))}
                    className="text-[10px] text-[#64b5f6] hover:underline"
                  >
                    توليد تلقائي
                  </button>
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-2.5 py-2 text-white font-bold outline-none tabular-nums"
                  dir="ltr"
                />
              </div>
            </div>

            {/* 7. Password */}
            <div>
              <label className="text-[#a0acba] font-semibold block mb-1">كلمة مرور التداول (Password):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111317] border border-[#2b303b] rounded-xl px-3 py-2 text-white font-mono outline-none"
                dir="ltr"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#3897f0] hover:bg-[#2884dc] active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>إنشاء الحساب وبدء التداول</span>
                <span>⚡</span>
              </button>
              <button
                type="button"
                onClick={() => setAddAccountModalOpen(false)}
                className="px-4 py-3 bg-[#232730] hover:bg-[#2d323e] text-[#8e9aa8] font-bold rounded-xl transition-colors text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
