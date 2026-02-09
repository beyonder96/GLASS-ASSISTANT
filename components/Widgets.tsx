
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Sun, Building2, Pencil, Search, Loader2, CalendarDays, CloudRain, CloudSun, Coffee, Utensils, TreePine, Navigation, Music, Play, Pause, ExternalLink, Eye, EyeOff, Circle, CheckCircle2, Cloud, Thermometer, MapPin, Sparkles, Send, X, Clock, Zap, Moon, ShoppingCart, Heart, Headphones, Wind, Flame, ZapOff } from 'lucide-react';
import { Transaction, Task, MusicTrack } from '../types';
import { useData, WeatherState } from '../contexts/DataContext';

export const WeatherWidget: React.FC = () => {
    const { setCurrentWeather } = useData();
    const [localWeather, setLocalWeather] = useState({ temp: '--', condition: '...', location: 'Localizando...', loading: true });

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                // 1. Get Weather
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
                const weatherData = await weatherRes.json();

                // 2. Get Location Name (Reverse Geocoding)
                const locationRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const locationData = await locationRes.json();
                const addr = locationData.address || {};
                const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.neighbourhood || 'Local Desconhecido';

                if (weatherData.current_weather) {
                    const temp = Math.round(weatherData.current_weather.temperature);
                    const code = weatherData.current_weather.weathercode;
                    const hour = new Date().getHours();

                    let cond = 'Limpo';
                    let state: WeatherState = 'sunny';

                    // Night check
                    if (hour < 5 || hour > 18) state = 'night';

                    // Weather Codes
                    if (code >= 95) { cond = 'Tempestade'; state = 'rainy'; }
                    else if (code >= 51 && code <= 67) { cond = 'Chuva'; state = 'rainy'; }
                    else if (code >= 1 && code <= 3) { cond = 'Nublado'; state = 'cloudy'; }
                    else if (code === 0) { cond = 'Limpo'; state = state === 'night' ? 'night' : 'sunny'; }

                    setLocalWeather({ temp: `${temp}°`, condition: cond, location: city, loading: false });
                    setCurrentWeather(state);
                }
            } catch (e) {
                setLocalWeather({ temp: '--', condition: 'Erro', location: 'Indisponível', loading: false });
                setCurrentWeather('default');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    console.error(err);
                    setLocalWeather({ temp: '--', condition: 'Sem GPS', location: 'Ative a Loc.', loading: false });
                    setCurrentWeather('default');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocalWeather({ temp: '--', condition: 'Sem Suporte', location: 'Navegador Antigo', loading: false });
        }
    }, []);

    return (
        <GlassCard interactive className="h-full flex flex-col justify-between border-white/40 group overflow-hidden" padding="p-6">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-white/40 flex items-center justify-center text-amber-500 shadow-sm border border-white/60 group-hover:scale-110 transition-all duration-500">
                    {localWeather.loading ? <Loader2 size={20} className="animate-spin" /> : <Sun size={20} />}
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{localWeather.location}</p>
                    <p className="text-[9px] font-black text-slate-900 tracking-tight mt-0.5">{localWeather.condition}</p>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex items-start gap-0.5">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{localWeather.temp.replace('°', '')}</span>
                    <span className="text-xl font-black text-slate-300 mt-0.5">°</span>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Celsius</p>
            </div>
        </GlassCard>
    );
};

export const MusicWidget: React.FC = () => {
    const { tasks, currentWeather } = useData();
    const [selectedMood, setSelectedMood] = useState('focus');
    const [isPulsing, setIsPulsing] = useState(false);

    const moods = [
        { id: 'focus', color: '#6366f1', name: 'Focus', icon: <Zap size={14} />, search: 'deep work productivity techno' },
        { id: 'relax', color: '#2dd4bf', name: 'Relax', icon: <Wind size={14} />, search: 'lofi chill jazz rain' },
        { id: 'energy', color: '#f43f5e', name: 'Energy', icon: <Flame size={14} />, search: 'gym motivation phonk' },
        { id: 'deep', color: '#8b5cf6', name: 'Deep', icon: <Headphones size={14} />, search: 'ambient cinematic soundscape' }
    ];

    const currentMoodData = useMemo(() => moods.find(m => m.id === selectedMood) || moods[0], [selectedMood]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (currentWeather === 'rainy') setSelectedMood('relax');
        else if (hour > 8 && hour < 18 && tasks.some(t => !t.completed)) setSelectedMood('focus');
        else if (hour >= 20) setSelectedMood('deep');
    }, [currentWeather, tasks.length]);

    const handleMoodChange = (id: string) => {
        setIsPulsing(true);
        setSelectedMood(id);
        setTimeout(() => setIsPulsing(false), 800);
    };

    const handleOpenYT = () => {
        window.open(`https://music.youtube.com/search?q=${encodeURIComponent(currentMoodData.search)}`, '_blank');
    };

    return (
        <GlassCard className="h-full border-white/40 overflow-hidden" padding="p-0">
            <div className="flex h-full">
                {/* Lado Esquerdo: Orbe Aura (Crystal) */}
                <div className="w-[42%] h-full flex flex-col items-center justify-center relative cursor-pointer overflow-hidden border-r border-white/40" onClick={handleOpenYT}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <div
                        className="w-20 h-20 vibe-orb animate-morph border border-white/50 relative flex items-center justify-center transition-all duration-1000"
                        style={{
                            backgroundColor: `${currentMoodData.color}15`,
                            boxShadow: `0 0 40px ${currentMoodData.color}10, inset 0 0 20px ${currentMoodData.color}25`,
                            transform: isPulsing ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        <div className="relative z-10 text-slate-800 opacity-70">
                            {currentMoodData.icon}
                        </div>
                    </div>
                    {isPulsing && <div className="absolute w-24 h-24 rounded-full border border-white/30 animate-aura-waves" />}

                    <span className="mt-4 text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">{currentMoodData.name}</span>
                </div>

                {/* Lado Direito: Controles */}
                <div className="flex-1 p-5 flex flex-col justify-between bg-white/10 backdrop-blur-md">
                    <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Crystal Tuner</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentMoodData.color }} />
                    </div>

                    <div className="grid grid-cols-4 gap-2 my-2">
                        {moods.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodChange(mood.id)}
                                className={`aspect-square flex items-center justify-center transition-all rounded-xl border border-white/50 ${selectedMood === mood.id ? 'bg-white shadow-md scale-105' : 'bg-white/20 opacity-40 hover:opacity-100'}`}
                                style={{ color: mood.color }}
                            >
                                {mood.icon}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleOpenYT}
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] tracking-widest uppercase shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Abrir YT Music <ExternalLink size={10} />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
};

