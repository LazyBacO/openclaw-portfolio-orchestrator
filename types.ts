
export interface Stock {
  symbol: string;
  name: string;
  price: number; // Current Market Price
  change: number;
  allocation: number; // Target weight in portfolio (%)
  quantity: number; // Number of shares owned
  buyPrice: number; // Original purchase price per share
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastLog: string;
  performance: number;
  trend: number[]; // Performance values over time (sparkline)
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  audio?: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  AGENTS = 'agents',
  OPTIMIZER = 'optimizer',
  AI_CHAT = 'ai_chat'
}
