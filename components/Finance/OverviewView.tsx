import React from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

export const OverviewView: React.FC = () => {
    const { accounts, transactions } = useData();

    // Calculate Totals
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

    // Prepare Chart Data (Last 7 Days)
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];

        const dayIncome = transactions
            .filter(t => t.type === 'income' && t.date.startsWith(dateStr))
            .reduce((acc, curr) => acc + curr.amount, 0);

        const dayExpense = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
            .reduce((acc, curr) => acc + curr.amount, 0);

        return {
            name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
            receita: dayIncome,
            despesa: dayExpense
        };
    });

    return (
        <div className="h-full overflow-y-auto pb-20 px-1 space-y-6">

            {/* Net Worth Card */}
            <GlassCard className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-white/10" padding="p-6">
                <div className="flex items-center gap-3 mb-2 opacity-70">
                    <Wallet size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Patrimônio Líquido</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-6">
                    R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h1>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                        <div className="flex items-center gap-2 text-emerald-300 mb-1">
                            <ArrowUpRight size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Entradas</span>
                        </div>
                        <p className="text-lg font-bold">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                        <div className="flex items-center gap-2 text-rose-300 mb-1">
                            <ArrowDownLeft size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Saídas</span>
                        </div>
                        <p className="text-lg font-bold">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </GlassCard>

            {/* Cash Flow Chart */}
            <GlassCard className="bg-white/40" padding="p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp size={18} className="text-slate-700" />
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Fluxo de Caixa (7 Dias)</h3>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3} />
                            <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                            <Area type="monotone" dataKey="despesa" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Recent Activity */}
            <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Atividade Recente</h3>
                <div className="space-y-3">
                    {transactions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{t.description}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-4">Nenhuma transação recente.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
