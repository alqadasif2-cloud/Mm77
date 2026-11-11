import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Account, SymbolQuote, Position, Deal, MessageItem, TabType, Timeframe } from '../types/mt5';
import {
  db,
  auth,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface TradingContextType {
  activeAccount: Account;
  accounts: Account[];
  setActiveAccount: (account: Account) => void;
  quotes: SymbolQuote[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  positions: Position[];
  historyDeals: Deal[];
  openTrade: (symbol: string, type: 'buy' | 'sell', lots: number, sl?: number, tp?: number) => boolean;
  closePosition: (positionId: string) => void;
  modifyPosition: (positionId: string, sl?: number, tp?: number) => void;
  messages: MessageItem[];
  markMessageAsRead: (id: string) => void;
  unreadCount: number;
  totalProfit: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isSimulatorFrame: boolean;
  setIsSimulatorFrame: (show: boolean) => void;
  openOrderModal: (symbol?: string) => void;
  orderModalSymbol: string | null;
  closeOrderModal: () => void;
  accountInfoModalOpen: boolean;
  setAccountInfoModalOpen: (open: boolean) => void;
  otpModalOpen: boolean;
  setOtpModalOpen: (open: boolean) => void;
  addAccountModalOpen: boolean;
  setAddAccountModalOpen: (open: boolean) => void;
  addNewAccount: (account: Partial<Account>) => void;
  deleteAccount: (accountId: string) => void;
  isBinanceConnected: boolean;
  currentUser: User | null;
  isAuthReady: boolean;
  isCloudSynced: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'exness-real-33',
    name: 'Standard',
    broker: 'Exness Technologies Ltd',
    server: 'Exness-MT5Real33',
    accountNumber: '252622825',
    balance: 0.00,
    currency: 'USD',
    type: 'real',
    leverage: '1:2000',
    logoType: 'exness',
    lastKnownLabel: 'Access point'
  },
  {
    id: 'exness-trial-16',
    name: 'Standard',
    broker: 'Exness Technologies Ltd',
    server: 'Exness-MT5Trial16',
    accountNumber: '472970564',
    balance: 29.35,
    currency: 'USD',
    type: 'demo',
    leverage: '1:200',
    logoType: 'exness',
    lastKnownLabel: 'آخر ما عرف ، USD'
  },
  {
    id: 'metaquotes-demo',
    name: 'Eslam Alqadasi',
    broker: 'MetaQuotes Ltd.',
    server: 'MetaQuotes-Demo',
    accountNumber: '5057410470',
    balance: 96818.02,
    currency: 'USD',
    type: 'demo',
    leverage: '1:100',
    logoType: 'metaquotes',
    lastKnownLabel: 'آخر ما عرف ، USD'
  }
];

const INITIAL_QUOTES: SymbolQuote[] = [
  {
    symbol: 'XAUUSD',
    name: 'الذهب مقابل الدولار الأمريكي',
    digits: 2,
    bid: 4053.40,
    ask: 4053.60,
    spread: 20,
    high: 4085.00,
    low: 4038.00,
    time: '15:58:22',
    change: 0.57,
    category: 'metals',
    source: 'COMEX Live'
  },
  {
    symbol: 'XAGUSD',
    name: 'الفضة مقابل الدولار الأمريكي',
    digits: 3,
    bid: 52.375,
    ask: 52.390,
    spread: 15,
    high: 53.150,
    low: 51.820,
    time: '15:58:22',
    change: 2.24,
    category: 'metals',
    source: 'COMEX Live'
  },
  {
    symbol: 'USOIL',
    name: 'نفط خام غرب تكساس (WTI Crude Oil)',
    digits: 2,
    bid: 86.68,
    ask: 86.71,
    spread: 3,
    high: 87.80,
    low: 85.90,
    time: '15:58:25',
    change: 0.73,
    category: 'commodities',
    source: 'NYMEX Live'
  },
  {
    symbol: 'EURUSD',
    name: 'اليورو مقابل الدولار الأمريكي',
    digits: 5,
    bid: 1.08425,
    ask: 1.08437,
    spread: 12,
    high: 1.08740,
    low: 1.08210,
    time: '15:58:21',
    change: -0.05,
    category: 'forex'
  },
  {
    symbol: 'GBPUSD',
    name: 'الجنيه الإسترليني مقابل الدولار',
    digits: 5,
    bid: 1.26780,
    ask: 1.26795,
    spread: 15,
    high: 1.27150,
    low: 1.26420,
    time: '15:58:19',
    change: 0.18,
    category: 'forex'
  },
  {
    symbol: 'USDJPY',
    name: 'الدولار مقابل الين الياباني',
    digits: 3,
    bid: 154.620,
    ask: 154.634,
    spread: 14,
    high: 155.200,
    low: 154.100,
    time: '15:58:20',
    change: 0.32,
    category: 'forex'
  },
  {
    symbol: 'BTCUSD',
    name: 'البيتكوين مقابل الدولار الأمريكي',
    digits: 2,
    bid: 67450.00,
    ask: 67475.00,
    spread: 2500,
    high: 68100.00,
    low: 66250.00,
    time: '15:58:22',
    change: 1.82,
    category: 'crypto',
    source: 'Binance Live'
  },
  {
    symbol: 'US30',
    name: 'مؤشر داو جونز الأمريكي',
    digits: 1,
    bid: 39420.5,
    ask: 39423.5,
    spread: 30,
    high: 39650.0,
    low: 39210.0,
    time: '15:58:15',
    change: -0.25,
    category: 'indices'
  },
  {
    symbol: 'USDCHF',
    name: 'الدولار مقابل الفرنك السويسري',
    digits: 5,
    bid: 0.90820,
    ask: 0.90835,
    spread: 15,
    high: 0.91200,
    low: 0.90550,
    time: '15:58:12',
    change: 0.08,
    category: 'forex'
  },
  {
    symbol: 'AUDUSD',
    name: 'الدولار الأسترالي مقابل الأمريكي',
    digits: 5,
    bid: 0.66240,
    ask: 0.66254,
    spread: 14,
    high: 0.66580,
    low: 0.65920,
    time: '15:58:18',
    change: 0.12,
    category: 'forex'
  },
  {
    symbol: 'USDCAD',
    name: 'الدولار مقابل الدولار الكندي',
    digits: 5,
    bid: 1.36850,
    ask: 1.36868,
    spread: 18,
    high: 1.37200,
    low: 1.36500,
    time: '15:58:09',
    change: -0.15,
    category: 'forex'
  }
];

const INITIAL_POSITIONS: Position[] = [];

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg-1',
    title: 'إشعار أمان Exness: تسجيل دخول ناجح',
    content: 'تم تسجيل الدخول بنجاح إلى حساب MT5 الخاص بك رقم 256476260 على الخادم Exness-MT5Real35 من عنوان IP موثوق.',
    sender: 'Exness Security',
    time: 'منذ 15 دقيقة',
    read: false,
    type: 'security'
  },
  {
    id: 'msg-2',
    title: 'تحليل فني: مستويات دعم ومقاومة الذهب XAUUSD',
    content: 'يختبر الذهب حالياً مستوى 4053$ للأونصة مدعوماً بتوقعات خفض الفائدة. مستويات المقاومة التالية عند 4085$ والدعم عند 4038$.',
    sender: 'MQL5 Financial News',
    time: 'منذ ساعتين',
    read: true,
    type: 'news'
  },
  {
    id: 'msg-3',
    title: 'تحديث منصة MetaTrader 5 للهاتف المحمول',
    content: 'إصدار جديد برقم 5.0.3800 يتضمن تحسينات في سرعة تنفيذ الأوامر ورسوم بيانية أسرع ودعم مؤشرات متقدمة.',
    sender: 'MetaQuotes Support',
    time: 'أمس 18:30',
    read: true,
    type: 'system'
  }
];

