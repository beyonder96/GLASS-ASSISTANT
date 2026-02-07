
import React, { useState, useMemo, useEffect } from 'react';
import { evaluate } from 'mathjs';
import {
    ChevronLeft, Plus, Trash2, ShoppingCart, ShoppingBag,
    Check, Trash, Store, Calculator, Scale, Hash,
    DollarSign, FileText, X, Minus, History, Save
} from 'lucide-react';
import { ShoppingItem, CartItem } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';

interface ShoppingScreenProps {
    onBack: () => void;
}

export const ShoppingScreen: React.FC<ShoppingScreenProps> = ({ onBack }) => {
    const { shoppingList: listItems, setShoppingList: setListItems } = useData();
    const [viewMode, setViewMode] = useState<'list' | 'market'>('list');

    // Lista de Planejamento
    const [newItemName, setNewItemName] = useState('');

    // Modo Mercado (Carrinho)
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartName, setCartName] = useState('');
    const [cartQty, setCartQty] = useState<string>('1');
    const [cartPrice, setCartPrice] = useState<string>('');
    const [cartType, setCartType] = useState<'un' | 'kg'>('un');

    // Calculadora Simples
    const [showCalc, setShowCalc] = useState(false);
    const [calcDisplay, setCalcDisplay] = useState('0');

    const totalCart = useMemo(() => cart.reduce((acc, item) => acc + item.total, 0), [cart]);

    // Lógica de Planejamento
    const handleAddToList = () => {
        if (!newItemName.trim()) return;
        const item: ShoppingItem = { id: Date.now().toString(), name: newItemName, completed: false };
        setListItems(prev => [item, ...prev]);
        setNewItemName('');
    };

    const toggleListItem = (id: string) => {
        setListItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
    };

    // Lógica de Mercado
    const addToCart = () => {
        if (!cartName.trim() || !cartQty || !cartPrice) return;

        const qty = parseFloat(cartQty.replace(',', '.'));
        const price = parseFloat(cartPrice.replace(',', '.'));

        const newItem: CartItem = {
            id: Date.now().toString(),
            name: cartName,
            quantity: qty,
            unitPrice: price,
            unitType: cartType,
            total: qty * price
        };

        setCart(prev => [newItem, ...prev]);

        // Reset Form
        setCartName('');
        setCartPrice('');
        setCartQty('1');
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => {
        if (window.confirm("Deseja limpar todo o carrinho atual?")) setCart([]);
    };

    const handleExportPDF = () => {
        if (cart.length === 0) return;

        const date = new Date().toLocaleDateString('pt-BR');
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const content = `
      <html>
        <head>
          <title>Resumo de Compra - Glass</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            h1 { color: #0f172a; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; border-bottom: 2px solid #e2e8f0; padding: 10px; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total-row { font-weight: bold; background: #f8fafc; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #cbd5e1; }
          </style>
        </head>
        <body>
          <h1>Resumo de Compra</h1>
          <div class="meta">Gerado pelo App Glass em ${date} às ${time}</div>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd/Peso</th>
                <th>Vlr Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}${item.unitType}</td>
                  <td>R$ ${item.unitPrice.toFixed(2)}</td>
                  <td>R$ ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">VALOR TOTAL:</td>
                <td>R$ ${totalCart.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">Glass Assistant - Inteligência em sua rotina</div>
        </body>
      </html>
    `;

        const win = window.open('', '_blank');
        win?.document.write(content);
        win?.document.close();
        win?.print();
    };

    // Lógica Calculadora
    const appendCalc = (val: string) => {
        setCalcDisplay(prev => prev === '0' ? val : prev + val);
    };
    const clearCalc = () => setCalcDisplay('0');
    const execCalc = () => {
        try {
            // Usando mathjs para avaliação segura
            const expression = calcDisplay.replace('x', '*').replace(',', '.');
            const result = evaluate(expression);
            setCalcDisplay(String(result).replace('.', ','));
        } catch {
            setCalcDisplay('Erro');
        }
    };

    return (
        <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 pb-20">

            {/* Header com Toggle de Modos */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                            {viewMode === 'list' ? 'Mercado' : 'Modo Compras'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {viewMode === 'list' ? 'Planejamento' : 'No Estabelecimento'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'market' : 'list')}
                        className={`p-3 rounded-2xl transition-all shadow-md active:scale-90 ${viewMode === 'market' ? 'bg-amber-500 text-white' : 'bg-white/40 text-slate-600'}`}
                        title={viewMode === 'list' ? 'Ir para o Mercado' : 'Ver Lista'}
                    >
                        {viewMode === 'list' ? <Store size={20} /> : <History size={20} />}
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                // --- VIEW: LISTA DE PLANEJAMENTO ---
                <div className="flex flex-col flex-1 animate-in fade-in duration-300">
                    <GlassCard className="mb-6 bg-gradient-to-br from-amber-50 to-white/40" padding="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-3xl font-black text-amber-600">{listItems.filter(i => !i.completed).length}</p>
                                <p className="text-xs font-bold text-amber-800/60 uppercase tracking-wider">Itens Faltando</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                                <ShoppingBag size={24} />
                            </div>
                        </div>
                    </GlassCard>

                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddToList()}
                            placeholder="O que falta na dispensa?"
                            className="flex-1 h-12 px-5 rounded-2xl bg-white/40 border border-white/40 focus:bg-white/60 outline-none text-slate-800 font-bold"
                        />
                        <button onClick={handleAddToList} className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {listItems.length === 0 ? (
                            <div className="py-20 text-center opacity-30"><ShoppingBag size={48} className="mx-auto mb-2" /><p className="text-xs font-black uppercase">Tudo estocado</p></div>
                        ) : (
                            listItems.map(item => (
                                <div key={item.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.completed ? 'bg-emerald-50/50 border-emerald-100 opacity-60' : 'bg-white/40 border-white/50'}`}>
                                    <button onClick={() => toggleListItem(item.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                        <Check size={14} strokeWidth={4} />
                                    </button>
                                    <span className={`flex-1 font-bold text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.name}</span>
                                    <button onClick={() => setListItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => setViewMode('market')}
                        className="mt-4 w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                    >
                        <Store size={14} /> Começar Compras Agora
                    </button>
                </div>
            ) : (
                // --- VIEW: MODO MERCADO ---
                <div className="flex flex-col flex-1 animate-in fade-in duration-300 relative">

                    {/* Calculadora Flutuante */}
                    {showCalc && (
                        <div className="absolute top-20 right-0 z-[100] w-64 animate-in zoom-in-95 slide-in-from-right-4 duration-300">
                            <GlassCard className="bg-slate-900/90 text-white shadow-2xl border-white/10" padding="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auxiliar</span>
                                    <button onClick={() => setShowCalc(false)}><X size={16} /></button>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl mb-3 text-right text-xl font-black tabular-nums">{calcDisplay}</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {['7', '8', '9', '/', '4', '5', '6', 'x', '1', '2', '3', '-', '0', ',', 'C', '+'].map(btn => (
                                        <button
                                            key={btn}
                                            onClick={() => btn === 'C' ? clearCalc() : appendCalc(btn)}
                                            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold"
                                        >{btn}</button>
                                    ))}
                                    <button onClick={execCalc} className="col-span-4 p-3 bg-indigo-500 rounded-lg font-black">=</button>
                                </div>
                            </GlassCard>
                        </div>
                    )}

                    {/* Totalizador Sticky */}
                    <GlassCard className="mb-6 bg-slate-900 text-white border-none shadow-xl" padding="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrinho Atual</p>
                                <h3 className="text-4xl font-black tabular-nums tracking-tighter">
                                    R$ {totalCart.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCalc(!showCalc)}
                                className={`p-4 rounded-2xl transition-all ${showCalc ? 'bg-indigo-500 shadow-lg' : 'bg-white/10'}`}
                            >
                                <Calculator size={24} />
                            </button>
                        </div>
                    </GlassCard>

                    {/* Formulário de Inserção Rápida */}
                    <GlassCard className="mb-6 border-white/60 bg-white/50" padding="p-4">
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={cartName}
                                onChange={e => setCartName(e.target.value)}
                                placeholder="Nome do produto..."
                                className="w-full p-3 bg-white/60 border border-white/80 rounded-xl font-bold text-slate-800 outline-none"
                            />

                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={cartQty}
                                        onChange={e => setCartQty(e.target.value)}
                                        placeholder="Qtd/Kg"
                                        className="w-full p-3 pl-10 bg-white/60 border border-white/80 rounded-xl font-bold text-slate-800 outline-none"
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        {cartType === 'un' ? <Hash size={16} /> : <Scale size={16} />}
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={cartPrice}
                                        onChange={e => setCartPrice(e.target.value)}
                                        placeholder="Vlr Unitário"
                                        className="w-full p-3 pl-10 bg-white/60 border border-white/80 rounded-xl font-bold text-slate-800 outline-none"
                                    />
                                    <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCartType('un')}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${cartType === 'un' ? 'bg-slate-800 text-white' : 'bg-white/40 text-slate-400'}`}
                                >Unidade</button>
                                <button
                                    onClick={() => setCartType('kg')}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${cartType === 'kg' ? 'bg-slate-800 text-white' : 'bg-white/40 text-slate-400'}`}
                                >Quilograma</button>
                            </div>

                            <button
                                onClick={addToCart}
                                disabled={!cartName || !cartPrice}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </GlassCard>

                    {/* Listagem do Carrinho */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {cart.length === 0 ? (
                            <div className="py-12 text-center opacity-30 text-slate-400">
                                <ShoppingCart size={40} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Carrinho Vazio</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white/40 border border-white/50 rounded-2xl group animate-in slide-in-from-left duration-300">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.unitType === 'kg' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                            <p className="font-bold text-slate-800 truncate">{item.name}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                                            {item.quantity}{item.unitType} x R$ {item.unitPrice.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-slate-800 tabular-nums">R$ {item.total.toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Ações de Rodapé */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={clearCart}
                            className="flex-1 py-4 bg-white/40 border border-white/60 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Trash size={14} /> Limpar
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={cart.length === 0}
                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save size={14} /> Salvar Compras
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
