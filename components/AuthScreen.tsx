
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Zap, ShieldCheck, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
    onLogin: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        },
                    },
                });
                if (error) throw error;
                if (data.user) {
                    // Auto login after signup? Or just notify?
                    // Supabase usually requires email confirmation by default, but for development we might want to check.
                    // If no confirmation required, we can login.
                    // For now let's assume successful signup and try to login or notify.
                    alert('Conta criada! Verifique seu email ou faça login.');
                    setIsSignUp(false);
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    onLogin(data.user);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animado */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#E0EAFC] via-[#CFDEF3] to-[#F3E7E9] animate-gradient-x">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <GlassCard className="text-center relative overflow-hidden" padding="p-8 py-10">

                    {/* Logo Area */}
                    <div className="mb-8 relative">
                        <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-400/50 mb-4 relative z-10">
                            <Zap size={32} fill="currentColor" className="animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Glass.</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {isSignUp ? 'Criar Nova Conta' : 'Bem-vindo de Volta'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-4 text-left">
                        {isSignUp && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full pl-11 p-3.5 rounded-xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full pl-11 p-3.5 rounded-xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    className="w-full pl-11 p-3.5 rounded-xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 group relative flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-900 text-white transition-all duration-300 shadow-xl shadow-slate-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span className="font-bold tracking-wide uppercase">{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 pt-6 border-t border-slate-200/50">
                        <p className="text-xs text-slate-500 font-medium">
                            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all"
                            >
                                {isSignUp ? 'Fazer Login' : 'Criar agora'}
                            </button>
                        </p>
                    </div>

                    {/* Footer info */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider opacity-60">
                        <ShieldCheck size={12} />
                        <span>Ambiente Seguro & Privado • v1.0</span>
                    </div>

                </GlassCard>
            </div>
        </div>
    );
};
