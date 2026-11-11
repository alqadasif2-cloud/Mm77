import React from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { BottomTabBar } from './components/BottomTabBar';
import { AccountsView } from './components/accounts/AccountsView';
import { QuotesView } from './components/quotes/QuotesView';
import { InteractiveChart } from './components/chart/InteractiveChart';
import { TradeView } from './components/trade/TradeView';
import { HistoryView } from './components/history/HistoryView';
import { MessagesView } from './components/messages/MessagesView';
import { DrawerMenu } from './components/drawer/DrawerMenu';
import { NewOrderModal } from './components/modals/NewOrderModal';
import { AccountInfoModal } from './components/modals/AccountInfoModal';
import { OtpModal } from './components/modals/OtpModal';
import { AddAccountModal } from './components/modals/AddAccountModal';

const MT5AppContent: React.FC = () => {
  const { activeTab } = useTrading();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountsView />;
      case 'quotes':
        return <QuotesView />;
      case 'chart':
        return <InteractiveChart />;
      case 'trade':
        return <TradeView />;
      case 'history':
        return <HistoryView />;
      case 'messages':
        return <MessagesView />;
      default:
        return <AccountsView />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#000000] text-white overflow-hidden relative select-none">
      {/* Main Screen Area - Full viewport app, no fake phone bars or status bars */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {renderActiveScreen()}
      </main>

      {/* MT5 Bottom Tab Bar */}
      <BottomTabBar />

      {/* Modals & Overlays */}
      <DrawerMenu />
      <NewOrderModal />
      <AccountInfoModal />
      <OtpModal />
      <AddAccountModal />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <MT5AppContent />
    </TradingProvider>
  );
}
