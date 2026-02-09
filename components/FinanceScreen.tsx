import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Filter, Trash2, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, Pencil, X, Save, AlertCircle, Sparkles, Loader2, BrainCircuit, Target, Lightbulb, CreditCard as CardIcon, Building2 } from 'lucide-react';
import { Transaction, Account, CreditCard, Budget } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';


interface FinanceScreenProps {
    onBack: () => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({ onBack }) => {
    const { transactions, setTransactions, accounts, setAccounts, creditCards, setCreditCards, budgets, setBudgets, user } = useData();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingCardStatement, setViewingCardStatement] = useState<string | null>(null);

    // Account/Card Modal States
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    // Form States for Account/Card/Budget
    const [accName, setAccName] = useState('');
    const [accType, setAccType] = useState<Account['type']>('checking');
    const [accBalance, setAccBalance] = useState('');

    const [cardName, setCardName] = useState('');
    const [cardLimit, setCardLimit] = useState('');
    const [cardClosing, setCardClosing] = useState('');
    const [cardDue, setCardDue] = useState('');

    const [budgetName, setBudgetName] = useState('');
    const [budgetAmount, setBudgetAmount] = useState('');

    // Form states for Transaction
    const [editingId, setEditingId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [destinationAccountId, setDestinationAccountId] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Outros');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<'transaction' | 'account' | 'card' | 'budget'>('transaction');

    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);

    const [accColor, setAccColor] = useState('bg-indigo-500');
    const [cardColor, setCardColor] = useState('bg-indigo-600');

    const COLORS = [
        'bg-indigo-500', 'bg-slate-800', 'bg-rose-500', 'bg-emerald-500',
        'bg-amber-500', 'bg-violet-600', 'bg-cyan-500', 'bg-blue-600'
    ];

    const CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros'];

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