const INITIAL_HISTORY: Deal[] = [
  {
    id: 'deal-trial-1',
    ticket: 48920194,
    symbol: 'USOIL',
    type: 'buy',
    lots: 0.01,
    openPrice: 86.20,
    closePrice: 84.24,
    swap: 0,
    commission: 0,
    profit: -19.60,
    openTime: '2024.11.10 13:10:00',
    closeTime: '2024.11.10 13:42:15',
    accountId: 'exness-trial-16',
    comment: 'D-ALLINT-USD-INT-472970564-2'
  },
  {
    id: 'deposit-trial-1',
    ticket: 48920100,
    symbol: 'Balance',
    type: 'deposit',
    lots: 0,
    openPrice: 0,
    closePrice: 0,
    swap: 0,
    commission: 0,
    profit: 19.51,
    openTime: '2024.11.10 12:45:01',
    closeTime: '2024.11.10 12:45:01',
    accountId: 'exness-trial-16',
    comment: 'D-ALLINT-USD-INT-472970564-2'
  },
  {
    id: 'deposit-real-33',
    ticket: 10000001,
    symbol: 'Balance',
    type: 'deposit',
    lots: 0,
    openPrice: 0,
    closePrice: 0,
    swap: 0,
    commission: 0,
    profit: 0.00,
    openTime: '2026.11.10 08:00:00',
    closeTime: '2026.11.10 08:00:00',
    accountId: 'exness-real-33',
    comment: 'رصيد الحساب'
  },
  {
    id: 'deal-demo-1',
    ticket: 50574104,
    symbol: 'XAUUSD',
    type: 'buy',
    lots: 1.00,
    openPrice: 4093.22,
    closePrice: 4061.40,
    swap: 0,
    commission: 0,
    profit: -3181.98,
    openTime: '2026.11.10 10:15:00',
    closeTime: '2026.11.10 10:45:00',
    accountId: 'metaquotes-demo',
    comment: 'MetaTrader 5 Demo Trade'
  },
  {
    id: 'deposit-demo-1',
    ticket: 50574100,
    symbol: 'Balance',
    type: 'deposit',
    lots: 0,
    openPrice: 0,
    closePrice: 0,
    swap: 0,
    commission: 0,
    profit: 100000.00,
    openTime: '2026.11.10 08:30:00',
    closeTime: '2026.11.10 08:30:00',
    accountId: 'metaquotes-demo',
    comment: 'رصيد الحساب'
  }
];

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // 2. Accounts state (persisted locally + cloud)
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('mt5_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ACCOUNTS;
  });

  const [activeAccount, setActiveAccountState] = useState<Account>(() => {
    try {
      const savedId = localStorage.getItem('mt5_active_account_id');
      const savedAccs = localStorage.getItem('mt5_accounts');
      if (savedId && savedAccs) {
        const parsed: Account[] = JSON.parse(savedAccs);
        const found = parsed.find((a) => a.id === savedId);
        if (found) return found;
      }
    } catch {}
    return INITIAL_ACCOUNTS[0];
  });

  const [quotes, setQuotes] = useState<SymbolQuote[]>(INITIAL_QUOTES);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAUUSD');
  const [isBinanceConnected, setIsBinanceConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const [timeframe, setTimeframe] = useState<Timeframe>('M15');

  // Positions and History
  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem('mt5_positions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_POSITIONS;
  });

  const [historyDeals, setHistoryDeals] = useState<Deal[]>(() => {
    try {
      const saved = localStorage.getItem('mt5_history_deals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_HISTORY;
  });

  // UI state
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string | null>(null);
  const [accountInfoModalOpen, setAccountInfoModalOpen] = useState<boolean>(false);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState<boolean>(false);

  // Validate Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Persistent Client/Device Cloud Sync ID
  const [cloudClientId] = useState<string>(() => {
    try {
      let saved = localStorage.getItem('mt5_cloud_client_id');
      if (!saved) {
        saved = 'mt5_usr_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('mt5_cloud_client_id', saved);
      }
      return saved;
    } catch {
      return 'mt5_usr_default';
    }
  });

  // Dedicated Auto-Upload to Cloud helper
  const syncToCloud = useCallback(async (
    accs: Account[],
    poss: Position[],
    deals: Deal[]
  ) => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: cloudClientId,
          accounts: accs,
          positions: poss,
          historyDeals: deals
        })
      });
      if (res.ok) {
        setIsCloudSynced(true);
      }
    } catch (e) {
      console.warn('Auto cloud sync notice:', e);
    }
  }, [cloudClientId]);

  // Automatic connection on boot & restore cloud-persisted state
  useEffect(() => {
    setIsAuthReady(true);
    setIsCloudSynced(true);

    const initCloudSync = async () => {
      try {
        const res = await fetch(`/api/sync?clientId=${cloudClientId}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            const { accounts: remoteAccs, positions: remotePoss, historyDeals: remoteDeals } = json.data;
            if (Array.isArray(remoteAccs) && remoteAccs.length > 0) {
              setAccounts(remoteAccs);
              setActiveAccountState(prev => remoteAccs.find(a => a.id === prev?.id) || remoteAccs[0]);
            }
            if (Array.isArray(remotePoss)) {
              setPositions(remotePoss);
            }
            if (Array.isArray(remoteDeals) && remoteDeals.length > 0) {
              setHistoryDeals(remoteDeals);
            }
            setIsCloudSynced(true);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not restore from cloud endpoint initially:', err);
      }

      // Initial backup if nothing saved in cloud yet
      syncToCloud(accounts, positions, historyDeals);
    };

    initCloudSync();
  }, [cloudClientId, syncToCloud]);

  // Debounced auto-sync to cloud when data updates
  useEffect(() => {
    const timer = setTimeout(() => {
      syncToCloud(accounts, positions, historyDeals);
    }, 800);
    return () => clearTimeout(timer);
  }, [accounts, positions, historyDeals, syncToCloud]);

  // Background auth listener (preserves auto-connected cloud status)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      setIsCloudSynced(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync accounts with Firestore when user logs in
  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    const accountsPath = `users/${userId}/accounts`;

    let isMounted = true;
    const accountsColRef = collection(db, 'users', userId, 'accounts');

    // Initial check: if Firestore has no accounts for this user yet, seed initial accounts
    getDocs(accountsColRef)
      .then((snap) => {
        if (!isMounted) return;
        if (snap.empty) {
          // Upload local accounts to Firestore
          accounts.forEach((acc) => {
            const accDocRef = doc(db, 'users', userId, 'accounts', acc.id);
            setDoc(accDocRef, {
              ...acc,
              userId
            }).catch((err) => handleFirestoreError(err, OperationType.WRITE, `${accountsPath}/${acc.id}`));
          });
        }
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.LIST, accountsPath);
      });

    // Real-time listener for user's accounts
    const unsub = onSnapshot(
      accountsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteAccounts: Account[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Account;
            remoteAccounts.push(data);
          });
          setAccounts(remoteAccounts);
          try {
            localStorage.setItem('mt5_accounts', JSON.stringify(remoteAccounts));
          } catch {}

          // Ensure active account is synced
          setActiveAccountState((prev) => {
            const matched = remoteAccounts.find((a) => a.id === prev.id);
            return matched || remoteAccounts[0];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, accountsPath);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, [currentUser]);

  // Sync positions for active account from Firestore
  useEffect(() => {
    if (!currentUser || !activeAccount?.id) return;
    const userId = currentUser.uid;
    const accountId = activeAccount.id;
    const posPath = `users/${userId}/accounts/${accountId}/positions`;
    const posColRef = collection(db, 'users', userId, 'accounts', accountId, 'positions');

    const unsub = onSnapshot(
      posColRef,
      (snapshot) => {
        const remotePositions: Position[] = [];
        snapshot.forEach((docSnap) => {
          remotePositions.push(docSnap.data() as Position);
        });

        // Merge with existing positions for other accounts
        setPositions((prev) => {
          const otherPositions = prev.filter((p) => p.accountId && p.accountId !== accountId);
          const combined = [...remotePositions, ...otherPositions];
          try {
            localStorage.setItem('mt5_positions', JSON.stringify(combined));
          } catch {}
          return combined;
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, posPath);
      }
    );

    return () => unsub();
  }, [currentUser, activeAccount?.id]);

  // Sync deals/history for active account from Firestore
  useEffect(() => {
    if (!currentUser || !activeAccount?.id) return;
    const userId = currentUser.uid;
    const accountId = activeAccount.id;
    const dealsPath = `users/${userId}/accounts/${accountId}/deals`;
    const dealsColRef = collection(db, 'users', userId, 'accounts', accountId, 'deals');

    const unsub = onSnapshot(
      dealsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteDeals: Deal[] = [];
          snapshot.forEach((docSnap) => {
            remoteDeals.push(docSnap.data() as Deal);
          });

          setHistoryDeals((prev) => {
            const otherDeals = prev.filter((d) => d.accountId && d.accountId !== accountId);
            const combined = [...remoteDeals, ...otherDeals];
            try {
              localStorage.setItem('mt5_history_deals', JSON.stringify(combined));
            } catch {}
            return combined;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, dealsPath);
      }
    );

    return () => unsub();
  }, [currentUser, activeAccount?.id]);

  // Local storage persistence fallbacks
  useEffect(() => {
    try {
      localStorage.setItem('mt5_accounts', JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  useEffect(() => {
    try {
      if (activeAccount?.id) {
        localStorage.setItem('mt5_active_account_id', activeAccount.id);
      }
    } catch {}
  }, [activeAccount]);

  useEffect(() => {
    try {
      localStorage.setItem('mt5_history_deals', JSON.stringify(historyDeals));
    } catch {}
  }, [historyDeals]);

  useEffect(() => {
    try {
      localStorage.setItem('mt5_positions', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Save states on mobile app background/exit
  useEffect(() => {
    const saveAllState = () => {
      try {
        localStorage.setItem('mt5_accounts', JSON.stringify(accounts));
        if (activeAccount?.id) localStorage.setItem('mt5_active_account_id', activeAccount.id);
        localStorage.setItem('mt5_positions', JSON.stringify(positions));
        localStorage.setItem('mt5_history_deals', JSON.stringify(historyDeals));
      } catch {}
    };

    window.addEventListener('beforeunload', saveAllState);
    window.addEventListener('pagehide', saveAllState);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveAllState();
    });

    return () => {
      window.removeEventListener('beforeunload', saveAllState);
      window.removeEventListener('pagehide', saveAllState);
    };
  }, [accounts, activeAccount, positions, historyDeals]);

  // Connect to Binance live WebSocket for BTCUSD
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isCancelled = false;

    const connectBinance = () => {
      try {
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
          .then((res) => res.json())
          .then((data) => {
            if (isCancelled || !data || !data.lastPrice) return;
            const price = parseFloat(data.lastPrice);
            const bid = parseFloat(data.bidPrice) || price;
            const ask = parseFloat(data.askPrice) || price + 1.0;
            const high = parseFloat(data.highPrice) || price;
            const low = parseFloat(data.lowPrice) || price;
            const change = parseFloat(data.priceChangePercent) || 0;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            setQuotes((prev) =>
              prev.map((q) =>
                q.symbol === 'BTCUSD'
                  ? {
                      ...q,
                      bid,
                      ask,
                      high,
                      low,
                      change,
                      time: timeStr
                    }
                  : q
              )
            );
            setIsBinanceConnected(true);
          })
          .catch(() => {});

        ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
        ws.onopen = () => setIsBinanceConnected(true);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data || !data.c) return;
            const newBid = parseFloat(data.b || data.c);
            const newAsk = parseFloat(data.a || (parseFloat(data.c) + 1.5).toFixed(2));
            const newHigh = parseFloat(data.h || data.c);
            const newLow = parseFloat(data.l || data.c);
            const change = parseFloat(data.P || 0);

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            setQuotes((prev) =>
              prev.map((q) => {
                if (q.symbol !== 'BTCUSD') return q;
                const isUp = newBid >= q.bid;
                return {
                  ...q,
                  bid: newBid,
                  ask: newAsk,
                  high: newHigh,
                  low: newLow,
                  change,
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down'
                };
              })
            );
          } catch {}
        };
        ws.onclose = () => {
          if (!isCancelled) {
            setIsBinanceConnected(false);
            reconnectTimeout = setTimeout(connectBinance, 3000);
          }
        };
      } catch {
        if (!isCancelled) reconnectTimeout = setTimeout(connectBinance, 5000);
      }
    };

    connectBinance();
    return () => {
      isCancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // Live real market quotes for Silver (XAGUSD), Oil (USOIL), and Gold (XAUUSD)
  useEffect(() => {
    let isCancelled = false;

    const fetchRealCommodities = async () => {
      try {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        // 1. Try backend proxy route for real COMEX & NYMEX quotes
        const res = await fetch('/api/commodities');
        if (res.ok) {
          const data = await res.json();
          if (isCancelled || !data) return;

          setQuotes((prev) =>
            prev.map((q) => {
              if (q.symbol === 'XAGUSD' && data['XAGUSD']) {
                const s = data['XAGUSD'];
                const price = Number(s.price);
                const isUp = price >= q.bid;
                return {
                  ...q,
                  bid: parseFloat(price.toFixed(3)),
                  ask: parseFloat((price + 0.015).toFixed(3)),
                  high: s.high ? parseFloat(Number(s.high).toFixed(3)) : q.high,
                  low: s.low ? parseFloat(Number(s.low).toFixed(3)) : q.low,
                  change: s.change ? parseFloat(Number(s.change).toFixed(2)) : q.change,
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down',
                  source: 'COMEX Realtime'
                };
              }

              if (q.symbol === 'USOIL' && data['USOIL']) {
                const o = data['USOIL'];
                const price = Number(o.price);
                const isUp = price >= q.bid;
                return {
                  ...q,
                  bid: parseFloat(price.toFixed(2)),
                  ask: parseFloat((price + 0.03).toFixed(2)),
                  high: o.high ? parseFloat(Number(o.high).toFixed(2)) : q.high,
                  low: o.low ? parseFloat(Number(o.low).toFixed(2)) : q.low,
                  change: o.change ? parseFloat(Number(o.change).toFixed(2)) : q.change,
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down',
                  source: 'NYMEX Realtime'
                };
              }

              if (q.symbol === 'XAUUSD' && data['XAUUSD']) {
                const g = data['XAUUSD'];
                const price = Number(g.price);
                const isUp = price >= q.bid;
                return {
                  ...q,
                  bid: parseFloat(price.toFixed(2)),
                  ask: parseFloat((price + 0.20).toFixed(2)),
                  high: g.high ? parseFloat(Number(g.high).toFixed(2)) : q.high,
                  low: g.low ? parseFloat(Number(g.low).toFixed(2)) : q.low,
                  change: g.change ? parseFloat(Number(g.change).toFixed(2)) : q.change,
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down',
                  source: 'COMEX Realtime'
                };
              }

              return q;
            })
          );
          return;
        }
      } catch {
        // Fallback to direct client-side open APIs
      }

      // Fallback 1: Spot Silver from Currency CDN API
      try {
        const silverRes = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xag.json');
        if (silverRes.ok) {
          const sData = await silverRes.json();
          if (!isCancelled && sData?.xag?.usd) {
            const price = parseFloat(sData.xag.usd);
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            setQuotes((prev) =>
              prev.map((q) => {
                if (q.symbol !== 'XAGUSD') return q;
                const isUp = price >= q.bid;
                return {
                  ...q,
                  bid: parseFloat(price.toFixed(3)),
                  ask: parseFloat((price + 0.015).toFixed(3)),
                  high: Math.max(q.high, price),
                  low: Math.min(q.low, price),
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down',
                  source: 'Spot Realtime'
                };
              })
            );
          }
        }
      } catch {}

      // Fallback 2: TwelveData for Gold XAU/USD
      try {
        const TWELVE_DATA_KEY = 'f348542a01f64309aeb042123ffccf54';
        const goldRes = await fetch(`https://api.twelvedata.com/quote?symbol=XAU/USD&apikey=${TWELVE_DATA_KEY}`);
        if (goldRes.ok) {
          const gData = await goldRes.json();
          if (!isCancelled && gData?.close) {
            const price = parseFloat(gData.close);
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            setQuotes((prev) =>
              prev.map((q) => {
                if (q.symbol !== 'XAUUSD') return q;
                const isUp = price >= q.bid;
                return {
                  ...q,
                  bid: parseFloat(price.toFixed(2)),
                  ask: parseFloat((price + 0.20).toFixed(2)),
                  high: parseFloat(gData.high) || Math.max(q.high, price),
                  low: parseFloat(gData.low) || Math.min(q.low, price),
                  change: parseFloat(gData.percent_change) || q.change,
                  time: timeStr,
                  tickDirection: isUp ? 'up' : 'down',
                  source: 'Twelve Data'
                };
              })
            );
          }
        }
      } catch {}
    };

    fetchRealCommodities();
    const intervalId = setInterval(fetchRealCommodities, 10000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  // Realistic micro-ticking for market activity
  useEffect(() => {
    const interval = setInterval(() => {
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) => {
          if (q.symbol === 'BTCUSD') return q;
          if (Math.random() > 0.45) return q;

          const isUp = Math.random() > 0.49;
          const pipSize = Math.pow(10, -q.digits);
          const delta = (isUp ? 1 : -1) * (Math.floor(Math.random() * 3) + 1) * pipSize;

          let newBid = parseFloat((q.bid + delta).toFixed(q.digits));
          let newAsk = parseFloat((newBid + q.spread * pipSize).toFixed(q.digits));
          const newHigh = Math.max(q.high, newAsk);
          const newLow = Math.min(q.low, newBid);

          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

          return {
            ...q,
            bid: newBid,
            ask: newAsk,
            high: newHigh,
            low: newLow,
            time: timeStr,
            tickDirection: isUp ? 'up' : 'down'
          };
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Update open positions' current prices and P&L based on live quotes
  useEffect(() => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        const quote = quotes.find((q) => q.symbol === pos.symbol);
        if (!quote) return pos;

        const currentPrice = pos.type === 'buy' ? quote.bid : quote.ask;
        let profit = 0;

        if (pos.symbol === 'XAUUSD') {
          profit = pos.type === 'buy'
            ? (currentPrice - pos.openPrice) * 100 * pos.lots
            : (pos.openPrice - currentPrice) * 100 * pos.lots;
        } else if (pos.symbol === 'USOIL' || pos.symbol === 'USOILm') {
          profit = pos.type === 'buy'
            ? (currentPrice - pos.openPrice) * 1000 * pos.lots
            : (pos.openPrice - currentPrice) * 1000 * pos.lots;
        } else if (pos.symbol === 'XAGUSD') {
          profit = pos.type === 'buy'
            ? (currentPrice - pos.openPrice) * 5000 * pos.lots
            : (pos.openPrice - currentPrice) * 5000 * pos.lots;
        } else if (pos.symbol === 'BTCUSD') {
          profit = pos.type === 'buy'
            ? (currentPrice - pos.openPrice) * pos.lots
            : (pos.openPrice - currentPrice) * pos.lots;
        } else if (pos.symbol === 'USDJPY') {
          profit = pos.type === 'buy'
            ? ((currentPrice - pos.openPrice) / currentPrice) * 100000 * pos.lots
            : ((pos.openPrice - currentPrice) / currentPrice) * 100000 * pos.lots;
        } else {
          profit = pos.type === 'buy'
            ? (currentPrice - pos.openPrice) * 100000 * pos.lots
            : (pos.openPrice - currentPrice) * 100000 * pos.lots;
        }

        const netProfit = parseFloat((profit + pos.swap + pos.commission).toFixed(2));
        return {
          ...pos,
          currentPrice,
          profit: netProfit
        };
      })
    );
  }, [quotes]);

  // Financial calculations strictly scoped to active account
  const accountPositions = positions.filter(
    (p) => !p.accountId || p.accountId === activeAccount.id
  );
  const totalProfit = accountPositions.reduce((sum, p) => sum + p.profit, 0);
  const equity = parseFloat((activeAccount.balance + totalProfit).toFixed(2));

  const leverageRatio = activeAccount.leverage === '1:2000' ? 2000 : 100;
  const margin = parseFloat(
    accountPositions
      .reduce((sum, p) => {
        const notional =
          p.symbol === 'XAUUSD'
            ? p.lots * 100 * p.openPrice
            : p.symbol === 'USOIL' || p.symbol === 'USOILm'
            ? p.lots * 1000 * p.openPrice
            : p.symbol === 'XAGUSD'
            ? p.lots * 5000 * p.openPrice
            : p.lots * 100000;
        return sum + notional / leverageRatio;
      }, 0)
      .toFixed(2)
  );

  const freeMargin = parseFloat((equity - margin).toFixed(2));
  const marginLevel = margin > 0 ? parseFloat(((equity / margin) * 100).toFixed(2)) : 0;

  // Open a new trade (saves locally + writes to Firestore)
  const openTrade = useCallback(
    (symbol: string, type: 'buy' | 'sell', lots: number, sl?: number, tp?: number) => {
      const quote = quotes.find((q) => q.symbol === symbol);
      if (!quote) return false;

      const openPrice = type === 'buy' ? quote.ask : quote.bid;
      const commission = -parseFloat((lots * 7).toFixed(2));
      const now = new Date();
      const openTime = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newPos: Position = {
        id: `pos-${Date.now()}`,
        ticket: Math.floor(80000000 + Math.random() * 19999999),
        symbol,
        type,
        lots,
        openPrice,
        currentPrice: openPrice,
        sl,
        tp,
        swap: 0,
        commission,
        profit: commission,
        openTime,
        accountId: activeAccount.id
      };

      setPositions((prev) => {
        const updated = [newPos, ...prev];
        try {
          localStorage.setItem('mt5_positions', JSON.stringify(updated));
        } catch {}
        syncToCloud(accounts, updated, historyDeals);
        return updated;
      });

      // Sync to cloud if user is authenticated
      if (currentUser) {
        const posDocRef = doc(db, 'users', currentUser.uid, 'accounts', activeAccount.id, 'positions', newPos.id);
        const payload: Record<string, any> = {
          ...newPos,
          userId: currentUser.uid
        };
        if (newPos.sl === undefined) delete payload.sl;
        if (newPos.tp === undefined) delete payload.tp;

        setDoc(posDocRef, payload).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/accounts/${activeAccount.id}/positions/${newPos.id}`)
        );
      }

      return true;
    },
    [quotes, activeAccount.id, currentUser]
  );

  // Close position and record deal in history (saves locally + updates Firestore)
  const closePosition = useCallback(
    (positionId: string) => {
      const pos = positions.find((p) => p.id === positionId);
      if (!pos) return;

      const now = new Date();
      const closeTime = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newDeal: Deal = {
        id: `deal-${Date.now()}`,
        ticket: pos.ticket,
        symbol: pos.symbol,
        type: pos.type,
        lots: pos.lots,
        openPrice: pos.openPrice,
        closePrice: pos.currentPrice,
        sl: pos.sl,
        tp: pos.tp,
        swap: pos.swap,
        commission: pos.commission,
        profit: pos.profit,
        openTime: pos.openTime,
        closeTime,
        accountId: activeAccount.id,
        comment: ''
      };

      // Add to history
      setHistoryDeals((prev) => {
        const updated = [newDeal, ...prev];
        try {
          localStorage.setItem('mt5_history_deals', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Remove from open positions
      const remainingPositions = positions.filter((p) => p.id !== positionId);
      setPositions(remainingPositions);
      try {
        localStorage.setItem('mt5_positions', JSON.stringify(remainingPositions));
      } catch {}

      // Update active account balance
      const newBalance = parseFloat((activeAccount.balance + pos.profit).toFixed(2));
      const updatedAccount = { ...activeAccount, balance: newBalance };

      setActiveAccountState(updatedAccount);
      const updatedAccs = accounts.map((a) => (a.id === updatedAccount.id ? updatedAccount : a));
      setAccounts(updatedAccs);
      try {
        localStorage.setItem('mt5_accounts', JSON.stringify(updatedAccs));
      } catch {}

      syncToCloud(updatedAccs, remainingPositions, [newDeal, ...historyDeals]);

      // Sync to cloud if user is authenticated
      if (currentUser) {
        const userId = currentUser.uid;
        // 1. Delete position from cloud
        const posDocRef = doc(db, 'users', userId, 'accounts', activeAccount.id, 'positions', positionId);
        deleteDoc(posDocRef).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `users/${userId}/accounts/${activeAccount.id}/positions/${positionId}`)
        );

        // 2. Add deal to history in cloud
        const dealDocRef = doc(db, 'users', userId, 'accounts', activeAccount.id, 'deals', newDeal.id);
        const dealPayload: Record<string, any> = {
          ...newDeal,
          userId
        };
        if (newDeal.sl === undefined) delete dealPayload.sl;
        if (newDeal.tp === undefined) delete dealPayload.tp;

        setDoc(dealDocRef, dealPayload).catch((err) =>
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}/accounts/${activeAccount.id}/deals/${newDeal.id}`)
        );

        // 3. Update account balance in cloud
        const accDocRef = doc(db, 'users', userId, 'accounts', activeAccount.id);
        setDoc(accDocRef, { ...updatedAccount, userId }, { merge: true }).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/accounts/${activeAccount.id}`)
        );
      }
    },
    [positions, activeAccount, currentUser]
  );

  // Modify SL / TP
  const modifyPosition = useCallback(
    (positionId: string, sl?: number, tp?: number) => {
      setPositions((prev) => {
        const updated = prev.map((p) => (p.id === positionId ? { ...p, sl, tp } : p));
        try {
          localStorage.setItem('mt5_positions', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (currentUser && activeAccount?.id) {
        const posDocRef = doc(db, 'users', currentUser.uid, 'accounts', activeAccount.id, 'positions', positionId);
        const updates: any = {};
        if (sl !== undefined) updates.sl = sl;
        if (tp !== undefined) updates.tp = tp;
        setDoc(posDocRef, updates, { merge: true }).catch((err) =>
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/accounts/${activeAccount.id}/positions/${positionId}`)
        );
      }
    },
    [currentUser, activeAccount?.id]
  );

  const markMessageAsRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const openOrderModal = (symbol?: string) => {
    setOrderModalSymbol(symbol || selectedSymbol);
  };

  const closeOrderModal = () => {
    setOrderModalSymbol(null);
  };

  // Add new account (persists locally + cloud)
  const addNewAccount = (acc: Partial<Account>) => {
    const isExness = acc.broker?.toLowerCase().includes('exness') || acc.logoType === 'exness';
    const initialBalance = acc.balance !== undefined && !isNaN(acc.balance) ? Number(acc.balance) : 1000;
    const now = new Date();
    const timeFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      name: acc.name || 'إسلام',
      broker: acc.broker || (isExness ? 'Exness Technologies Ltd' : 'MetaQuotes Ltd.'),
      server: acc.server || (isExness ? 'Exness-MT5Real35' : 'MetaQuotes-Demo'),
      accountNumber: acc.accountNumber || String(Math.floor(200000000 + Math.random() * 99999999)),
      balance: initialBalance,
      currency: acc.currency || 'USD',
      type: acc.type || 'demo',
      leverage: acc.leverage || '1:2000',
      logoType: isExness ? 'exness' : 'metaquotes',
      lastKnownLabel: `آخر ما عرف . ${acc.currency || 'USD'}`
    };

    const depositDeal: Deal = {
      id: `deposit-${Date.now()}`,
      ticket: Math.floor(10000000 + Math.random() * 89999999),
      symbol: 'Balance',
      type: 'deposit',
      lots: 0,
      openPrice: 0,
      closePrice: 0,
      swap: 0,
      commission: 0,
      profit: initialBalance,
      openTime: timeFormatted,
      closeTime: timeFormatted,
      accountId: newAcc.id,
      comment: 'رصيد الحساب'
    };

    setAccounts((prev) => [newAcc, ...prev]);
    setActiveAccountState(newAcc);
    setHistoryDeals((prev) => [depositDeal, ...prev]);
    setAddAccountModalOpen(false);

    // Sync to cloud if user is authenticated
    if (currentUser) {
      const userId = currentUser.uid;
      const accDocRef = doc(db, 'users', userId, 'accounts', newAcc.id);
      setDoc(accDocRef, { ...newAcc, userId }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/accounts/${newAcc.id}`)
      );

      const dealDocRef = doc(db, 'users', userId, 'accounts', newAcc.id, 'deals', depositDeal.id);
      setDoc(dealDocRef, { ...depositDeal, userId }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/accounts/${newAcc.id}/deals/${depositDeal.id}`)
      );
    }
  };

  // Delete account (persists locally + cloud)
  const deleteAccount = (accountId: string) => {
    setAccounts((prev) => {
      const remaining = prev.filter((a) => a.id !== accountId);
      if (remaining.length === 0) {
        const defaultAcc = INITIAL_ACCOUNTS[0];
        setActiveAccountState(defaultAcc);
        return [defaultAcc];
      }
      if (activeAccount.id === accountId) {
        setActiveAccountState(remaining[0]);
      }
      return remaining;
    });

    if (currentUser) {
      const accDocRef = doc(db, 'users', currentUser.uid, 'accounts', accountId);
      deleteDoc(accDocRef).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/accounts/${accountId}`)
      );
    }
  };

  const setActiveAccount = (account: Account) => {
    setActiveAccountState(account);
  };

  const handleSignInWithGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error('Google Sign-in failed', e);
    }
  };

  const handleSignOutUser = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Sign-out failed', e);
    }
  };

  return (
    <TradingContext.Provider
      value={{
        activeAccount,
        accounts,
        setActiveAccount,
        quotes,
        selectedSymbol,
        setSelectedSymbol,
        activeTab,
        setActiveTab,
        timeframe,
        setTimeframe,
        positions,
        historyDeals,
        openTrade,
        closePosition,
        modifyPosition,
        messages,
        markMessageAsRead,
        unreadCount,
        totalProfit,
        equity,
        margin,
        freeMargin,
        marginLevel,
        isDrawerOpen,
        setIsDrawerOpen,
        isSimulatorFrame,
        setIsSimulatorFrame,
        openOrderModal,
        orderModalSymbol,
        closeOrderModal,
        accountInfoModalOpen,
        setAccountInfoModalOpen,
        otpModalOpen,
        setOtpModalOpen,
        addAccountModalOpen,
        setAddAccountModalOpen,
        addNewAccount,
        deleteAccount,
        isBinanceConnected,
        currentUser,
        isAuthReady,
        isCloudSynced,
        signInWithGoogle: handleSignInWithGoogle,
        signOutUser: handleSignOutUser
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
