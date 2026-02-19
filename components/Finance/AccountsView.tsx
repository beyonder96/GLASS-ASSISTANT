import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../GlassCard';
import { Plus, Wallet, CreditCard as CardIcon, Trash2, Pencil, Building2, X } from 'lucide-react';
import { Account, CreditCard } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const AccountsView: React.FC = () => {
    const { accounts, addAccount, updateAccount, deleteAccount, creditCards, addCard, updateCard, deleteCard } = useData();
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    // Form States
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [accName, setAccName] = useState('');
    const [accType, setAccType] = useState<Account['type']>('checking');
    const [accBalance, setAccBalance] = useState('');
    const [accColor, setAccColor] = useState('bg-indigo-500');

    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [cardName, setCardName] = useState('');
    const [cardLimit, setCardLimit] = useState('');
    const [cardClosing, setCardClosing] = useState('');
    const [cardDue, setCardDue] = useState('');
    const [cardColor, setCardColor] = useState('bg-indigo-600');

    const COLORS = [
        'bg-indigo-500', 'bg-slate-800', 'bg-rose-500', 'bg-emerald-500',
        'bg-amber-500', 'bg-violet-600', 'bg-cyan-500', 'bg-blue-600'
    ];

    const handleSaveAccount = () => {
        if (!accName) return;
        const accountData: Account = {
            id: editingAccount ? editingAccount.id : uuidv4(),
            name: accName,
            type: accType,
            balance: parseFloat(accBalance) || 0,
            color: accColor
        };

        if (editingAccount) updateAccount(accountData);
        else addAccount(accountData);

        setIsAccountModalOpen(false);
        resetAccountForm();
    };

    const handleSaveCard = () => {
        if (!cardName) return;
        const cardData: CreditCard = {
            id: editingCard ? editingCard.id : uuidv4(),
            name: cardName,
            limit: parseFloat(cardLimit) || 0,
            closingDay: parseInt(cardClosing) || 1,
            dueDay: parseInt(cardDue) || 10,
            color: cardColor
        };

        if (editingCard) updateCard(cardData);
        else addCard(cardData);

        setIsCardModalOpen(false);
        resetCardForm();
    };

    const resetAccountForm = () => {
        setEditingAccount(null);
        setAccName('');
        setAccBalance('');
        setAccColor('bg-indigo-500');
    };

    const resetCardForm = () => {
        setEditingCard(null);
        setCardName('');
        setCardLimit('');
        setCardClosing('');
        setCardDue('');
        setCardColor('bg-indigo-600');
    };

    const openEditAccount = (acc: Account) => {
        setEditingAccount(acc);
        setAccName(acc.name);
        setAccType(acc.type);
        setAccBalance(acc.balance.toString());
        setAccColor(acc.color || 'bg-indigo-500');
        setIsAccountModalOpen(true);
    };

    const openEditCard = (card: CreditCard) => {
        setEditingCard(card);
        setCardName(card.name);
        setCardLimit(card.limit.toString());
        setCardClosing(card.closingDay.toString());
        setCardDue(card.dueDay.toString());
        setCardColor(card.color || 'bg-indigo-600');
        setIsCardModalOpen(true);
    };

    return (
        <div className="h-full overflow-y-auto pb-20 px-1">

            {/* Action Bar */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => { resetAccountForm(); setIsAccountModalOpen(true); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    + Conta
                </button>
                <button onClick={() => { resetCardForm(); setIsCardModalOpen(true); }} className="flex-1 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    + Cartão
                </button>
            </div>

            <div className="space-y-6">

                {/* Accounts List */}
                <div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Contas Bancárias</h3>
                    {accounts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Nenhuma conta cadastrada.</p>
                    ) : (
                        <div className="grid gap-3">
                            {accounts.map(acc => (
                                <div key={acc.id} className="group relative p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 flex justify-between items-center transition-all hover:bg-white/80">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${acc.color} flex items-center justify-center text-white shadow-md`}>
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{acc.name}</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400">{acc.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800">R$ {acc.balance.toFixed(2)}</p>
                                        <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditAccount(acc)} className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"><Pencil size={12} /></button>
                                            <button onClick={() => deleteAccount(acc.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cards List */}
                <div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Cartões de Crédito</h3>
                    {creditCards.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Nenhum cartão cadastrado.</p>
                    ) : (
                        <div className="grid gap-3">
                            {creditCards.map(card => (
                                <div key={card.id} className="group relative p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 flex justify-between items-center transition-all hover:bg-white/80">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-white shadow-md`}>
                                            <CardIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{card.name}</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400">Fecha dia {card.closingDay}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800">Limite: R$ {card.limit.toFixed(2)}</p>
                                        <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditCard(card)} className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"><Pencil size={12} /></button>
                                            <button onClick={() => deleteCard(card.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Account Modal */}
            {isAccountModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm" padding="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h3>
                            <button onClick={() => setIsAccountModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nome" value={accName} onChange={e => setAccName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold outline-none" />
                            <select value={accType} onChange={e => setAccType(e.target.value as any)} className="w-full p-3 rounded-xl bg-slate-50 font-bold outline-none">
                                <option value="checking">Conta Corrente</option>
                                <option value="savings">Poupança</option>
                                <option value="investment">Investimento</option>
                                <option value="cash">Dinheiro</option>
                            </select>
                            <input type="number" placeholder="Saldo Inicial" value={accBalance} onChange={e => setAccBalance(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold outline-none" />

                            <div className="flex flex-wrap gap-2 mt-2">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setAccColor(c)} className={`w-6 h-6 rounded-full ${c} ${accColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
                                ))}
                            </div>

                            <button onClick={handleSaveAccount} className="w-full py-3 mt-4 bg-indigo-600 text-white rounded-xl font-bold custom-shadow">Salvar</button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Card Modal */}
            {isCardModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-sm" padding="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</h3>
                            <button onClick={() => setIsCardModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nome" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold outline-none" />
                            <input type="number" placeholder="Limite" value={cardLimit} onChange={e => setCardLimit(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 font-bold outline-none" />
                            <div className="flex gap-2">
                                <input type="number" placeholder="Dia Fech." value={cardClosing} onChange={e => setCardClosing(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-50 font-bold outline-none" />
                                <input type="number" placeholder="Dia Venc." value={cardDue} onChange={e => setCardDue(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-50 font-bold outline-none" />
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setCardColor(c)} className={`w-6 h-6 rounded-full ${c} ${cardColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
                                ))}
                            </div>

                            <button onClick={handleSaveCard} className="w-full py-3 mt-4 bg-slate-800 text-white rounded-xl font-bold custom-shadow">Salvar</button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
