import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Deal } from '../../types/mt5';

export const HistoryView: React.FC = () => {
  const {
    historyDeals,
    activeAccount,
    setIsDrawerOpen
  } = useTrading();

  const [activeSubTab, setActiveSubTab] = useState<'deals' | 'orders' | 'positions'>('deals');
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState<boolean>(false);
  const [customCalendarModalOpen, setCustomCalendarModalOpen] = useState<boolean>(false);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | '3months' | 'custom' | 'all'>('all');
  const [customSelectedDate, setCustomSelectedDate] = useState<string>('2024.11.10');
  const [filterPeriodLabel, setFilterPeriodLabel] = useState<string>('كل السجل');
  const [symbolFilterOpen, setSymbolFilterOpen] = useState<boolean>(false);
  const [selectedSymbolFilter, setSelectedSymbolFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);

  // Calendar modal state: month (0-11) and year
  const [calendarViewYear, setCalendarViewYear] = useState<number>(() => {
    // default to 2024 or 2026 based on active account deals
    return 2024;
  });
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(10); // 10 = November (0-indexed)

  const arabicMonthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const arabicWeekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  // Deals belonging strictly to the active account
  const accountDeals = useMemo(() => {
    return historyDeals.filter((d) => d.accountId === activeAccount.id);
  }, [historyDeals, activeAccount.id]);

  // Set of dates that have deals in this account
  const dealDatesSet = useMemo(() => {
    const set = new Set<string>();
    accountDeals.forEach((d) => {
      if (d.closeTime) {
        set.add(d.closeTime.split(' ')[0]);
      }
    });
    return set;
  }, [accountDeals]);

  // Filter deals by period & custom date & symbol
  const filteredDeals = useMemo(() => {
    let list = accountDeals;

    // 1. Symbol Filter
    if (selectedSymbolFilter !== 'all') {
      list = list.filter((d) => d.symbol === selectedSymbolFilter);
    }

    // 2. Period / Date Filter
    const now = new Date();
    const todayStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

    if (filterPeriod === 'custom' && customSelectedDate) {
      list = list.filter((d) => d.closeTime && d.closeTime.startsWith(customSelectedDate));
    } else if (filterPeriod === 'today') {
      list = list.filter((d) => d.closeTime && (d.closeTime.startsWith(todayStr) || d.closeTime.startsWith('2026.11.10') || d.closeTime.startsWith('2024.11.10')));
    } else if (filterPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      list = list.filter((d) => {
        if (!d.closeTime) return false;
        const [datePart] = d.closeTime.split(' ');
        const [y, m, day] = datePart.split('.').map(Number);
        return new Date(y, (m || 1) - 1, day || 1) >= oneWeekAgo;
      });
    } else if (filterPeriod === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      list = list.filter((d) => {
        if (!d.closeTime) return false;
        const [datePart] = d.closeTime.split(' ');
        const [y, m, day] = datePart.split('.').map(Number);
        return new Date(y, (m || 1) - 1, day || 1) >= oneMonthAgo;
      });
    } else if (filterPeriod === '3months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      list = list.filter((d) => {
        if (!d.closeTime) return false;
        const [datePart] = d.closeTime.split(' ');
        const [y, m, day] = datePart.split('.').map(Number);
        return new Date(y, (m || 1) - 1, day || 1) >= threeMonthsAgo;
      });
    }

    return list;
  }, [accountDeals, selectedSymbolFilter, filterPeriod, customSelectedDate]);

  // Financial calculations matching MT5 screenshot
  const totalTradingProfit = useMemo(() => {
    return filteredDeals
      .filter((d) => d.type !== 'deposit')
      .reduce((sum, d) => sum + d.profit, 0);
  }, [filteredDeals]);

  const totalDeposits = useMemo(() => {
    const depositSum = filteredDeals
      .filter((d) => d.type === 'deposit')
      .reduce((sum, d) => sum + d.profit, 0);
    return depositSum > 0 ? depositSum : (activeAccount.balance > 0 ? activeAccount.balance : 0);
  }, [filteredDeals, activeAccount.balance]);

  const totalSwap = useMemo(() => {
    return filteredDeals
      .filter((d) => d.type !== 'deposit')
      .reduce((sum, d) => sum + d.swap, 0);
  }, [filteredDeals]);

  const totalCommission = useMemo(() => {
    return filteredDeals
      .filter((d) => d.type !== 'deposit')
      .reduce((sum, d) => sum + d.commission, 0);
  }, [filteredDeals]);

  // Net Balance calculation
  const calculatedBalance = useMemo(() => {
    return totalDeposits + totalTradingProfit + totalSwap + totalCommission;
  }, [totalDeposits, totalTradingProfit, totalSwap, totalCommission]);

  // Group deals day by day ("يتم تسجيل كل يوم بيومه")
  const groupedDeals = useMemo(() => {
    const groups: { [date: string]: Deal[] } = {};

    filteredDeals.forEach((deal) => {
      const datePart = deal.closeTime ? deal.closeTime.split(' ')[0] : '2026.11.10';
      if (!groups[datePart]) {
        groups[datePart] = [];
      }
      groups[datePart].push(deal);
    });

    const sortedDates = Object.keys(groups).sort((a, b) =>
      sortAsc ? a.localeCompare(b) : b.localeCompare(a)
    );

    return sortedDates.map((date) => {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      const isToday = date === todayStr || date === '2026.11.10' || date === '2024.11.10';
      const dayDeals = groups[date];
      const dayProfit = dayDeals
        .filter((d) => d.type !== 'deposit')
        .reduce((sum, d) => sum + d.profit, 0);

      return {
        date,
        label: isToday ? `اليوم — ${date}` : date,
        deals: dayDeals,
        dayProfit
      };
    });
  }, [filteredDeals, sortAsc]);

  const uniqueSymbols = useMemo(() => {
    const set = new Set<string>();
    accountDeals.forEach((d) => {
      if (d.symbol && d.symbol !== 'Balance') set.add(d.symbol);
    });
    return Array.from(set);
  }, [accountDeals]);

  // Calendar calculation functions
  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = () => {
    if (calendarViewMonth === 0) {
      setCalendarViewMonth(11);
      setCalendarViewYear((prev) => prev - 1);
    } else {
      setCalendarViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarViewMonth === 11) {
      setCalendarViewMonth(0);
      setCalendarViewYear((prev) => prev + 1);
    } else {
      setCalendarViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const monthStr = String(calendarViewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${calendarViewYear}.${monthStr}.${dayStr}`;
    setCustomSelectedDate(fullDate);
  };

  const handleApplyCustomDate = () => {
    setFilterPeriod('custom');
    setFilterPeriodLabel(`تاريخ: ${customSelectedDate}`);
    setCustomCalendarModalOpen(false);
  };

  const handleResetToAll = () => {
    setFilterPeriod('all');
    setFilterPeriodLabel('كل السجل');
    setCustomCalendarModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden select-none">
      {/* 1. Header (Matching Screenshot_20261110131204_e30fb2d5.jpg) */}
      <header className="h-14 px-3 flex items-center justify-between border-b border-[#141517] bg-[#000000] shrink-0 z-20">
        {/* Right side: Hamburger, Title "السجل", and Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="القائمة"
            className="w-10 h-10 flex items-center justify-center text-white active:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold tracking-wide text-white leading-tight">السجل</h1>
            <p className="text-[11px] text-[#8e9aa8] leading-tight">
              {filterPeriod === 'custom'
                ? customSelectedDate
                : selectedSymbolFilter === 'all'
                ? 'كل الرموز'
                : selectedSymbolFilter}
            </p>
          </div>
        </div>

        {/* Left side 3 icons: Calendar, Sort, Symbol Filter */}
        <div className="flex items-center gap-1 text-white">
          {/* Calendar Period Picker */}
          <div className="relative">
            <button
              onClick={() => setCalendarDropdownOpen(!calendarDropdownOpen)}
              aria-label="الفترة الزمنية"
              title="الفترة الزمنية"
              className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>

            {calendarDropdownOpen && (
              <div
                className="absolute left-0 top-11 w-48 bg-[#1f2125] border border-[#2e3238] rounded-xl shadow-2xl py-1.5 z-50 text-xs font-semibold text-right"
                onClick={() => setCalendarDropdownOpen(false)}
              >
                {[
                  { id: 'today', label: 'اليوم' },
                  { id: 'week', label: 'الأسبوع الأخير' },
                  { id: 'month', label: 'الشهر الأخير' },
                  { id: '3months', label: 'آخر 3 أشهر' },
                  { id: 'all', label: 'كل السجل' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setFilterPeriod(p.id as any);
                      setFilterPeriodLabel(p.label);
                    }}
                    className={`w-full text-right px-4 py-2 hover:bg-white/10 transition-colors ${
                      filterPeriod === p.id ? 'text-[#2196f3] font-bold' : 'text-[#d8dfe6]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}

                <div className="h-px bg-[#2e3238] my-1"></div>

                {/* Custom Period Button (Opens Monthly Interactive Calendar) */}
                <button
                  onClick={() => {
                    setCalendarDropdownOpen(false);
                    setCustomCalendarModalOpen(true);
                  }}
                  className={`w-full text-right px-4 py-2.5 hover:bg-white/10 transition-colors flex items-center justify-between ${
                    filterPeriod === 'custom' ? 'text-[#2196f3] font-bold' : 'text-[#ffd200]'
                  }`}
                >
                  <span>تخصيص فترة...</span>
                  <span className="text-sm">📅</span>
                </button>
              </div>
            )}
          </div>

          {/* Sort Arrows */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            aria-label="ترتيب السجل"
            title="فرز التاريخ"
            className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
              <path d="M7 20V4M7 4L3 8M7 4L11 8" />
              <path d="M17 4V20M17 20L13 16M17 20L21 16" />
            </svg>
          </button>

          {/* Symbol Filter Icon */}
          <div className="relative">
            <button
              onClick={() => setSymbolFilterOpen(!symbolFilterOpen)}
              aria-label="تصفية حسب الرمز"
              title="تصفية الرموز"
              className="w-9 h-9 flex items-center justify-center active:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10" />
                <path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2 5 4.5a2.5 2.5 0 0 1-5 0" />
              </svg>
            </button>

            {symbolFilterOpen && (
              <div
                className="absolute left-0 top-11 w-44 bg-[#1f2125] border border-[#2e3238] rounded-xl shadow-2xl py-1.5 z-50 text-xs font-semibold text-right"
                onClick={() => setSymbolFilterOpen(false)}
              >
                <button
                  onClick={() => setSelectedSymbolFilter('all')}
                  className={`w-full text-right px-4 py-2 hover:bg-white/10 ${
                    selectedSymbolFilter === 'all' ? 'text-[#2196f3] font-bold' : 'text-[#d8dfe6]'
                  }`}
                >
                  كل الرموز
                </button>
                {['USOIL', 'XAUUSD', 'EURUSD', 'BTCUSD', 'GBPUSD', ...uniqueSymbols].filter(
                  (v, i, a) => a.indexOf(v) === i
                ).map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSelectedSymbolFilter(sym)}
                    className={`w-full text-right px-4 py-2 hover:bg-white/10 ${
                      selectedSymbolFilter === sym ? 'text-[#2196f3] font-bold' : 'text-[#d8dfe6]'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Sub Tabs: الصفقات / الطلبات / المراكز (Matching Screenshot_20261110131204_e30fb2d5.jpg) */}
      <div className="flex border-b border-[#141517] bg-[#000000] shrink-0">
        {[
          { id: 'deals', label: 'الصفقات' },
          { id: 'orders', label: 'الطلبات' },
          { id: 'positions', label: 'المراكز' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-[#2196f3] text-[#2196f3]'
                : 'border-transparent text-[#8e9aa8] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Dotted Financial Summary Rows (Matching Screenshot_20261110131204_e30fb2d5.jpg) */}
      <div className="px-4 py-2.5 bg-[#000000] border-b border-[#141517] space-y-1.5 shrink-0">
        {/* Row 1: الربح: */}
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-normal text-white shrink-0">الربح:</span>
          <div className="flex-1 mx-2 border-b border-dotted border-[#404652] self-center"></div>
          <span
            className={`font-bold tabular-nums shrink-0 ${
              totalTradingProfit >= 0 ? 'text-[#2196f3]' : 'text-[#ef5350]'
            }`}
          >
            {totalTradingProfit >= 0 ? totalTradingProfit.toFixed(2) : totalTradingProfit.toFixed(2)}
          </span>
        </div>

        {/* Row 2: الايداع: (Amount in Blue) */}
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-normal text-white shrink-0">الايداع:</span>
          <div className="flex-1 mx-2 border-b border-dotted border-[#404652] self-center"></div>
          <span className="font-bold tabular-nums text-[#2196f3] shrink-0">
            {totalDeposits.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>

        {/* Row 3: الفائدة: */}
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-normal text-white shrink-0">الفائدة:</span>
          <div className="flex-1 mx-2 border-b border-dotted border-[#404652] self-center"></div>
          <span className="font-bold tabular-nums text-white shrink-0">
            {totalSwap.toFixed(2)}
          </span>
        </div>

        {/* Row 4: العمولة: */}
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-normal text-white shrink-0">العمولة:</span>
          <div className="flex-1 mx-2 border-b border-dotted border-[#404652] self-center"></div>
          <span className="font-bold tabular-nums text-white shrink-0">
            {totalCommission.toFixed(2)}
          </span>
        </div>

        {/* Row 5: رصيد الحساب: (In Blue) */}
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-normal text-white shrink-0">رصيد الحساب:</span>
          <div className="flex-1 mx-2 border-b border-dotted border-[#404652] self-center"></div>
          <span
            className={`font-bold tabular-nums shrink-0 ${
              calculatedBalance >= 0 ? 'text-[#2196f3]' : 'text-[#ef5350]'
            }`}
          >
            {calculatedBalance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </div>
      </div>

      {/* 4. Deals & Deposit List Grouped Day by Day ("تسجيل كل يوم بيومه") */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#14161a] bg-[#000000] scrollbar-thin">
        {filteredDeals.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-xs text-[#8e9aa8] p-4 text-center">
            <span className="text-3xl mb-2">📜</span>
            <span className="font-bold text-white text-sm mb-1">
              {filterPeriod === 'custom' ? `لا توجد صفقات في تاريخ ${customSelectedDate}` : 'لا توجد صفقات في الفترة المحددة'}
            </span>
            <span className="text-[11px] text-[#707c8b] mb-3">
              يمكنك اختيار يوم آخر من التقويم أو عرض كل السجل
            </span>
            <button
              onClick={handleResetToAll}
              className="px-4 py-2 bg-[#2196f3] text-white font-bold rounded-xl text-xs hover:bg-[#1976d2] transition-colors cursor-pointer"
            >
              عرض كل السجل
            </button>
          </div>
        ) : (
          groupedDeals.map((group) => (
            <div key={group.date}>
              {/* Daily Header */}
              <div className="px-4 py-1 bg-[#0a0c0e] border-y border-[#14161a] flex items-center justify-between text-[11px] font-bold text-[#8e9aa8]">
                <span>{group.label}</span>
                {group.dayProfit !== 0 && (
                  <span
                    className={`tabular-nums font-bold ${
                      group.dayProfit >= 0 ? 'text-[#2196f3]' : 'text-[#ef5350]'
                    }`}
                  >
                    {group.dayProfit >= 0 ? `+${group.dayProfit.toFixed(2)}` : group.dayProfit.toFixed(2)} USD
                  </span>
                )}
              </div>

              {/* Group Deals */}
              <div className="divide-y divide-[#14161a]">
                {group.deals.map((deal) => {
                  const isExpanded = expandedDealId === deal.id;
                  const isDeposit = deal.type === 'deposit' || deal.symbol === 'Balance';

                  return (
                    <div
                      key={deal.id}
                      onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
                      className="p-3.5 hover:bg-[#121418] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        {/* Right: Info in Arabic */}
                        <div className="text-right">
                          {isDeposit ? (
                            /* Deposit Record (رصيد الحساب) */
                            <div>
                              <div className="text-[15px] font-bold text-white tracking-wide">
                                رصيد الحساب
                              </div>
                              <div className="text-xs text-[#8e9aa8] mt-0.5 tabular-nums" dir="ltr">
                                {deal.comment || 'D-ALLINT-USD-INT-472970564-2'}
                              </div>
                            </div>
                          ) : (
                            /* Closed Trade Deal */
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-white tracking-wide">
                                  {deal.symbol}
                                </span>
                                <span
                                  className={`text-[12px] font-bold uppercase ${
                                    deal.type === 'buy' ? 'text-[#2196f3]' : 'text-[#ef5350]'
                                  }`}
                                >
                                  {deal.type} {deal.lots.toFixed(2)}
                                </span>
                              </div>

                              <div className="text-xs text-[#8e9aa8] mt-0.5 tabular-nums" dir="ltr">
                                <span>{deal.openPrice.toFixed(2)}</span>
                                <span className="mx-1 text-[#5a6572]">→</span>
                                <span className="text-[#c5d0dc]">{deal.closePrice.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Left: Timestamp and Amount in BLUE for deposits or profit, RED for loss, or Filled status for Orders */}
                        <div className="text-left" dir="ltr">
                          {activeSubTab === 'orders' && !isDeposit ? (
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#1b5e20]/50 text-[#81c784] border border-[#2e7d32]/60">
                                مُنفَّذ (Filled)
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`text-base font-extrabold tabular-nums tracking-tight ${
                                isDeposit
                                  ? 'text-[#2196f3]'
                                  : deal.profit >= 0
                                  ? 'text-[#2196f3]'
                                  : 'text-[#ef5350]'
                              }`}
                            >
                              {isDeposit
                                ? deal.profit.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })
                                : deal.profit >= 0
                                ? deal.profit.toFixed(2)
                                : deal.profit.toFixed(2)}
                            </div>
                          )}
                          <div className="text-[10px] text-[#8e9aa8] mt-0.5 tabular-nums">
                            {deal.closeTime}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-[#1c1f24] text-[11px] text-[#8e9aa8] grid grid-cols-2 gap-2 bg-[#0d0f12] p-2.5 rounded-xl tabular-nums animate-fadeIn">
                          <div>رقم التذكرة: <strong className="text-white">#{deal.ticket}</strong></div>
                          <div>وقت التنفيذ: <strong className="text-white">{deal.closeTime.split(' ')[1] || deal.closeTime}</strong></div>
                          <div>العمولة: <strong className="text-white">{deal.commission.toFixed(2)}</strong></div>
                          <div>سواب (Swap): <strong className="text-white">{deal.swap.toFixed(2)}</strong></div>
                          {isDeposit && (
                            <div className="col-span-2 text-[#2196f3] font-semibold">
                              البيان: رصيد إيداع معتمد في حساب التداول
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Custom Monthly Calendar Modal ("يظهر لي تقويم شهري بعدد الايام واختار تاريخ سجل اليوم الذي اريده") */}
      {customCalendarModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setCustomCalendarModalOpen(false)}
        >
          <div
            className="bg-[#1c1e24] border border-[#2e333d] rounded-2xl w-full max-w-sm p-4 text-right shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Year/Month navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-[#282c36]">
              <button
                onClick={() => setCustomCalendarModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8e9aa8] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
              <h3 className="font-bold text-base text-white">تخصيص تاريخ السجل</h3>
              <div className="w-7"></div>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between py-3 px-1" dir="ltr">
              <button
                onClick={handlePrevMonth}
                aria-label="الشهر السابق"
                className="w-8 h-8 rounded-lg bg-[#252832] hover:bg-[#303542] flex items-center justify-center text-white font-bold cursor-pointer transition-colors"
              >
                ‹
              </button>

              <div className="text-center font-bold text-white text-sm">
                <span>{arabicMonthNames[calendarViewMonth]}</span>{' '}
                <span className="text-[#2196f3] font-mono">{calendarViewYear}</span>
              </div>

              <button
                onClick={handleNextMonth}
                aria-label="الشهر التالي"
                className="w-8 h-8 rounded-lg bg-[#252832] hover:bg-[#303542] flex items-center justify-center text-white font-bold cursor-pointer transition-colors"
              >
                ›
              </button>
            </div>

            {/* Quick Year Stepper Chips */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[2024, 2025, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setCalendarViewYear(yr)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    calendarViewYear === yr
                      ? 'bg-[#2196f3] text-white shadow-sm'
                      : 'bg-[#252832] text-[#8e9aa8] hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-1 text-[11px] font-bold text-[#8e9aa8] border-b border-[#282c36]">
              {arabicWeekDays.map((wDay) => (
                <div key={wDay} className="py-1">
                  {wDay}
                </div>
              ))}
            </div>

            {/* Monthly Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs">
              {/* Empty leading padding slots */}
              {Array.from({ length: firstDayOfMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9"></div>
              ))}

              {/* Day Number Buttons (1 to total days) */}
              {Array.from({ length: daysInMonth(calendarViewYear, calendarViewMonth) }).map((_, i) => {
                const dayNum = i + 1;
                const monthStr = String(calendarViewMonth + 1).padStart(2, '0');
                const dayStr = String(dayNum).padStart(2, '0');
                const dateKey = `${calendarViewYear}.${monthStr}.${dayStr}`;
                const isSelected = customSelectedDate === dateKey;
                const hasDeals = dealDatesSet.has(dateKey);

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center relative font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2196f3] text-white shadow-md ring-2 ring-[#2196f3]/60'
                        : hasDeals
                        ? 'bg-[#252936] text-white hover:bg-[#303545] border border-[#3f96f3]/40'
                        : 'text-[#8e9aa8] hover:bg-[#252832] hover:text-white'
                    }`}
                  >
                    <span className="tabular-nums text-xs leading-none">{dayNum}</span>
                    {/* Dot indicator if deals exist on this date */}
                    {hasDeals && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                          isSelected ? 'bg-white' : 'bg-[#2196f3]'
                        }`}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary & Deals Count */}
            <div className="mt-2 p-2.5 bg-[#121418] rounded-xl border border-[#282c36] text-xs flex items-center justify-between">
              <div>
                <span className="text-[#8e9aa8]">اليوم المختار: </span>
                <strong className="text-white font-mono" dir="ltr">{customSelectedDate}</strong>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                dealDatesSet.has(customSelectedDate)
                  ? 'bg-blue-500/20 text-[#2196f3] border border-blue-500/30'
                  : 'bg-white/5 text-[#8e9aa8]'
              }`}>
                {dealDatesSet.has(customSelectedDate) ? 'توجد صفقات مسجلة' : 'لا توجد صفقات'}
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApplyCustomDate}
                className="flex-1 py-2.5 bg-[#2196f3] hover:bg-[#1976d2] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                تطبيق التاريخ
              </button>
              <button
                onClick={handleResetToAll}
                className="py-2.5 px-3 bg-[#252832] hover:bg-[#303542] text-[#cfd8dc] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                كل السجل
              </button>
              <button
                onClick={() => setCustomCalendarModalOpen(false)}
                className="py-2.5 px-3 bg-[#252832] hover:bg-[#303542] text-[#8e9aa8] font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
