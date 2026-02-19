import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import { Target, Plus, Trash2, X, Trophy, Minus, ArrowUp } from 'lucide-react';
import { Goal } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const GoalsView: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSave = () => {
        if (!name || !target) return;

        const newGoal: Goal = {
            id: uuidv4(),
            name,
            targetAmount: parseFloat(target),
            currentAmount: parseFloat(current) || 0,
            deadline: deadline || undefined,
            color: 'bg-indigo-500'
        };
        addGoal(newGoal);
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setTarget('');
        setCurrent('');
        setDeadline('');
    };

    const handleAddMoney = (goal: Goal, amountStr: string) => {
        const amount = parseFloat(amountStr);
        if (!amount) return;
        updateGoal({ ...goal, currentAmount: goal.currentAmount + amount });
    };

    return (
        <div className="h-full overflow-y-auto pb-20 px-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Metas Financeiras</h3>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    <Plus size={14} /> Nova Meta
                </button>
            </div>

            <div className="grid gap-4">
                {goals.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <Target size={48} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-[10px] uppercase font-black tracking-widest">Sem metas definidas</p>
                    </div>
                ) : (
                    goals.map(g => {
                        const percent = Math.min(100, (g.currentAmount / g.targetAmount) * 100);

                        return (
                            <GlassCard key={g.id} padding="p-5" className="relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{g.name}</h4>
                                            {g.deadline && <p className="text-[10px] uppercase font-black text-slate-400">Até {new Date(g.deadline).toLocaleDateString()}</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteGoal(g.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-2xl font-black text-slate-800 tracking-tighter">R$ {g.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-xs font-bold text-slate-500 mb-1">de R$ {g.targetAmount.toLocaleString('pt-BR')}</p>
                                </div>

                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 relative"
                                        style={{ width: `${percent}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>

                                {/* Quick Add Actions */}
                                <div className="flex gap-2">
                                    {[10, 50, 100].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleAddMoney(g, val.toString())}
                                            className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-200"
                                        >
                                            + {val}
                                        </button>
                                    ))}
                                    <button className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">...</button>
                                </div>
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
                            <h3 className="font-bold text-slate-800">Nova Meta</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Meta</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none" placeholder="Ex: Carro Novo" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Alvo (R$)</label>
                                <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none text-lg" placeholder="50000.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Já tenho (R$)</label>
                                <input type="number" value={current} onChange={e => setCurrent(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prazo (Opcional)</label>
                                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-700 outline-none" />
                            </div>
                            <button onClick={handleSave} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg mt-2">Criar Meta</button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
