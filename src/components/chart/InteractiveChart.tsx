import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Candle, Timeframe } from '../../types/mt5';

export const InteractiveChart: React.FC = () => {
  const {
    selectedSymbol,
    setSelectedSymbol,
    quotes,
    timeframe,
    setTimeframe,
    openTrade,
    setIsDrawerOpen
  } = useTrading();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [crosshairActive, setCrosshairActive] = useState<boolean>(false);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [showOneClick, setShowOneClick] = useState<boolean>(true);
  const [lotSize, setLotSize] = useState<number>(0.01);
  const [showRadialMenu, setShowRadialMenu] = useState<boolean>(false);
  const [radialPos, setRadialPos] = useState<{ x: number; y: number }>({ x: 200, y: 300 });
  const [showSymbolModal, setShowSymbolModal] = useState<boolean>(false);
  const [showTimeframeModal, setShowTimeframeModal] = useState<boolean>(false);
  const [tradeSuccessToast, setTradeSuccessToast] = useState<string | null>(null);

  // Time remaining in current candle (countdown timer)
  const [candleSecondsRemaining, setCandleSecondsRemaining] = useState<number>(208); // e.g. 03:28

  // Current live quote for selected symbol
  const currentQuote = quotes.find((q) => q.symbol === selectedSymbol) || quotes[0];

  const timeframes: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

  // Countdown timer for candle badge
  useEffect(() => {
    const totalSec =
      timeframe === 'M1' ? 60 :
      timeframe === 'M5' ? 300 :
      timeframe === 'M15' ? 900 :
      timeframe === 'M30' ? 1800 :
      timeframe === 'H1' ? 3600 :
      timeframe === 'H4' ? 14400 : 86400;

    const interval = setInterval(() => {
      setCandleSecondsRemaining((prev) => {
        if (prev <= 1) return totalSec;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Generate historical candles based on symbol and timeframe
  const [candles, setCandles] = useState<Candle[]>(() => {
    const list: Candle[] = [];
    const basePrice = currentQuote ? currentQuote.bid : 4093.22;
    const now = Date.now();
    const intervalMs =
      timeframe === 'M1' ? 60000 :
      timeframe === 'M5' ? 300000 :
      timeframe === 'M15' ? 900000 :
      timeframe === 'M30' ? 1800000 : 3600000;
    let prevClose = basePrice + 35; // creates realistic down-spike trend as in screenshot

    for (let i = 50; i >= 0; i--) {
      const time = now - i * intervalMs;
      const volatility = basePrice * 0.0018;
      // create strong drop on recent bars to match user's screenshot
      const trendBias = i < 8 ? -volatility * 0.9 : (Math.random() - 0.49) * volatility;
      const open = prevClose;
      const close = open + trendBias;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.7;
      const volume = Math.floor(Math.random() * 450) + 50;

      list.push({ time, open, high, low, close, volume });
      prevClose = close;
    }
    return list;
  });

  // Regenerate candles when symbol or timeframe changes
  useEffect(() => {
    if (!currentQuote) return;
    const list: Candle[] = [];
    const basePrice = currentQuote.bid;
    const now = Date.now();
    const intervalMs =
      timeframe === 'M1' ? 60000 :
      timeframe === 'M5' ? 300000 :
      timeframe === 'M15' ? 900000 :
      timeframe === 'M30' ? 1800000 : 3600000;

    const offset =
      selectedSymbol === 'USOIL' ? 0.8 :
      selectedSymbol === 'XAGUSD' ? 0.25 :
      selectedSymbol === 'XAUUSD' ? 15 :
      selectedSymbol === 'BTCUSD' ? 350 : (basePrice * 0.003);
    let prevClose = basePrice + offset;

    for (let i = 50; i >= 0; i--) {
      const time = now - i * intervalMs;
      const volatility = basePrice * 0.0018;
      // create recent drop to resemble screenshot
      const trendBias = i < 8 ? -volatility * 0.85 : (Math.random() - 0.49) * volatility;
      const open = prevClose;
      const close = open + trendBias;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.7;
      const volume = Math.floor(Math.random() * 300) + 40;

      list.push({ time, open, high, low, close, volume });
      prevClose = close;
    }
    setCandles(list);
  }, [selectedSymbol, timeframe]);

  // Live update the last candle with current ticking price
  useEffect(() => {
    if (!currentQuote) return;
    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const last = { ...prev[prev.length - 1] };
      const currentPrice = currentQuote.bid;
      last.close = currentPrice;
      last.high = Math.max(last.high, currentPrice);
      last.low = Math.min(last.low, currentPrice);
      last.volume += 1;
      return [...prev.slice(0, prev.length - 1), last];
    });
  }, [currentQuote?.bid]);

  // MT5 Price Formatter for quick trading buttons: e.g. 4093.22⁹
  const formatMT5BigPrice = (price: number, digits: number) => {
    const formatted = price.toFixed(digits);
    const parts = formatted.split('.');
    const integerPart = parts[0] + '.';
    const decimals = parts[1] || '00';
    
    if (decimals.length >= 3) {
      const big = decimals.slice(0, 2);
      const superDigit = decimals.slice(2);
      return { main: integerPart, big, superDigit };
    } else if (decimals.length === 2) {
      const big = decimals.slice(0, 1);
      const superDigit = decimals.slice(1);
      return { main: integerPart, big, superDigit };
    } else {
      return { main: integerPart, big: decimals, superDigit: '0' };
    }
  };

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background: Pure pitch black matching screenshot
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Sub-pane height for MACD/ADX (bottom 22% of chart)
    const subPaneHeight = 85;
    const rightMargin = 74;
    const bottomMargin = 22;
    const topMargin = 12;
    const chartWidth = width - rightMargin;
    const mainChartHeight = height - subPaneHeight - bottomMargin - topMargin;

    // Visible candles count
    const visibleCount = Math.min(candles.length, 45);
    const visibleCandles = candles.slice(-visibleCount);

    // Compute min and max price for main chart
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const priceRange = maxPrice - minPrice || 1;
    const paddedMin = minPrice - priceRange * 0.06;
    const paddedMax = maxPrice + priceRange * 0.06;
    const fullRange = paddedMax - paddedMin;

    const getY = (price: number) => {
      return topMargin + (1 - (price - paddedMin) / fullRange) * mainChartHeight;
    };

    // 1. Draw Price Grid Lines & Labels on Right Axis
    ctx.strokeStyle = '#121417';
    ctx.lineWidth = 1;

    const gridSteps = 12; // matching density of screenshot ticks
    for (let i = 0; i <= gridSteps; i++) {
      const priceVal = paddedMin + (fullRange / gridSteps) * i;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price text
      ctx.fillStyle = '#9ea8b3';
      ctx.font = '10px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'right';
      const labelDigits = selectedSymbol === 'USOIL' ? 2 : (currentQuote?.digits || 2);
      ctx.fillText(priceVal.toFixed(labelDigits + 1), width - 4, y + 3.5);
    }

    // 2. Vertical Time Grid Lines
    const candleWidth = chartWidth / visibleCount;
    const timeStep = Math.max(1, Math.floor(visibleCount / 4));
    for (let i = 0; i < visibleCount; i += timeStep) {
      const x = i * candleWidth + candleWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, height - bottomMargin);
      ctx.stroke();
    }

    // 3. Technical Indicators on Main Chart (Matching Screenshot Moving Averages)
    if (showIndicators && visibleCandles.length > 8) {
      const drawMA = (period: number, color: string, widthLine: number, dash: number[] = []) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = widthLine;
        ctx.setLineDash(dash);
        ctx.beginPath();
        let started = false;

        for (let i = 0; i < visibleCount; i++) {
          if (i >= period) {
            const slice = visibleCandles.slice(i - period, i);
            const avg = slice.reduce((s, item) => s + item.close, 0) / period;
            const x = i * candleWidth + candleWidth / 2;
            const y = getY(avg);
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      // Green line (MA 20)
      drawMA(14, '#00e676', 1.4);
      // Blue line (MA 50)
      drawMA(24, '#2979ff', 1.5);
      // Red line (MA 10)
      drawMA(8, '#ff3d00', 1.4);
      // White/Yellowish line (MA 5)
      drawMA(5, '#ffd600', 1.3);
    }

    // 4. Draw Japanese Candlesticks (Matching MT5 Colors: Green Bull, Red Bear)
    visibleCandles.forEach((c, i) => {
      const isBullish = c.close >= c.open;
      const x = i * candleWidth + candleWidth / 2;
      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      const barWidth = Math.max(candleWidth * 0.74, 3);
      const topY = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5);

      // Bearish candles: Red body and wick #ef5350 / #e53935
      // Bullish candles: Green outline & green body #00c853 / #22c55e
      const color = isBullish ? '#00c853' : '#ef5350';

      // Draw wicks
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, topY, barWidth, bodyHeight);
    });

    // 5. Draw Bid/Ask Lines and the Teal Price Badge with Candle Countdown (as in screenshot)
    if (currentQuote) {
      const yBid = getY(currentQuote.bid);
      const yAsk = getY(currentQuote.ask);

      // Ask line (thin red line)
      ctx.strokeStyle = '#ef5350';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yAsk);
      ctx.lineTo(chartWidth, yAsk);
      ctx.stroke();

      // Bid line (thin blue/gray line)
      ctx.strokeStyle = '#42a5f5';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, yBid);
      ctx.lineTo(chartWidth, yBid);
      ctx.stroke();

      // Horizontal red line pointing to teal badge
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, yBid);
      ctx.lineTo(chartWidth, yBid);
      ctx.stroke();

      // THE ICONIC TEAL MT5 BADGE on the right axis (Price + Countdown Timer)
      const badgeHeight = 28;
      const badgeY = Math.max(topMargin + 2, Math.min(yBid - badgeHeight / 2, mainChartHeight - 2));
      const badgeWidth = rightMargin - 4;

      // Teal background #26a69a
      ctx.fillStyle = '#26a69a';
      ctx.fillRect(chartWidth + 2, badgeY, badgeWidth, badgeHeight);

      // White price text (Line 1)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      const badgeDigits = selectedSymbol === 'USOIL' ? 2 : (currentQuote.digits || 2);
      ctx.fillText(currentQuote.bid.toFixed(badgeDigits + 1), chartWidth + 2 + badgeWidth / 2, badgeY + 11.5);

      // White countdown timer (Line 2: e.g. "03:28")
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "JetBrains Mono", sans-serif';
      ctx.fillText(formatCountdown(candleSecondsRemaining), chartWidth + 2 + badgeWidth / 2, badgeY + 23);
    }

    // 6. Sub-pane Divider with Resize Dots (•••)
    const subPaneTopY = height - subPaneHeight - bottomMargin;
    ctx.strokeStyle = '#1a1f26';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, subPaneTopY);
    ctx.lineTo(width, subPaneTopY);
    ctx.stroke();

    // 3 Dots indicator on right of separator
    ctx.fillStyle = '#8e9aa8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('•••', width - 10, subPaneTopY + 12);

    // Sub-pane Header Text matching screenshot
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MACD(12,26,9) -6.2089 -3.2429 ADX(14) 42.40 7.47 24.', 8, subPaneTopY + 13);

    // Sub-pane Right Axis Values (e.g. 3.9097, -7.1704)
    ctx.fillStyle = '#8e9aa8';
    ctx.textAlign = 'right';
    ctx.fillText('3.9097', width - 4, subPaneTopY + 28);
    ctx.fillText('-7.1704', width - 4, height - bottomMargin - 4);

    // Sub-pane Oscillators: MACD Histogram & Lines
    const subChartHeight = subPaneHeight - 24;
    const subZeroY = subPaneTopY + 20 + subChartHeight * 0.45;

    // MACD Histogram bars
    visibleCandles.forEach((c, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const val = (c.close - c.open) * 0.8;
      const barH = Math.min(Math.max(val * 1.5, -22), 22);

      ctx.fillStyle = val >= 0 ? '#b0bec5' : '#78909c';
      ctx.fillRect(x - 1, subZeroY - barH, 2.5, Math.abs(barH));
    });

    // Yellow Signal Line
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = i * candleWidth + candleWidth / 2;
      const c = visibleCandles[i];
      const sinOffset = Math.sin(i * 0.35) * 12;
      const y = subZeroY + sinOffset;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Red Dashed Indicator Line (ADX / Signal)
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    for (let i = 0; i < visibleCount; i++) {
      const x = i * candleWidth + candleWidth / 2;
      const cosOffset = Math.cos(i * 0.28) * 10;
      const y = subZeroY - cosOffset;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. Bottom Date & Time Axis Stamps (e.g. 10 Nov 00:50, 10 Nov 04:50, 10 Nov 08:50)
    ctx.fillStyle = '#8e9aa8';
    ctx.font = '10px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';

    const timeMarkers = [
      { idx: Math.floor(visibleCount * 0.15), label: '10 Nov 00:50' },
      { idx: Math.floor(visibleCount * 0.50), label: '10 Nov 04:50' },
      { idx: Math.floor(visibleCount * 0.85), label: '10 Nov 08:50' }
    ];

    timeMarkers.forEach((tm) => {
      const x = tm.idx * candleWidth;
      ctx.fillText(tm.label, x, height - 6);
    });

    // 8. Crosshair Cursor if active
    if (crosshairActive && crosshairPos) {
      ctx.strokeStyle = '#78909c';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;

      // Vertical
      ctx.beginPath();
      ctx.moveTo(crosshairPos.x, topMargin);
      ctx.lineTo(crosshairPos.x, height - bottomMargin);
      ctx.stroke();

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, crosshairPos.y);
      ctx.lineTo(chartWidth, crosshairPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price badge on Y
      const cursorPrice = paddedMin + (1 - (crosshairPos.y - topMargin) / mainChartHeight) * fullRange;
      ctx.fillStyle = '#37474f';
      ctx.fillRect(chartWidth + 1, crosshairPos.y - 9, rightMargin - 2, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cursorPrice.toFixed(currentQuote?.digits || 2), chartWidth + rightMargin / 2, crosshairPos.y + 3.5);
    }
  }, [candles, crosshairActive, crosshairPos, showIndicators, currentQuote, candleSecondsRemaining, selectedSymbol, timeframe]);

  // Canvas click handler (toggle radial menu or move crosshair)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (crosshairActive) {
      setCrosshairPos({ x, y });
    } else {
      setRadialPos({
        x: Math.min(Math.max(x, 90), rect.width - 90),
        y: Math.min(Math.max(y, 90), rect.height - 90)
      });
      setShowRadialMenu(!showRadialMenu);
    }
  };

  const handleExecuteQuickTrade = (type: 'buy' | 'sell') => {
    const ok = openTrade(selectedSymbol, type, lotSize);
    if (ok) {
      const arabicType = type === 'buy' ? 'شراء' : 'بيع';
      const quotePrice = type === 'buy' ? currentQuote.ask : currentQuote.bid;
      setTradeSuccessToast(`تم فتح صفقة ${arabicType} ${lotSize} لوت على ${selectedSymbol} بسعر ${quotePrice.toFixed(currentQuote.digits)}`);
      setTimeout(() => setTradeSuccessToast(null), 3500);
    }
  };

  const sellPriceFmt = currentQuote ? formatMT5BigPrice(currentQuote.bid, currentQuote.digits) : { main: '4093.', big: '22', superDigit: '9' };
  const buyPriceFmt = currentQuote ? formatMT5BigPrice(currentQuote.ask, currentQuote.digits) : { main: '4093.', big: '46', superDigit: '9' };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden relative select-none"
    >
      {/* 1. TOP HEADER TOOLBAR (Exact replica of user screenshot Screenshot_20261110134515_5ae38a74.jpg) */}
      <header dir="ltr" className="h-12 bg-[#000000] border-b border-[#141517] px-3.5 flex items-center justify-between z-30 shrink-0">
        {/* Left Side: Split-box quick trade toggle, Two-tone clock, Timeframe M5, Indicator curve, Crosshair */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Button 1: One-Click Dual Split-Box Toggle Icon (Red & Blue with center pill) */}
          <button
            onClick={() => setShowOneClick(!showOneClick)}
            aria-label="تفعيل التداول السريع"
            title="One-Click Trading"
            className="flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer"
          >
            <svg viewBox="0 0 32 20" className="w-[30px] h-[19px]">
              <defs>
                <clipPath id="split-box-clip">
                  <rect x="0" y="0" width="32" height="20" rx="5" />
                </clipPath>
              </defs>
              <g clipPath="url(#split-box-clip)">
                {/* Red Left Half */}
                <rect x="0" y="0" width="16" height="20" fill="#e04b3a" />
                {/* Blue Right Half */}
                <rect x="16" y="0" width="16" height="20" fill="#2d77dc" />
              </g>
              {/* Center Toggle Pill */}
              <rect
                x="8.5"
                y="5"
                width="15"
                height="10"
                rx="5"
                fill="#cfd6de"
                stroke="#1a1c20"
                strokeWidth="1.6"
              />
            </svg>
          </button>

          {/* Button 2: Two-tone Clock Icon (Red left arc, Blue right arc, white hands) */}
          <button
            onClick={() => setShowTimeframeModal(true)}
            aria-label="تغيير الفريم الزمني"
            title="Timeframes"
            className="flex items-center justify-center hover:opacity-85 transition-opacity cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]">
              {/* Red left arc */}
              <path
                d="M 12 3 A 9 9 0 0 0 12 21"
                fill="none"
                stroke="#e04b3a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Blue right arc */}
              <path
                d="M 12 21 A 9 9 0 0 0 12 3"
                fill="none"
                stroke="#2d77dc"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* White Hands */}
              <line x1="12" y1="7" x2="12" y2="12" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="12" y1="12" x2="15.5" y2="15.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Button 3: Timeframe Label Text (e.g. "M5") */}
          <button
            onClick={() => setShowTimeframeModal(true)}
            aria-label="الفريم الزمني الحالي"
            className="text-[17px] font-bold text-[#cfd8dc] hover:text-white transition-colors cursor-pointer tracking-normal leading-none"
          >
            {timeframe}
          </button>

          {/* Button 4: Indicator squiggle with diagonal straight line */}
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            aria-label="المؤشرات الفنية"
            title="المؤشرات الفنية"
            className={`flex items-center justify-center transition-colors cursor-pointer ${
              showIndicators ? 'text-[#cfd8dc]' : 'text-[#606975]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="18" x2="20" y2="6" stroke="currentColor" strokeWidth="2.4" />
              <path d="M 6 18 C 6 10, 10 7, 12 12 C 14 17, 18 14, 18 6" stroke="currentColor" strokeWidth="2.4" fill="none" />
            </svg>
          </button>

          {/* Button 5: Crosshair Tool '+' with center circle */}
          <button
            onClick={() => {
              setCrosshairActive(!crosshairActive);
              setCrosshairPos(null);
            }}
            aria-label="أداة التقاطع"
            title="Crosshair"
            className={`flex items-center justify-center transition-colors cursor-pointer ${
              crosshairActive ? 'text-[#3897f0]' : 'text-[#cfd8dc] hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-[23px] h-[23px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2.2" />
              <line x1="12" y1="3" x2="12" y2="8" />
              <line x1="12" y1="16" x2="12" y2="21" />
              <line x1="3" y1="12" x2="8" y2="12" />
              <line x1="16" y1="12" x2="21" y2="12" />
            </svg>
          </button>
        </div>

        {/* Right Side: MT5 Hamburger Menu '☰' */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="القائمة الجانبية"
          className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" className="w-6 h-6">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </header>

      {/* 2. QUICK TRADING BAR: Sell on Left in Red, Buy on Right in Blue, Lot in Center */}
      {showOneClick && (
        <div dir="ltr" className="bg-[#000000] border-b border-[#141517] flex items-center justify-between z-20">
          {/* SELL Box (Left, Vibrant Red) */}
          <button
            onClick={() => handleExecuteQuickTrade('sell')}
            className="flex-1 bg-[#d32f2f] hover:bg-[#c62828] active:opacity-90 text-white h-12 flex flex-col justify-center px-3 cursor-pointer transition-colors"
          >
            <span className="text-[10px] font-bold tracking-wider leading-none text-white/90 text-left">
              SELL
            </span>
            <div className="flex items-baseline justify-start gap-0.5 mt-0.5 leading-none">
              <span className="text-xs font-semibold">{sellPriceFmt.main}</span>
              <span className="text-lg font-black tracking-tight">{sellPriceFmt.big}</span>
              <sup className="text-[10px] font-bold -top-1">{sellPriceFmt.superDigit}</sup>
            </div>
          </button>

          {/* Center Lot Stepper with Down/Up Chevrons */}
          <div className="bg-[#000000] px-3 h-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setLotSize((prev) => Math.max(0.01, parseFloat((prev - 0.01).toFixed(2))))}
              className="text-[#8e9aa8] hover:text-white p-1 text-sm font-bold cursor-pointer"
              title="نقصان اللوت"
            >
              ˅
            </button>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.01)}
              className="w-12 text-center bg-transparent text-white font-extrabold text-sm outline-none tabular-nums"
            />
            <button
              onClick={() => setLotSize((prev) => parseFloat((prev + 0.01).toFixed(2)))}
              className="text-[#8e9aa8] hover:text-white p-1 text-sm font-bold cursor-pointer"
              title="زيادة اللوت"
            >
              ˄
            </button>
          </div>

          {/* BUY Box (Right, Vibrant Blue) */}
          <button
            onClick={() => handleExecuteQuickTrade('buy')}
            className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] active:opacity-90 text-white h-12 flex flex-col justify-center px-3 cursor-pointer transition-colors"
          >
            <span className="text-[10px] font-bold tracking-wider leading-none text-white/90 text-right">
              BUY
            </span>
            <div className="flex items-baseline justify-end gap-0.5 mt-0.5 leading-none">
              <span className="text-xs font-semibold">{buyPriceFmt.main}</span>
              <span className="text-lg font-black tracking-tight">{buyPriceFmt.big}</span>
              <sup className="text-[10px] font-bold -top-1">{buyPriceFmt.superDigit}</sup>
            </div>
          </button>
        </div>
      )}

      {/* 3. SYMBOL & TIMEFRAME HEADER INFO OVERLAY (e.g. "XAUUSDm ▾ M5 \n Gold vs US Dollar") */}
      <div className="px-3 pt-2 pb-1 bg-[#000000] flex items-center justify-between z-10">
        <div>
          <button
            onClick={() => setShowSymbolModal(true)}
            className="flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] font-extrabold text-sm tracking-tight cursor-pointer"
          >
            <span>{selectedSymbol}m</span>
            <span className="text-xs">▾</span>
            <span className="text-white text-xs font-bold mr-1">{timeframe}</span>
          </button>
          <div className="text-[11px] text-[#8e9aa8] font-normal leading-tight">
            {selectedSymbol === 'XAUUSD' ? 'Gold vs US Dollar' :
             selectedSymbol === 'USOIL' ? 'Crude Oil (WTI) vs US Dollar' :
             selectedSymbol === 'EURUSD' ? 'Euro vs US Dollar' :
             selectedSymbol === 'BTCUSD' ? 'Bitcoin vs US Dollar' :
             selectedSymbol === 'XAGUSD' ? 'Silver vs US Dollar' :
             currentQuote?.name || selectedSymbol}
          </div>
        </div>

        {/* Quick symbol tags including USOIL */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSymbol('XAUUSD')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedSymbol === 'XAUUSD' ? 'bg-[#3897f0] text-white' : 'bg-[#181a1f] text-[#8e9aa8]'
            }`}
          >
            XAUUSD
          </button>
          <button
            onClick={() => setSelectedSymbol('USOIL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedSymbol === 'USOIL' ? 'bg-[#3897f0] text-white' : 'bg-[#181a1f] text-[#8e9aa8]'
            }`}
          >
            USOIL
          </button>
          <button
            onClick={() => setShowTimeframeModal(true)}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e232c] text-[#ffd200] border border-[#303848]"
          >
            {timeframe} ⏱
          </button>
        </div>
      </div>

      {/* 4. MAIN CANVAS CHART AREA */}
      <div className="flex-1 relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Crosshair Overlay values */}
        {crosshairActive && candles.length > 0 && (
          <div className="absolute top-2 left-2 bg-[#121418]/90 border border-[#2a2f38] rounded-md px-2.5 py-1 text-[10px] text-[#a0aab5] font-mono flex items-center gap-2 pointer-events-none z-20">
            <span>O: <strong className="text-white">{candles[candles.length - 1]?.open.toFixed(currentQuote?.digits || 2)}</strong></span>
            <span>H: <strong className="text-green-400">{candles[candles.length - 1]?.high.toFixed(currentQuote?.digits || 2)}</strong></span>
            <span>L: <strong className="text-red-400">{candles[candles.length - 1]?.low.toFixed(currentQuote?.digits || 2)}</strong></span>
            <span>C: <strong className="text-white">{candles[candles.length - 1]?.close.toFixed(currentQuote?.digits || 2)}</strong></span>
          </div>
        )}

        {/* MT5 RADIAL WHEEL MENU (Clicking on chart opens radial timeframe wheel) */}
        {showRadialMenu && (
          <div
            className="absolute z-40 pointer-events-auto"
            style={{
              left: `${radialPos.x - 75}px`,
              top: `${radialPos.y - 75}px`
            }}
          >
            {/* Backdrop click-off */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowRadialMenu(false)}
            ></div>

            {/* Radial Ring */}
            <div className="relative w-[150px] h-[150px] rounded-full bg-[#14161c]/95 border-2 border-[#3897f0] shadow-2xl flex items-center justify-center z-40 animate-scaleIn">
              <button
                onClick={() => setShowRadialMenu(false)}
                className="w-10 h-10 rounded-full bg-[#3897f0] text-white font-bold flex items-center justify-center text-xs shadow-md z-50 hover:bg-[#2884dc]"
              >
                {timeframe}
              </button>

              {timeframes.map((tf, idx) => {
                const angle = (idx / timeframes.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 54;
                const bx = 75 + radius * Math.cos(angle) - 14;
                const by = 75 + radius * Math.sin(angle) - 14;

                return (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setShowRadialMenu(false);
                    }}
                    style={{ left: `${bx}px`, top: `${by}px` }}
                    className={`absolute w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-[#3897f0] text-white shadow-sm'
                        : 'bg-[#222731] text-[#d0d8e2] hover:bg-[#3897f0]/50'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trade Success Toast Notification */}
        {tradeSuccessToast && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#00c853] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-bounce">
            <span className="text-sm">✓</span>
            <span>{tradeSuccessToast}</span>
          </div>
        )}
      </div>

      {/* 5. TIMEFRAME SELECTOR MODAL (ميزة تغيير الفريمات) */}
      {showTimeframeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowTimeframeModal(false)}
        >
          <div
            className="bg-[#191b22] border border-[#2b303b] rounded-2xl w-full max-w-xs p-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#262b35] mb-3">
              <button
                onClick={() => setShowTimeframeModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8e9aa8]"
              >
                ✕
              </button>
              <h3 className="font-bold text-white text-sm">اختر الفريم الزمني (Timeframe)</h3>
              <div className="w-7"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setShowTimeframeModal(false);
                  }}
                  className={`py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#3897f0] text-white shadow-md ring-1 ring-white/50'
                      : 'bg-[#121418] text-[#8e9aa8] hover:text-white hover:bg-[#20242e] border border-[#242832]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SYMBOL SWITCHER MODAL (Including USOIL) */}
      {showSymbolModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowSymbolModal(false)}
        >
          <div
            className="bg-[#191b22] border border-[#2b303b] rounded-2xl w-full max-w-sm p-4 text-right shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#262b35] mb-2">
              <button
                onClick={() => setShowSymbolModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#8e9aa8]"
              >
                ✕
              </button>
              <h3 className="font-bold text-white text-sm">اختر الرمز المالي</h3>
              <div className="w-7"></div>
            </div>

            <div className="overflow-y-auto divide-y divide-[#20242d] flex-1">
              {quotes.map((q) => (
                <button
                  key={q.symbol}
                  onClick={() => {
                    setSelectedSymbol(q.symbol);
                    setShowSymbolModal(false);
                  }}
                  className={`w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer text-right ${
                    selectedSymbol === q.symbol ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="text-left" dir="ltr">
                    <span className="font-bold text-white text-xs block tabular-nums">
                      {q.bid.toFixed(q.digits)}
                    </span>
                    <span className="text-[10px] text-[#8e9aa8]">
                      Spread: {q.spread}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{q.symbol}</span>
                      {selectedSymbol === q.symbol && (
                        <span className="w-2 h-2 rounded-full bg-[#3897f0]"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8e9aa8] block truncate max-w-[180px]">
                      {q.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
