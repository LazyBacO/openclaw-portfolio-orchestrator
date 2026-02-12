
import React, { useState } from 'react';
import { AppTab, Stock } from './types';
import Dashboard from './components/Dashboard';
import AgentControl from './components/AgentControl';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import AIAssistant from './components/AIAssistant';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Menu,
  X
} from 'lucide-react';

const INITIAL_PORTFOLIO: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 1.2, allocation: 30, quantity: 50, buyPrice: 150.00 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.05, change: -2.4, allocation: 25, quantity: 20, buyPrice: 190.00 },
  { symbol: 'NVDA', name: 'Nvidia', price: 822.79, change: 4.5, allocation: 20, quantity: 15, buyPrice: 450.00 },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 110.20, change: 0.5, allocation: 15, quantity: 100, buyPrice: 95.50 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 188.45, change: -0.2, allocation: 10, quantity: 40, buyPrice: 165.20 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [portfolio, setPortfolio] = useState<Stock[]>(INITIAL_PORTFOLIO);

  const tabs = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppTab.AGENTS, label: 'Agents Control', icon: Users },
    { id: AppTab.OPTIMIZER, label: 'Portfolio Optimizer', icon: TrendingUp },
    { id: AppTab.AI_CHAT, label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        transition-all duration-300 border-r border-slate-800 bg-slate-900 flex flex-col
        lg:relative fixed inset-y-0 left-0 z-40
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">
            O
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight">OpenClaw</span>}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <tab.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
              P
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Pinokio Instance</span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold">Connected</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-950">
        <div className="p-8 max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 mt-1">
                Multi-agent orchestration for optimized portfolio growth.
              </p>
            </div>
            <div className="hidden sm:flex gap-3">
              <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">Live Market Feed</span>
              </div>
            </div>
          </header>

          <div className="transition-all duration-300">
            {activeTab === AppTab.DASHBOARD && <Dashboard portfolio={portfolio} />}
            {activeTab === AppTab.AGENTS && <AgentControl />}
            {activeTab === AppTab.OPTIMIZER && <PortfolioOptimizer portfolio={portfolio} setPortfolio={setPortfolio} />}
            {activeTab === AppTab.AI_CHAT && <AIAssistant />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