        if (editingAccountId) {
            setAccounts(accounts.map(a => a.id === editingAccountId ? {
                ...a, name: accName, type: accType, balance: parseFloat(accBalance) || 0, color: accColor
            } : a));
            setEditingAccountId(null);
        } else {
            const newAcc: Account = {
                id: Date.now().toString(),
                name: accName,
                type: accType,
                balance: parseFloat(accBalance) || 0,
                color: accColor
            };
            setAccounts([...accounts, newAcc]);
        }
        setIsAccountModalOpen(false);
        setAccName(''); setAccBalance(''); setAccColor('bg-indigo-500');
    };

    const handleEditAccount = (acc: Account) => {
        setEditingAccountId(acc.id);
        setAccName(acc.name);
        setAccType(acc.type);
        setAccBalance(acc.balance.toString());
        setAccColor(acc.color || 'bg-indigo-500');
        setIsAccountModalOpen(true);
    };

    const handleSaveCard = () => {
        if (!cardName) return;

        if (editingCardId) {
            setCreditCards(creditCards.map(c => c.id === editingCardId ? {
                ...c, name: cardName, limit: parseFloat(cardLimit) || 0, closingDay: parseInt(cardClosing) || 1, dueDay: parseInt(cardDue) || 10, color: cardColor
            } : c));
            setEditingCardId(null);
        } else {
            const newCard: CreditCard = {
                id: Date.now().toString(),
                name: cardName,
                limit: parseFloat(cardLimit) || 0,
                closingDay: parseInt(cardClosing) || 1,
                dueDay: parseInt(cardDue) || 10,
                color: cardColor
            };
            setCreditCards([...creditCards, newCard]);
        }
        setIsCardModalOpen(false);
        setCardName(''); setCardLimit(''); setCardClosing(''); setCardDue(''); setCardColor('bg-indigo-600');
    };

    const handleEditCard = (card: CreditCard) => {
        setEditingCardId(card.id);
        setCardName(card.name);
        setCardLimit(card.limit.toString());
        setCardClosing(card.closingDay.toString());
        setCardDue(card.dueDay.toString());
        setCardColor(card.color || 'bg-indigo-600');
        setIsCardModalOpen(true);
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

    const handleEditTransaction = (tx: Transaction) => {
        setEditingId(tx.id);
        setAmount(tx.amount.toString());
        setDesc(tx.description);
        setType(tx.type);
        setSelectedAccountId(tx.accountId || '');
        setSelectedCardId(tx.cardId || '');
        setDestinationAccountId(tx.destinationAccountId || '');
        setSelectedCategory(tx.category || 'Outros');
        setIsRecurring(!!tx.recurrence);
        setRecurrenceFreq(tx.recurrence?.frequency || 'monthly');
        setIsFormOpen(true);
    };

    const handleSave = () => {
        if (!amount || !desc) return;

        const txAmount = parseFloat(amount);

        if (editingId) {
            const oldTx = transactions.find(t => t.id === editingId);

            // Update Transactions
            setTransactions(transactions.map(t => t.id === editingId ? {
                ...t, type, amount: txAmount, description: desc,
                accountId: selectedAccountId || undefined,
                cardId: selectedCardId || undefined,
                destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
                category: selectedCategory,
                recurrence: isRecurring ? { frequency: recurrenceFreq, status: 'active' } : undefined
            } : t));

            // Adjust Balances (Reverse old, Apply new)
            if (oldTx) {
                let updatedAccounts = [...accounts];

                // 1. Reverse old transaction effect
                if (oldTx.type === 'transfer') {
                    if (oldTx.accountId) {
                        updatedAccounts = updatedAccounts.map(a => a.id === oldTx.accountId ? { ...a, balance: a.balance + oldTx.amount } : a);
                    }
                    if (oldTx.destinationAccountId) {
                        updatedAccounts = updatedAccounts.map(a => a.id === oldTx.destinationAccountId ? { ...a, balance: a.balance - oldTx.amount } : a);
                    }
                } else if (oldTx.accountId) {
                    updatedAccounts = updatedAccounts.map(a =>
                        a.id === oldTx.accountId
                            ? { ...a, balance: oldTx.type === 'income' ? a.balance - oldTx.amount : a.balance + oldTx.amount }
                            : a
                    );
                }

                // 2. Apply new transaction effect
                if (type === 'transfer') {
                    if (selectedAccountId) {
                        updatedAccounts = updatedAccounts.map(a => a.id === selectedAccountId ? { ...a, balance: a.balance - txAmount } : a);
                    }
                    if (destinationAccountId) {
                        updatedAccounts = updatedAccounts.map(a => a.id === destinationAccountId ? { ...a, balance: a.balance + txAmount } : a);
                    }
                } else if (selectedAccountId) {
                    updatedAccounts = updatedAccounts.map(a =>
                        a.id === selectedAccountId
                            ? { ...a, balance: type === 'income' ? a.balance + txAmount : a.balance - txAmount }
                            : a
                    );
                }

                setAccounts(updatedAccounts);
            }
            setEditingId(null);
        } else {
            const newTx: Transaction = {
                id: Date.now().toString(),
                type: type,
                amount: txAmount,
                description: desc,
                date: new Date().toISOString(),
                accountId: selectedAccountId || undefined,
                cardId: selectedCardId || undefined,
                destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
                category: selectedCategory,
                recurrence: isRecurring ? { frequency: recurrenceFreq, status: 'active' } : undefined
            };
            setTransactions([newTx, ...transactions]);

            // Update Account Balance if linked
            if (type === 'transfer') {
                setAccounts(accounts.map(a => {
                    if (a.id === selectedAccountId) return { ...a, balance: a.balance - txAmount };
                    if (a.id === destinationAccountId) return { ...a, balance: a.balance + txAmount };
                    return a;
                }));
            } else if (selectedAccountId) {
                setAccounts(accounts.map(a => {
                    if (a.id === selectedAccountId) {
                        return { ...a, balance: type === 'income' ? a.balance + txAmount : a.balance - txAmount };
                    }
                    return a;
                }));
            }
        }

        // Update Budget spent amount
        if (type === 'expense') {
            setBudgets(budgets.map(b => b.category === selectedCategory ? { ...b, spent: b.spent + txAmount } : b));
        }

        resetForm();
    };

    const handleSaveBudget = () => {
        if (!budgetName || !budgetAmount) return;
        const newBudget: Budget = {
            id: Date.now().toString(),
            category: budgetName,
            amount: parseFloat(budgetAmount),
            spent: transactions.filter(t => t.type === 'expense' && t.category === budgetName).reduce((acc, curr) => acc + curr.amount, 0)
        };
        setBudgets([...budgets, newBudget]);
        setIsBudgetModalOpen(false);
        setBudgetName(''); setBudgetAmount('');
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setAmount('');
        setDesc('');
        setType('expense');
        setSelectedAccountId('');
        setSelectedCardId('');
        setDestinationAccountId('');
        setSelectedCategory('Outros');
        setIsRecurring(false);
    };

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
                            <h3 className="text-lg font-bold text-slate-800">
                                {deleteType === 'account' ? 'Excluir Conta?' : deleteType === 'card' ? 'Excluir Cartão?' : 'Excluir Lançamento?'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold">Não</button>
                            <button
                                onClick={() => {
                                    if (deleteType === 'transaction') setTransactions(transactions.filter(t => t.id !== deleteId));
                                    else if (deleteType === 'account') setAccounts(accounts.filter(a => a.id !== deleteId));
                                    else if (deleteType === 'card') setCreditCards(creditCards.filter(c => c.id !== deleteId));
                                    setDeleteId(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200"
                            >Sim</button>
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
                        <div key={acc.id} className={`min-w-[220px] p-5 rounded-2xl ${acc.color || 'bg-slate-900'} text-white shadow-lg relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Building2 size={60} /></div>

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditAccount(acc)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Pencil size={12} /></button>
                                <button onClick={() => { setDeleteId(acc.id); setDeleteType('account'); }} className="p-1.5 bg-rose-500/20 rounded-lg hover:bg-rose-500/40 transition-all"><Trash2 size={12} /></button>
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{acc.type}</p>
                            <p className="font-bold text-lg mb-4">{acc.name}</p>
                            <p className="text-2xl font-black tracking-tight">R$ {acc.balance.toFixed(2)}</p>
                        </div>
                    ))}

                    {creditCards.map(card => (
                        <div key={card.id} className={`min-w-[220px] p-5 rounded-2xl ${card.color || 'bg-indigo-600'} text-white shadow-lg relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><CardIcon size={60} /></div>

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setViewingCardStatement(card.id)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all" title="Ver Fatura"><Building2 size={12} /></button>
                                <button onClick={() => handleEditCard(card)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Pencil size={12} /></button>
                                <button onClick={() => { setDeleteId(card.id); setDeleteType('card'); }} className="p-1.5 bg-rose-500/20 rounded-lg hover:bg-rose-500/40 transition-all"><Trash2 size={12} /></button>
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Cartão de Crédito</p>
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

            {/* Budgets Section */}
            <div className="mb-6 px-1">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Meus Orçamentos</h3>
                    <button onClick={() => setIsBudgetModalOpen(true)} className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">+ ORÇAMENTO</button>
                </div>
                {budgets.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/30 border border-dashed border-slate-300 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sem orçamentos definidos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {budgets.map(b => (
                            <div key={b.id} className="p-4 bg-white/50 rounded-2xl border border-white/60">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-black text-slate-700 uppercase">{b.category}</span>
                                    <span className="text-[10px] font-bold text-slate-500">R$ {b.spent} / {b.amount}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${(b.spent / b.amount) > 0.9 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(100, (b.spent / b.amount) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                    {(['all', 'income', 'expense', 'transfer'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                        px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/40'}
                    `}
                        >
                            {f === 'all' ? 'Tudo' : f === 'income' ? 'Entradas' : f === 'expense' ? 'Saídas' : 'Transf.'}
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
                            <button
                                onClick={() => { setType('transfer'); setSelectedCardId(''); }}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                Transf.
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

                            {/* Category & Destination selection */}
                            <div className="flex gap-2">
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                {type === 'transfer' && (
                                    <select
                                        value={destinationAccountId}
                                        onChange={e => setDestinationAccountId(e.target.value)}
                                        className="flex-1 p-3 rounded-xl bg-emerald-50 border border-emerald-100 font-bold text-xs outline-none"
                                    >
                                        <option value="">Para Conta...</option>
                                        {accounts.filter(a => a.id !== selectedAccountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Account/Card Selection */}
                            <div className="flex gap-2">
                                <select
                                    value={selectedAccountId}
                                    onChange={e => { setSelectedAccountId(e.target.value); setSelectedCardId(''); }}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none"
                                    disabled={!!selectedCardId}
                                >
                                    <option value="">{type === 'transfer' ? 'De Conta...' : 'Sem Conta'}</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select
                                    value={selectedCardId}
                                    onChange={e => { setSelectedCardId(e.target.value); setSelectedAccountId(''); setType('expense'); }}
                                    className="flex-1 p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none"
                                    disabled={!!selectedAccountId || type === 'income' || type === 'transfer'}
                                >
                                    <option value="">Sem Cartão</option>
                                    {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Recurring selection */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recorrente</span>
                                </label>
                                {isRecurring && (
                                    <select value={recurrenceFreq} onChange={e => setRecurrenceFreq(e.target.value as any)} className="bg-transparent font-bold text-[10px] uppercase outline-none text-indigo-600">
                                        <option value="daily">Diário</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensal</option>
                                    </select>
                                )}
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
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditTransaction(t)} className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"><Pencil size={16} /></button>
                                    <button onClick={() => { setDeleteId(t.id); setDeleteType('transaction'); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
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
                                <h3 className="font-bold text-slate-800">{editingAccountId ? 'Editar Conta' : 'Nova Conta'}</h3>
                                <button onClick={() => { setIsAccountModalOpen(false); setEditingAccountId(null); }}><X size={20} className="text-slate-400" /></button>
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

                                <div className="py-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cor da Conta</p>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setAccColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${c} ${accColor === c ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSaveAccount} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">
                                    {editingAccountId ? 'Atualizar Conta' : 'Salvar Conta'}
                                </button>
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
                                <h3 className="font-bold text-slate-800">{editingCardId ? 'Editar Cartão' : 'Novo Cartão'}</h3>
                                <button onClick={() => { setIsCardModalOpen(false); setEditingCardId(null); }}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Nome do Cartão" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <input type="number" placeholder="Limite (R$)" value={cardLimit} onChange={e => setCardLimit(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Dia Fech." value={cardClosing} onChange={e => setCardClosing(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                    <input type="number" placeholder="Dia Venc." value={cardDue} onChange={e => setCardDue(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none" />
                                </div>

                                <div className="py-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cor do Cartão</p>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCardColor(c)}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${c} ${cardColor === c ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSaveCard} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">
                                    {editingCardId ? 'Atualizar Cartão' : 'Salvar Cartão'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                )
            }
            {/* Budget Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm" padding="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 tracking-tight uppercase tracking-widest text-xs opacity-40">Novo Orçamento</h3>
                            <button onClick={() => setIsBudgetModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <select value={budgetName} onChange={e => setBudgetName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none">
                                <option value="">Selecione Categoria...</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="number" placeholder="Limite Mensal (R$)" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold text-xs outline-none" />
                            <button onClick={handleSaveBudget} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Criar Orçamento</button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Card Statement Modal */}
            {viewingCardStatement && (
                <div className="fixed inset-0 z-[150] flex flex-col p-6 bg-slate-50 animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fatura Atual</p>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{creditCards.find(c => c.id === viewingCardStatement)?.name}</h2>
                        </div>
                        <button onClick={() => setViewingCardStatement(null)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800"><X size={24} /></button>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl mb-8">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total da Fatura</p>
                        <h1 className="text-4xl font-black tracking-tighter tabular-nums">
                            R$ {transactions.filter(t => t.cardId === viewingCardStatement).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h1>
                        <div className="mt-6 flex gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="opacity-60">Vence dia {creditCards.find(c => c.id === viewingCardStatement)?.dueDay}</div>
                            <div className="w-[1px] bg-white/10" />
                            <div className="opacity-60">Limite Disp: R$ {(creditCards.find(c => c.id === viewingCardStatement)?.limit || 0) - transactions.filter(t => t.cardId === viewingCardStatement).reduce((acc, curr) => acc + curr.amount, 0)}</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lançamentos no Cartão</h4>
                        {transactions.filter(t => t.cardId === viewingCardStatement).map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div>
                                    <p className="font-black text-slate-800 text-sm">{t.description}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <span className="font-black text-sm text-slate-800">R$ {t.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
