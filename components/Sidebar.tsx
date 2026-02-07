
import React, { useState } from 'react';
import {
  X, LogOut, Zap, ChevronDown, ShieldCheck,
  Wallet, ShoppingCart, CheckSquare, PawPrint,
  Database, Settings, Trash2, Building2
} from 'lucide-react';
import { PersonaId, VoiceId } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;

  onNavigate: (view: 'dashboard' | 'finance' | 'tasks' | 'shopping' | 'pets' | 'ape') => void;
  onLogout: () => void;
  userMode: 'google' | 'guest' | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onLogout, userMode }) => {
  const [isDataExpanded, setIsDataExpanded] = useState(false);

  const handleNavigation = (view: 'dashboard' | 'finance' | 'tasks' | 'shopping' | 'pets' | 'ape') => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`
        fixed top-4 bottom-4 left-4 w-[280px] z-[70] 
        bg-white/40 backdrop-blur-[35px] border border-white/50 
        shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.8rem] 
        transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-[115%]'}
      `}>

        <div className="p-8 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1e293b] flex items-center justify-center text-white shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-[#1e293b] tracking-tight text-2xl">Glass.</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-white/40 transition-colors"
          >
            <X size={24} />
          </button>
        </div>



        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">

          <button onClick={() => handleNavigation('finance')} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-[0.97] group">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[#D1FAE5] text-[#10B981] flex items-center justify-center shadow-sm">
              <Wallet size={22} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1e293b]">Finanças</p>
              <p className="text-[11px] font-medium text-[#94a3b8]">Nosso futuro</p>
            </div>
          </button>

          <button onClick={() => handleNavigation('ape')} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-[0.97] group">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[#CFFAFE] text-[#0891B2] flex items-center justify-center shadow-sm">
              <Building2 size={22} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1e293b]">Meu Apê</p>
              <p className="text-[11px] font-medium text-[#94a3b8]">Construção</p>
            </div>
          </button>

          <button onClick={() => handleNavigation('tasks')} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-[0.97] group">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[#E0E7FF] text-[#6366F1] flex items-center justify-center shadow-sm">
              <CheckSquare size={22} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1e293b]">Tarefas</p>
              <p className="text-[11px] font-medium text-[#94a3b8]">Sua produtividade</p>
            </div>
          </button>

          <button onClick={() => handleNavigation('shopping')} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-[0.97] group">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-sm">
              <ShoppingCart size={22} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1e293b]">Mercado</p>
              <p className="text-[11px] font-medium text-[#94a3b8]">O que falta</p>
            </div>
          </button>

          <button onClick={() => handleNavigation('pets')} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all active:scale-[0.97] group">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[#F3E8FF] text-[#A855F7] flex items-center justify-center shadow-sm">
              <PawPrint size={22} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1e293b]">Pets</p>
              <p className="text-[11px] font-medium text-[#94a3b8]">Nossos amores</p>
            </div>
          </button>

        </nav>

        <div className="px-4 pb-8 space-y-4">
          <div className="h-px bg-slate-200/50 mx-4 mb-4" />

          <div className="relative">
            <button
              onClick={() => setIsDataExpanded(!isDataExpanded)}
              className={`
                    w-full flex items-center justify-between p-3 rounded-[1.8rem] 
                    bg-white/60 border border-white/60 transition-all duration-300
                    ${isDataExpanded ? 'bg-white/80 shadow-md' : 'hover:bg-white/70'}
                `}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[1.1rem] bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                  <Database size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-[#1e293b]">Dados</p>
                  <p className="text-[11px] font-medium text-[#94a3b8]">Backup & Reset</p>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform duration-500 ${isDataExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            <div className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${isDataExpanded ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}
              `}>
              <div className="p-2 space-y-1 bg-white/30 rounded-2xl border border-white/40">

                <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50 text-rose-500 text-xs font-bold transition-all">
                  <Trash2 size={14} /> Resetar App
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-[1.8rem] bg-rose-500/10 text-rose-600 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm mt-2"
          >
            Sair da conta <LogOut size={18} />
          </button>
        </div>

      </div>
    </>
  );
};
