import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import {
    Building2,
    CreditCard,
    PieChart,
    TrendingUp,
    Plus,
    Wallet,
    ArrowRightLeft,
    LayoutDashboard,
    Target
} from 'lucide-react';

import { OverviewView } from './OverviewView';
import { AccountsView } from './AccountsView';
import { TransactionsView } from './TransactionsView';
import { BudgetsView } from './BudgetsView';
import { GoalsView } from './GoalsView';

export const FinancialHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'transactions' | 'budgets' | 'goals'>('overview');

    return (
        <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 px-2">
                <button onClick={onBack} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90">
                    <ArrowRightLeft size={24} className="rotate-180" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finance Ops</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Glass Financial Hub</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 px-1 no-scrollbar">
                {[
                    { id: 'overview', icon: LayoutDashboard, label: 'Visão Geral' },
                    { id: 'accounts', icon: Building2, label: 'Contas' },
                    { id: 'transactions', icon: ArrowRightLeft, label: 'Extrato' },
                    { id: 'budgets', icon: Wallet, label: 'Orçamentos' },
                    { id: 'goals', icon: Target, label: 'Metas' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap
              ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg scale-105'
                                : 'bg-white/40 text-slate-600 hover:bg-white/60'}
            `}
                    >
                        <tab.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'overview' && <OverviewView />}
                {activeTab === 'accounts' && <AccountsView />}
                {activeTab === 'transactions' && <TransactionsView />}
                {activeTab === 'budgets' && <BudgetsView />}
                {activeTab === 'goals' && <GoalsView />}
            </div>
        </div>
    );
};
