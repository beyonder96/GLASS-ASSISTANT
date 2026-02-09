import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Filter, Trash2, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, Pencil, X, Save, AlertCircle, Sparkles, Loader2, BrainCircuit, Target, Lightbulb, CreditCard as CardIcon, Building2 } from 'lucide-react';
import { Transaction, Account, CreditCard } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';


interface FinanceScreenProps {
    onBack: () => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({ onBack }) => {
    const { transactions, setTransactions, accounts, setAccounts, creditCards, setCreditCards, user } = useData();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Account/Card Modal States
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    // Form States for Account/Card
    const [accName, setAccName] = useState('');
    const [accType, setAccType] = useState<Account['type']>('checking');
    const [accBalance, setAccBalance] = useState('');

    const [cardName, setCardName] = useState('');
    const [cardLimit, setCardLimit] = useState('');
    const [cardClosing, setCardClosing] = useState('');
    const [cardDue, setCardDue] = useState('');

    // Form states for Transaction
    const [editingId, setEditingId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCardId, setSelectedCardId] = useState<string>('');

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Predictor States
    const [isPredicting, setIsPredicting] = useState(false);
    const [targetAmount, setTargetAmount] = useState('');
    const [prediction, setPrediction] = useState<{ verdict: 'SAFE' | 'WARNING' | 'DANGER', reasoning: string, impact: string, tip: string } | null>(null);

    const totalBalance = useMemo(() => {
        // Balance is sum of all accounts
        return accounts.reduce((acc, curr) => acc + curr.balance, 0);
    }, [accounts]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

    const handleSaveAccount = () => {
        if (!accName) return;
        const newAcc: Account = {
            id: Date.now().toString(),
            name: accName,
            type: accType,
            balance: parseFloat(accBalance) || 0,
            color: 'bg-indigo-500' // Default
        };
        setAccounts([...accounts, newAcc]);
        setIsAccountModalOpen(false);
        setAccName(''); setAccBalance('');
    };

    const handleSaveCard = () => {
        if (!cardName) return;
        const newCard: CreditCard = {
            id: Date.now().toString(),
            name: cardName,
            limit: parseFloat(cardLimit) || 0,
            closingDay: parseInt(cardClosing) || 1,
            dueDay: parseInt(cardDue) || 10,
            color: 'bg-indigo-600'
        };
        setCreditCards([...creditCards, newCard]);
        setIsCardModalOpen(false);
        setCardName(''); setCardLimit(''); setCardClosing(''); setCardDue('');
    };


    const handlePredict = () => {
        if (!targetAmount || parseFloat(targetAmount) <= 0) return;
        setIsPredicting(true);

        // Simulação de delay para "pensar"
        setTimeout(() => {
            const cost = parseFloat(targetAmount);
            const percent = (cost / totalBalance) * 100;
            let verdict: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
            let reasoning = '';
            let tip = '';

            if (percent <= 30) {
                verdict = 'SAFE';
                reasoning = 'Compra segura. Você tem folga orçamentária.';
                tip = 'Aproveite! Seus investimentos continuam crescendo.';
            } else if (percent <= 60) {
                verdict = 'WARNING';
                reasoning = 'Atenção. Isso compromete metade do seu saldo.';
                tip = 'Considere esperar o próximo mês ou parcelar sem juros.';
            } else {
                verdict = 'DANGER';
                reasoning = 'Alto risco! Isso esvaziaria sua reserva.';
                tip = 'Adie essa compra. Foque em repor seu caixa antes.';
            }

            setPrediction({
                verdict,
                reasoning,
                impact: `Impacto de ${percent.toFixed(1)}% no seu patrimônio líquido.`,
                tip
            });
            setIsPredicting(false);
        }, 1500);
    };

    const handleSave = () => {
        if (!amount || !desc) return;

        const txAmount = parseFloat(amount);

        if (editingId) {
            setTransactions(transactions.map(t => t.id === editingId ? {
                ...t, type, amount: txAmount, description: desc,
                accountId: selectedAccountId || undefined,
                cardId: selectedCardId || undefined
            } : t));
            setEditingId(null);
        } else {
            const newTx: Transaction = {
                id: Date.now().toString(),
                type: type,
                amount: txAmount,
                description: desc,
                date: new Date().toISOString(),
                accountId: selectedAccountId || undefined,
                cardId: selectedCardId || undefined
            };
            setTransactions([newTx, ...transactions]);

            // Update Account Balance if linked (simple logic for MVP)
            if (selectedAccountId) {
                setAccounts(accounts.map(a => {
                    if (a.id === selectedAccountId) {
                        return { ...a, balance: type === 'income' ? a.balance + txAmount : a.balance - txAmount };
                    }
                    return a;
                }));
            }
        }
        resetForm();
    };

    const resetForm = () => { setIsFormOpen(false); setEditingId(null); setAmount(''); setDesc(''); setType('expense'); setSelectedAccountId(''); setSelectedCardId(''); };

    const filteredTransactions = transactions.filter(t => filter === 'all' ? true : t.type === filter);

    return (
        <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-xs shadow-2xl" padding="p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Excluir?</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Não</button>
                            <button onClick={() => { setTransactions(transactions.filter(t => t.id !== deleteId)); setDeleteId(null); }} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200">Sim</button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 px-2">
                <button onClick={onBack} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finanças</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sincronizado com Aura</p>
                </div>
            </div>

            {/* Wallets & Cards Section */}
            <div className="mb-6 px-1">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Minhas Contas</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAccountModalOpen(true)} className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">+ CONTA</button>
                        <button onClick={() => setIsCardModalOpen(true)} className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">+ CARTÃO</button>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {/* Add Account Card Placeholder if empty */}
                    {accounts.length === 0 && creditCards.length === 0 && (
                        <div className="min-w-[200px] h-32 rounded-2xl bg-white/30 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                            <Wallet size={24} className="mb-2" />
                            <p className="text-xs font-bold uppercase">Nenhuma conta</p>
                        </div>
                    )}

                    {accounts.map(acc => (
                        <div key={acc.id} className="min-w-[220px] p-5 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Building2 size={60} /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{acc.type}</p>
                            <p className="font-bold text-lg mb-4">{acc.name}</p>
                            <p className="text-2xl font-black tracking-tight">R$ {acc.balance.toFixed(2)}</p>
                        </div>
                    ))}

                    {creditCards.map(card => (
                        <div key={card.id} className="min-w-[220px] p-5 rounded-2xl bg-indigo-600 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><CardIcon size={60} /></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Cartão de Crédito</p>
                            <p className="font-bold text-lg mb-4">{card.name}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-bold uppercase opacity-60">Limite</p>
                                    <p className="text-lg font-black tracking-tight">R$ {card.limit.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold uppercase opacity-60">Fecha dia</p>
                                    <p className="text-sm font-black">{card.closingDay}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aura Predictor Section */}
            <GlassCard className="mb-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl relative overflow-hidden group" padding="p-6">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all">
                    <BrainCircuit size={100} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={16} className="text-indigo-200" /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Simulador de Viabilidade Aura</span>
                    </div>

                    {!prediction ? (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-indigo-50 leading-relaxed">Kenned, pensando em comprar algo novo para o apê? Eu analiso seu saldo e obra para você.</p>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-3.5 text-indigo-300 font-black text-sm">R$</span>
                                    <input
                                        type="number"
                                        value={targetAmount}
                                        onChange={e => setTargetAmount(e.target.value)}
                                        placeholder="Valor da compra..."
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-10 pr-4 text-white font-black placeholder:text-indigo-300/50 outline-none focus:bg-white/20 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handlePredict}
                                    disabled={isPredicting || !targetAmount}
                                    className="px-6 rounded-2xl bg-white text-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isPredicting ? <Loader2 size={16} className="animate-spin" /> : <><Target size={16} /> Analisar</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${prediction.verdict === 'SAFE' ? 'bg-emerald-400 text-emerald-950' : prediction.verdict === 'WARNING' ? 'bg-amber-400 text-amber-950' : 'bg-rose-400 text-rose-950'}`}>
                                    Recomendação: {prediction.verdict === 'SAFE' ? 'Segura' : prediction.verdict === 'WARNING' ? 'Cuidado' : 'Evite Agora'}
                                </div>
                                <button onClick={() => { setPrediction(null); setTargetAmount(''); }} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><X size={14} /></button>
                            </div>
                            <h4 className="text-xl font-black mb-1">{prediction.reasoning}</h4>
                            <p className="text-xs text-indigo-100/70 mb-4">{prediction.impact}</p>

                            <div className="p-4 bg-white/10 rounded-[1.5rem] border border-white/10 flex gap-3">
                                <Lightbulb size={24} className="text-amber-300 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Dica da Aura</p>
                                    <p className="text-[11px] font-medium leading-relaxed mt-1">{prediction.tip}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Summary Card */}
            <GlassCard className="mb-6 bg-white/40" padding="p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patrimônio Líquido</p>
                <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tighter tabular-nums">
                    R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h1>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <ArrowUpRight size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Ganhos</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 tabular-nums">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                        <div className="flex items-center gap-2 text-rose-600 mb-1">
                            <ArrowDownLeft size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Gastos</span>
                        </div>
                        <p className="text-lg font-black text-slate-800 tabular-nums">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </GlassCard>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex gap-2 p-1.5 bg-white/40 rounded-2xl backdrop-blur-md border border-white/40">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                        px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/40'}
                    `}
                        >
                            {f === 'all' ? 'Tudo' : f === 'income' ? 'Entradas' : 'Saídas'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
                    className={`w-12 h-12 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center ${isFormOpen ? 'bg-rose-500 text-white rotate-45' : 'bg-slate-900 text-white'}`}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Add/Edit Transaction Form */}
            {isFormOpen && (
                <div className="mb-6 animate-in slide-in-from-top-4 duration-500 px-1">
                    <GlassCard padding="p-6 border-slate-900/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase tracking-widest text-xs opacity-40">Novo Lançamento</h3>
                        </div>

                        <div className="flex gap-2 mb-4 p-1.5 bg-slate-50 rounded-2xl">
                            <button
                                onClick={() => setType('income')}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                Entrada
                            </button>
                            <button
                                onClick={() => setType('expense')}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                Saída
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-300 font-black text-sm">R$</span>
                                <input
                                    type="number"
                                    placeholder="Valor"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full p-4 pl-10 rounded-2xl bg-slate-50 font-black text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="O que foi isso? (ex: Aluguel)"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-slate-50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
                            />

                            {/* Account/Card Selection */}
                            <div className="flex gap-2">
                                <select
                                    value={selectedAccountId}
                                    onChange={e => { setSelectedAccountId(e.target.value); setSelectedCardId(''); }}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none"
                                    disabled={!!selectedCardId}
                                >
                                    <option value="">Sem Conta</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select
                                    value={selectedCardId}
                                    onChange={e => { setSelectedCardId(e.target.value); setSelectedAccountId(''); setType('expense'); }}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none"
                                    disabled={!!selectedAccountId || type === 'income'}
                                >
                                    <option value="">Sem Cartão</option>
                                    {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <button onClick={handleSave} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
                                <Save size={16} /> Salvar Lançamento
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 space-y-3 px-1">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-40">
                        <Wallet size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sem registros</p>
                    </div>
                ) : (
                    filteredTransactions.map((t) => (
                        <div key={t.id} className="group flex items-center justify-between p-5 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl hover:bg-white/70 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {t.type === 'income' ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-800 text-sm tracking-tight truncate">{t.description}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-black text-sm whitespace-nowrap tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </span>
                                <button onClick={() => setDeleteId(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>



            {/* Account Modal */}
            {
                isAccountModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <GlassCard className="w-full max-w-sm" padding="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800">Nova Conta</h3>
                                <button onClick={() => setIsAccountModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Nome da Conta (Nubank, Cofre...)" value={accName} onChange={e => setAccName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <select value={accType} onChange={e => setAccType(e.target.value as any)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none">
                                    <option value="checking">Conta Corrente</option>
                                    <option value="savings">Poupança</option>
                                    <option value="investment">Investimento</option>
                                    <option value="cash">Dinheiro Físico</option>
                                </select>
                                <input type="number" placeholder="Saldo Atual (R$)" value={accBalance} onChange={e => setAccBalance(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <button onClick={handleSaveAccount} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">Salvar Conta</button>
                            </div>
                        </GlassCard>
                    </div>
                )
            }

            {/* Card Modal */}
            {
                isCardModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <GlassCard className="w-full max-w-sm" padding="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800">Novo Cartão</h3>
                                <button onClick={() => setIsCardModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Nome do Cartão" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <input type="number" placeholder="Limite (R$)" value={cardLimit} onChange={e => setCardLimit(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Dia Fech." value={cardClosing} onChange={e => setCardClosing(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                    <input type="number" placeholder="Dia Venc." value={cardDue} onChange={e => setCardDue(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                </div>
                                <button onClick={handleSaveCard} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">Salvar Cartão</button>
                            </div>
                        </GlassCard>
                    </div>
                )
            }
        </div >
    );
};
