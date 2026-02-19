import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import { Plus, Trash2, X, Wallet, TrendingUp } from 'lucide-react';
import { Budget } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const BudgetsView: React.FC = () => {
    const { budgets, addBudget, deleteBudget, transactions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [category, setCategory] = useState('Outros');
    const [amount, setAmount] = useState('');

    const CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros'];

    // Calculate spent for each budget dynamically
    const budgetsWithSpent = budgets.map(b => {
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === b.category)
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { ...b, spent };
    });

    const handleSave = () => {
        if (!amount) return;
        const newBudget: Budget = {
            id: uuidv4(),
            category,
            amount: parseFloat(amount),
            spent: 0
        };
        addBudget(newBudget);
        setIsModalOpen(false);
        setAmount('');
        setCategory('Outros');
    };

    return (
        <div className="h-full overflow-y-auto pb-20 px-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Orçamentos Mensais</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Plus size={14} /> Novo
                </button>
            </div>

            <div className="grid gap-4">
                {budgetsWithSpent.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <Wallet size={48} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-[10px] uppercase font-black tracking-widest">Sem orçamentos</p>
                    </div>
                ) : (
                    budgetsWithSpent.map(b => {
                        const percent = Math.min(100, (b.spent / b.amount) * 100);
                        const isOver = b.spent > b.amount;

                        return (
                            <GlassCard key={b.id} padding="p-5" className="relative group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${isOver ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            <TrendingUp size={16} />
                                        </div>
                                        <h4 className="font-bold text-slate-800">{b.category}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Restante</p>
                                        <p className={`font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            R$ {(b.amount - b.spent).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Gasto: R$ {b.spent.toFixed(2)}</span>
                                    <span>Limite: R$ {b.amount.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={() => deleteBudget(b.id)}
                                    className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </GlassCard>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm" padding="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Novo Orçamento</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none text-sm">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limite Mensal</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none text-lg" placeholder="1000.00" />
                            </div>
                            <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg mt-2">Criar</button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
