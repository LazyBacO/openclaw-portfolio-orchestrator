
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Terminal, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Agent } from '../types';

const generateInitialTrend = (base: number) => {
  return Array.from({ length: 15 }, (_, i) => ({
    value: base + (Math.random() * 4 - 2)
  }));
};

const INITIAL_AGENTS: Agent[] = [
  { id: '1', name: 'Macro-Bot 01', role: 'Global Sentiment Analysis', status: 'running', lastLog: 'Scanning Reuters API...', performance: 12.4, trend: generateInitialTrend(12.4).map(d => d.value) },
  { id: '2', name: 'TechScraper', role: 'NASDAQ Data Mining', status: 'running', lastLog: 'Parsing NVDA quarterly reports...', performance: 18.2, trend: generateInitialTrend(18.2).map(d => d.value) },
  { id: '3', name: 'RiskGuard', role: 'Hedge Orchestrator', status: 'idle', lastLog: 'Standby for market volatility', performance: 4.1, trend: generateInitialTrend(4.1).map(d => d.value) },
  { id: '4', name: 'OpenClaw-Prime', role: 'Main Strategy Engine', status: 'running', lastLog: 'Rebalancing portfolio weights...', performance: 22.8, trend: generateInitialTrend(22.8).map(d => d.value) },
  { id: '5', name: 'Ethos-Analyzer', role: 'ESG Scoring Agent', status: 'error', lastLog: 'Connection timeout: SEC database', performance: -2.4, trend: generateInitialTrend(-2.4).map(d => d.value) },
];

const AgentControl: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  // Simulate dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.status !== 'running') return agent;
        
        const change = (Math.random() * 1 - 0.5);
        const newPerformance = Number((agent.performance + change).toFixed(2));
        const newTrend = [...agent.trend.slice(1), newPerformance];
        
        return {
          ...agent,
          performance: newPerformance,
          trend: newTrend
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleStatus = (id: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === id) {
        const nextStatus = agent.status === 'running' ? 'idle' : 'running';
        return { ...agent, status: nextStatus as any };
      }
      return agent;
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Overview */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <Info className="text-indigo-400 mt-1 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-indigo-100">Pinokio Bridge Active</h4>
          <p className="text-indigo-300/80 text-sm mt-1">
            OpenClaw is currently running through Pinokio. All browser sessions and API keys are managed by the Pinokio environment.
            Sparklines represent real-time performance telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 shadow-xl group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{agent.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">{agent.role}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  agent.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  agent.status === 'idle' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                  'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {agent.status}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 mb-6 h-20 flex flex-col gap-1 shadow-inner">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono font-bold">
                  <Terminal size={12} className="text-indigo-500" />
                  <span>LAST EVENT</span>
                </div>
                <p className="text-xs text-slate-400 font-mono line-clamp-2 leading-relaxed italic">
                  {agent.lastLog}
                </p>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex gap-1">
                  <button 
                    onClick={() => toggleStatus(agent.id)}
                    className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-slate-700"
                  >
                    {agent.status === 'running' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-red-400 border border-transparent hover:border-slate-700">
                    <Square size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                  <div className="w-16 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={agent.trend.map(v => ({ value: v }))}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={agent.performance >= 0 ? '#10b981' : '#ef4444'} 
                          strokeWidth={2} 
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">Alpha</span>
                    <span className={`text-sm font-bold font-mono ${agent.performance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {agent.performance >= 0 ? '+' : ''}{agent.performance}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Agent Placeholder */}
        <button className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all group min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
            <span className="text-2xl font-light">+</span>
          </div>
          <span className="font-bold text-sm">Deploy New Agent</span>
          <span className="text-[10px] mt-1 uppercase tracking-widest font-semibold opacity-60">OpenClaw Cloud Orchestration</span>
        </button>
      </div>
    </div>
  );
};

export default AgentControl;