export const ApeWidget: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { apePhases } = useData();
    const progress = apePhases[0]?.progress || 0;

    return (
        <GlassCard interactive onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <Building2 size={18} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meu Apê</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter mt-1">{progress}%</p>
                </div>
            </div>

            <div className="mt-auto">
                <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Evolução</span>
                    <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1"><Pencil size={8} /> Ajustar</span>
                </div>
            </div>
        </GlassCard>
    );
};

export const FinanceWidget: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { transactions, accounts } = useData();
    const [isVisible, setIsVisible] = useState(false);

    const balance = useMemo(() => {
        return accounts.reduce((acc, curr) => acc + curr.balance, 0);
    }, [accounts]);

    return (
        <GlassCard interactive={!!onClick} onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patrimônio</p>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
                    className="p-1 rounded-lg hover:bg-white/40 text-slate-400 text-slate-600 hover:text-slate-800 transition-all"
                >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            <h3 className={`text-2xl font-black text-slate-800 tracking-tighter tabular-nums mb-4 transition-all duration-700 ${!isVisible ? 'blur-md select-none opacity-40' : 'blur-0 opacity-100'}`}>
                R$ {balance.toLocaleString('pt-BR')}
            </h3>
            <div className="space-y-2 pt-2 border-t border-slate-100/50">
                {transactions.slice(0, 1).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400 truncate pr-4">{tx.description}</span>
                        <span className={`${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-400'} ${!isVisible ? 'blur-[3px]' : 'blur-0'}`}>
                            {tx.type === 'income' ? '+' : '-'} {tx.amount}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export const TaskWidget: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { tasks, setTasks } = useData();
    const pending = tasks.filter(t => !t.completed).slice(0, 2);

    const toggleTask = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <GlassCard interactive={!!onClick} onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Foco do Dia</p>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {pending.length > 0 ? pending.map(t => (
                    <div
                        key={t.id}
                        className="flex items-center gap-3 w-full group animate-in slide-in-from-left duration-300"
                    >
                        <button
                            onClick={(e) => toggleTask(e, t.id)}
                            className="p-1 rounded-lg hover:bg-indigo-50 text-slate-300 hover:text-indigo-500 transition-all"
                        >
                            <Circle size={14} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 truncate tracking-tight">{t.title}</span>
                    </div>
                )) : (
                    <div className="flex items-center gap-3 text-emerald-500 py-2">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tudo pronto!</span>
                    </div>
                )}
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                className="mt-4 w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
                Ver Todas
            </button>
        </GlassCard>
    );
};

export const MapsExploreWidget: React.FC<{ onExplore: (query: string) => void }> = ({ onExplore }) => {
    const [query, setQuery] = useState('');
    return (
        <GlassCard className="h-full flex flex-col justify-between border-white/40 group" padding="p-6">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                    <MapPin size={18} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aura Mapas</p>
                    <p className="text-xs font-black text-slate-800 tracking-tight mt-1">Explorar Local</p>
                </div>
            </div>

            <div className="relative mt-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onExplore(query)}
                    placeholder="O que procura?"
                    className="w-full bg-white/50 border border-white/40 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                />
                <button
                    onClick={() => onExplore(query)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                    <Search size={14} />
                </button>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {['Café', 'Restaurante', 'Parque'].map(q => (
                    <button
                        key={q}
                        onClick={() => onExplore(q)}
                        className="px-3 py-1.5 rounded-lg bg-white/40 border border-white/40 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};
