
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Fix: Added Activity icon to the imports from lucide-react
import { Sparkles, RefreshCw, TrendingUp, Info, Plus, Trash2, AlertCircle, ShoppingCart, Tag, Activity } from 'lucide-react';
import { analyzePortfolioWithGemini } from '../services/geminiService';
import { Stock } from '../types';

interface PortfolioOptimizerProps {
  portfolio: Stock[];
  setPortfolio: React.Dispatch<React.SetStateAction<Stock[]>>;
}

const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({ portfolio, setPortfolio }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  
  // New stock form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState({ 
    symbol: '', 
    name: '', 
    allocation: 10,
    quantity: 0,
    buyPrice: 0
  });

  const totalAllocation = useMemo(() => portfolio.reduce((sum, s) => sum + s.allocation, 0), [portfolio]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // We send the full data to Gemini so the bots know the quantities and buy prices
      const result = await analyzePortfolioWithGemini(portfolio);
      setAdvice(result || "No advice received.");
    } catch (err) {
      setAdvice("Error analyzing portfolio. Check Gemini API.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const addStock = () => {
    if (!newStock.symbol || !newStock.name) return;
    
    const stockToAdd: Stock = {
      ...newStock,
      price: Math.floor(Math.random() * 500) + 50, // Initial market price (random mock)
      change: (Math.random() * 10 - 5)
    };
    
    setPortfolio([...portfolio, stockToAdd]);
    setNewStock({ symbol: '', name: '', allocation: 10, quantity: 0, buyPrice: 0 });
    setShowAddForm(false);
  };

  const removeStock = (symbol: string) => {
    setPortfolio(portfolio.filter(s => s.symbol !== symbol));
  };

  const updateAllocation = (symbol: string, val: number) => {
    setPortfolio(portfolio.map(s => s.symbol === symbol ? { ...s, allocation: val } : s));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            Target Weights (%)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="symbol" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="allocation" radius={[4, 4, 0, 0]}>
                  {portfolio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.allocation > 15 ? '#6366f1' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              Strategic Gemini Advisor
            </h3>
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isOptimizing ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              Ask Advisor
            </button>
          </div>

          <div className="flex-1 bg-slate-950/50 rounded-xl p-6 border border-slate-800 overflow-y-auto max-h-[250px] relative">
            {!advice && !isOptimizing && (
              <div className="text-center py-10 opacity-40">
                <Info size={40} className="mx-auto mb-4" />
                <p className="text-sm">Bots will analyze your quantity and buy price to suggest exits or re-entries.</p>
              </div>
            )}
            {isOptimizing && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                </div>
                <p className="text-xs text-slate-500 font-mono">ADVISING MULTI-AGENT SWARM...</p>
              </div>
            )}
            {advice && (
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{advice}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset List & Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="font-bold text-lg">Portfolio Assets</h3>
            <div className={`text-xs mt-1 flex items-center gap-2 ${totalAllocation === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
              <AlertCircle size={12} />
              Total Allocation: {totalAllocation}% (Recommended: 100%)
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all text-white border border-slate-700"
          >
            <Plus size={14} />
            {showAddForm ? 'Cancel' : 'Add Stock'}
          </button>
        </div>

        {showAddForm && (
          <div className="p-6 bg-slate-950/30 border-b border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ticker</label>
                <input 
                  type="text" 
                  value={newStock.symbol}
                  onChange={e => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 ring-indigo-500 outline-none"
                  placeholder="e.g. MSFT"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" 
                  value={newStock.name}
                  onChange={e => setNewStock({...newStock, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 ring-indigo-500 outline-none"
                  placeholder="Microsoft Corp"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                <input 
                  type="number" 
                  value={newStock.quantity}
                  onChange={e => setNewStock({...newStock, quantity: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 ring-indigo-500 outline-none"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Buy Price ($)</label>
                <input 
                  type="number" 
                  value={newStock.buyPrice}
                  onChange={e => setNewStock({...newStock, buyPrice: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 ring-indigo-500 outline-none"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Weight (%)</label>
                <input 
                  type="number" 
                  value={newStock.allocation}
                  onChange={e => setNewStock({...newStock, allocation: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 ring-indigo-500 outline-none"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={addStock}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
              >
                Deploy into Portfolio
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Price Basis</th>
                <th className="px-6 py-4">Target Allocation</th>
                <th className="px-6 py-4">P/L</th>
                <th className="px-6 py-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {portfolio.map((stock, i) => {
                const profit = (stock.price - stock.buyPrice) * stock.quantity;
                const pPercent = stock.buyPrice > 0 ? ((stock.price - stock.buyPrice) / stock.buyPrice) * 100 : 0;
                
                return (
                  <tr key={stock.symbol} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs border border-slate-700">
                          {stock.symbol[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{stock.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{stock.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <ShoppingCart size={14} className="text-slate-600" />
                        <span className="font-bold">{stock.quantity}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Shares</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Current: <span className="text-slate-400">${(stock.price * stock.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-slate-600" />
                          <span className="text-xs text-slate-400">Buy: ${stock.buyPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-indigo-500" />
                          <span className="text-xs font-bold text-white">Now: ${stock.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={stock.allocation}
                          onChange={e => updateAllocation(stock.symbol, parseInt(e.target.value))}
                          className="w-20 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-bold text-slate-300 min-w-[30px]">{stock.allocation}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {profit >= 0 ? '+' : ''}${Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] font-bold ${pPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pPercent >= 0 ? '▲' : '▼'} {Math.abs(pPercent).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeStock(stock.symbol)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Sell / Remove Position"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {portfolio.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                    OpenClaw ecosystem standby. Deploy your first asset to begin agent monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizer;
