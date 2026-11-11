import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';

export const NewOrderModal: React.FC = () => {
  const {
    orderModalSymbol,
    closeOrderModal,
    quotes,
    openTrade,
    setActiveTab
  } = useTrading();

  const [lot, setLot] = useState<number>(0.10);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');
  const [orderType, setOrderType] = useState<'market' | 'buy_limit' | 'sell_limit'>('market');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!orderModalSymbol) return null;

  const quote = quotes.find((q) => q.symbol === orderModalSymbol) || quotes[0];

  const handleExecute = (type: 'buy' | 'sell') => {
    const success = openTrade(
      orderModalSymbol,
      type,
      lot,
      sl ? parseFloat(sl) : undefined,
      tp ? parseFloat(tp) : undefined
    );

    if (success) {
      setFeedback(`تم تنفيذ أمر ${type === 'buy' ? 'الشراء' : 'البيع'} بنجاح!`);
      setTimeout(() => {
        closeOrderModal();
        setActiveTab('trade');
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn"
      onClick={closeOrderModal}
    >
      <div
        className="bg-[#1b1e24] border border-[#2e333d] rounded-2xl w-full max-w-sm overflow-hidden text-right shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#14161b] border-b border-[#262b34] flex items-center justify-between">
          <button
            onClick={closeOrderModal}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8e9aa8] hover:text-white"
          >
            ✕
          </button>

          <div className="text-center">
            <h3 className="text-lg font-bold text-white tracking-wide">
              {quote.symbol}
            </h3>
            <span className="text-xs text-[#8e9aa8]">{quote.name}</span>
          </div>

          <div className="w-8"></div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Order Type Selector */}
          <div>
            <label className="text-[11px] text-[#8e9aa8] block mb-1">نوع التنفيذ:</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full bg-[#121418] text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-[#2c313a] outline-none"
            >
              <option value="market">تنفيذ فوري بسعر السوق (Market Execution)</option>
              <option value="buy_limit">أمر شراء معلق (Buy Limit)</option>
              <option value="sell_limit">أمر بيع معلق (Sell Limit)</option>
            </select>
          </div>

          {/* Lot Size Selector with MT5 Steppers */}
          <div>
            <label className="text-[11px] text-[#8e9aa8] block mb-1">حجم العقد (Lots):</label>
            <div className="flex items-center justify-between bg-[#121418] border border-[#2c313a] rounded-xl p-1">
              <button
                onClick={() => setLot((prev) => Math.max(0.01, parseFloat((prev - 0.1).toFixed(2))))}
                className="px-2 py-1.5 text-xs font-bold text-[#8e9aa8] hover:text-white hover:bg-white/5 rounded-lg"
              >
                -0.1
              </button>
              <button
                onClick={() => setLot((prev) => Math.max(0.01, parseFloat((prev - 0.01).toFixed(2))))}
                className="px-2 py-1.5 text-xs font-bold text-[#8e9aa8] hover:text-white hover:bg-white/5 rounded-lg"
              >
                -0.01
              </button>

              <input
                type="number"
                step="0.01"
                min="0.01"
                value={lot}
                onChange={(e) => setLot(parseFloat(e.target.value) || 0.01)}
                className="w-16 text-center bg-transparent text-white font-extrabold text-sm outline-none tabular-nums"
              />

              <button
                onClick={() => setLot((prev) => parseFloat((prev + 0.01).toFixed(2)))}
                className="px-2 py-1.5 text-xs font-bold text-[#8e9aa8] hover:text-white hover:bg-white/5 rounded-lg"
              >
                +0.01
              </button>
              <button
                onClick={() => setLot((prev) => parseFloat((prev + 0.1).toFixed(2)))}
                className="px-2 py-1.5 text-xs font-bold text-[#8e9aa8] hover:text-white hover:bg-white/5 rounded-lg"
              >
                +0.1
              </button>
            </div>
          </div>

          {/* Live Quote Prices Banner */}
          <div className="flex items-center justify-around py-2 bg-[#121418] rounded-xl border border-[#262b34] tabular-nums">
            <div className="text-center">
              <span className="text-[11px] text-[#8e9aa8] block">سعر الطلب (Ask)</span>
              <span className="text-base font-extrabold text-[#64b5f6]">
                {quote.ask.toFixed(quote.digits)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[11px] text-[#8e9aa8] block">سعر العرض (Bid)</span>
              <span className="text-base font-extrabold text-[#e57373]">
                {quote.bid.toFixed(quote.digits)}
              </span>
            </div>
          </div>

          {/* SL & TP Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#8e9aa8] block mb-1">وقف الخسارة (SL):</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                className="w-full bg-[#121418] border border-[#2c313a] rounded-xl px-3 py-2 text-white text-xs font-bold outline-none tabular-nums text-center"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8e9aa8] block mb-1">أخذ الربح (TP):</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                className="w-full bg-[#121418] border border-[#2c313a] rounded-xl px-3 py-2 text-white text-xs font-bold outline-none tabular-nums text-center"
              />
            </div>
          </div>

          {feedback && (
            <div className="p-2.5 bg-[#00c853]/20 border border-[#00c853]/40 text-[#00c853] text-xs font-bold rounded-xl text-center">
              {feedback}
            </div>
          )}

          {/* Large MT5 Action Execution Buttons (Red Sell on Left / Blue Buy on Right) */}
          <div dir="ltr" className="grid grid-cols-2 gap-3 pt-2">
            {/* SELL by market (Left, Red) */}
            <button
              onClick={() => handleExecute('sell')}
              className="py-3 px-3 bg-[#d32f2f] hover:bg-[#c62828] active:scale-95 text-white font-extrabold rounded-xl transition-all shadow-lg flex flex-col items-center justify-center"
            >
              <span className="text-xs">بيع بسعر السوق</span>
              <span className="text-sm font-sans tabular-nums mt-0.5">
                {quote.bid.toFixed(quote.digits)}
              </span>
            </button>

            {/* BUY by market */}
            <button
              onClick={() => handleExecute('buy')}
              className="py-3 px-3 bg-[#1976d2] hover:bg-[#1565c0] active:scale-95 text-white font-extrabold rounded-xl transition-all shadow-lg flex flex-col items-center justify-center"
            >
              <span className="text-xs">شراء بسعر السوق</span>
              <span className="text-sm font-sans tabular-nums mt-0.5">
                {quote.ask.toFixed(quote.digits)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
