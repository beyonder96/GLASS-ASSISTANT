
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X, CheckCircle2, DollarSign, Calendar, ShoppingCart, Check, Info } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'success' | 'info' | 'finance' | 'shopping';
  read: boolean;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { tasks, transactions, shoppingList, profileImage, setProfileImage } = useData();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Sistema de Notificações Reativo
  useEffect(() => {
    const notes: Notification[] = [];

    // 1. Scanner de Tarefas
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length > 0) {
      notes.push({
        id: 'note-tasks',
        title: 'Produtividade',
        message: `Você tem ${pendingTasks.length} tarefas pendentes para hoje.`,
        time: 'Agora',
        type: 'info',
        read: false
      });
    }

    // 2. Scanner de Finanças
    if (transactions.length > 0) {
      const lastTx = transactions[0];
      notes.push({
        id: 'note-finance',
        title: 'Última Transação',
        message: `${lastTx.description}: R$ ${lastTx.amount.toFixed(2)} registrado.`,
        time: 'Recente',
        type: 'finance',
        read: false
      });
    }

    // 3. Scanner de Compras
    const pendingShopping = shoppingList.filter(s => !s.completed);
    if (pendingShopping.length > 0) {
      notes.push({
        id: 'note-shopping',
        title: 'Lista de Mercado',
        message: `Lembrete: ${pendingShopping.length} itens faltam no carrinho.`,
        time: 'Lembrete',
        type: 'shopping',
        read: false
      });
    }

    setNotifications(notes);
  }, [tasks, transactions, shoppingList]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'finance': return <DollarSign size={16} className="text-emerald-500" />;
      case 'shopping': return <ShoppingCart size={16} className="text-amber-500" />;
      case 'success': return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'info': return <Calendar size={16} className="text-indigo-500" />;
      default: return <Info size={16} className="text-slate-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="flex justify-between items-center w-full py-4 px-2 relative z-50">
      <button
        onClick={onMenuClick}
        className="p-3 rounded-full bg-white/20 backdrop-blur-md text-slate-700 hover:bg-white/40 transition-all active:scale-90"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isOpen ? 'bg-white/60 text-slate-900 shadow-lg' : 'bg-white/20 text-slate-700 hover:bg-white/40'}`}
          >
            <Bell size={20} />
          </button>

          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white/50 animate-pulse shadow-sm"></span>
          )}

          {isOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-slate-200/50 bg-white/30">
                  <div>
                    <h3 className="font-bold text-slate-800">Notificações</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{unreadCount} novas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      Limpar
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full bg-slate-100/50 text-slate-500 hover:text-slate-800">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-widest">Tudo limpo! ✨</p>
                    </div>
                  ) : notifications.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => markAsRead(note.id)}
                      className={`
                        flex gap-3 p-4 rounded-2xl transition-all duration-300 cursor-pointer group relative
                        ${note.read ? 'opacity-50' : 'bg-white/60 shadow-sm border border-white/60 hover:bg-white/80'}
                      `}
                    >
                      <div className="mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm ring-1 ring-black/5">
                        {getIcon(note.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-slate-900">{note.title}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{note.time}</span>
                        </div>
                        <p className="text-xs mt-1 text-slate-700 leading-snug">{note.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer relative group flex items-center justify-center bg-white/20"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400"><CheckCircle2 size={24} /></div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-[8px] font-bold uppercase">Alterar</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
};
