
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Stock } from '../types';

interface DashboardProps {
  portfolio: Stock[];
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ portfolio }) => {
  // Real calculations
  const totalValue = useMemo(() => portfolio.reduce((sum, s) => sum + (s.price * s.quantity), 0), [portfolio]);
  const totalCost = useMemo(() => portfolio.reduce((sum, s) => sum + (s.buyPrice * s.quantity), 0), [portfolio]);
  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const distributionData = useMemo(() => {
    return portfolio.map((s, i) => ({
      name: s.symbol,
      value: s.price * s.quantity, // Value-based distribution for chart
      color: COLORS[i % COLORS.length]
    }));
  }, [portfolio]);

  // Mock history scaled to actual value
  const historyData = useMemo(() => [
    { name: 'Mon', value: totalValue * 0.95 },
    { name: 'Tue', value: totalValue * 0.97 },
    { name: 'Wed', value: totalValue * 0.96 },
    { name: 'Thu', value: totalValue * 0.98 },
    { name: 'Fri', value: totalValue * 0.99 },
    { name: 'Sat', value: totalValue * 0.995 },
    { name: 'Sun', value: totalValue },
  ], [totalValue]);

  const stats = [
    { 
      label: 'Portfolio Market Value', 
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Real-time', 
      icon: Wallet, 
      color: 'text-indigo-500' 
    },
    { 
      label: 'Total Unrealized P/L', 
      value: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: `${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%`, 
      icon: DollarSign, 
      color: totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500' 
    },
    { 
      label: 'Portfolio Health', 
      value: profitPercentage > 10 ? 'Excellent' : profitPercentage > 0 ? 'Good' : 'At Risk', 
      change: 'Dynamic', 
      icon: TrendingUp, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Agent Coverage', 
      value: '100%', 
      change: 'All Assets', 
      icon: Zap, 
      color: 'text-amber-500' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={`p-2 bg-slate-800 rounded-lg ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') || stat.change.includes('Real') || stat.change.includes('Excellent') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Live Metrics</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white">Value Over Time</h3>
            <select className="bg-slate-800 border-none rounded-lg text-xs px-3 py-1.5 focus:ring-2 ring-indigo-500 text-slate-300">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-[400px]">
          <h3 className="font-bold text-lg text-white mb-6">Market Value Mix</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2 overflow-y-auto max-h-[100px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {distributionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-200">
                  {((item.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
