import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Trash2, Pencil, X, Plus, Save } from 'lucide-react';
import { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const TransactionsView: React.FC = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction, accounts, creditCards } = useData();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    // Form States
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
    const [accountId, setAccountId] = useState('');
    const [cardId, setCardId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Outros');

    const CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros'];

    const filteredTransactions = transactions
        .filter(t => filter === 'all' || t.type === filter)
        .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSave = () => {
        if (!amount || !desc) return;

        const txData: Transaction = {
            id: editingTx ? editingTx.id : uuidv4(),
            description: desc,
            amount: parseFloat(amount),
            type: type,
            date: new Date(date).toISOString(),
            category: category,
            accountId: accountId || undefined,
            cardId: cardId || undefined,
        };

        if (editingTx) updateTransaction(txData);
        else addTransaction(txData);

        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingTx(null);
        setAmount('');
        setDesc('');
        setType('expense');
        setAccountId('');
        setCardId('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('Outros');
    };

    const openEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setAmount(tx.amount.toString());
        setDesc(tx.description);
        setType(tx.type);
        setAccountId(tx.accountId || '');
        setCardId(tx.cardId || '');
        setDate(new Date(tx.date).toISOString().split('T')[0]);
        setCategory(tx.category || 'Outros');
        setIsFormOpen(true);
    };

    return (
        <div className="h-full overflow-y-auto pb-20 px-1">

            {/* Header / Search */}
            <div className="sticky top-0 z-20 bg-gradient-to-b from-[#9FACE6] to-[#9FACE6]/0 pb-4 pt-1">
                <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/60 focus:bg-white/80 outline-none font-bold text-slate-700 text-sm placeholder:text-slate-400"
                        />
                    </div>
                    <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95">
                        <Plus size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['all', 'income', 'expense', 'transfer'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`
                                px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                                ${filter === f ? 'bg-slate-800 text-white' : 'bg-white/30 text-slate-600 hover:bg-white/50'}
                            `}
                        >
                            {f === 'all' ? 'Todas' : f === 'income' ? 'Entradas' : f === 'expense' ? 'Saídas' : 'Transf.'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 mt-2">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <p className="text-[10px] uppercase font-black tracking-widest mb-2">Sem resultados</p>
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <div key={t.id} className="group flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 hover:bg-white/80 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{t.description}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</p>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <p className="text-[9px] text-slate-500 font-bold">{t.category}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`font-black text-sm tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </span>
                                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(t)} className="text-indigo-500 hover:text-indigo-700"><Pencil size={14} /></button>
                                    <button onClick={() => deleteTransaction(t.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm max-h-[90vh] overflow-y-auto" padding="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800">{editingTx ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                            <button onClick={() => setIsFormOpen(false)}><X size={20} className="text-slate-400 bg-transparent" /></button>
                        </div>

                        <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
                            <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Entrada</button>
                            <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Saída</button>
                            <button onClick={() => setType('transfer')} className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${type === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Transf.</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-800 outline-none text-lg" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-800 outline-none" placeholder="Ex: Aluguel" />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-600 outline-none text-xs" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-slate-600 outline-none text-xs">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conta / Cartão</label>
                                <div className="flex gap-2">
                                    <select value={accountId} onChange={e => { setAccountId(e.target.value); setCardId(''); }} disabled={!!cardId} className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-slate-600 outline-none text-xs">
                                        <option value="">Conta...</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <select value={cardId} onChange={e => { setCardId(e.target.value); setAccountId(''); }} disabled={!!accountId || type === 'income'} className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-slate-600 outline-none text-xs">
                                        <option value="">Cartão...</option>
                                        {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button onClick={handleSave} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-2 mt-4">
                                <Save size={16} /> Salvar
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
