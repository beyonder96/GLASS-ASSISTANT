
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Greeting } from './components/Greeting';

import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import {
  WeatherWidget,
  TaskWidget,
  FinanceWidget,
  MapsExploreWidget,
  MusicWidget,
  ApeWidget
} from './components/Widgets';
import { FinancialHub } from './components/Finance/FinancialHub';
import { TaskScreen } from './components/TaskScreen';
import { ShoppingScreen } from './components/ShoppingScreen';
import { PetScreen } from './components/PetScreen';
import { ApeScreen } from './components/ApeScreen';
import { MapScreen } from './components/MapScreen';
import { PersonaId, VoiceId, WidgetLayoutItem } from './types';
import { useData } from './contexts/DataContext';
import { LayoutGrid, Maximize2, Minimize2, MoveUp, MoveDown, Check, Settings2, Eye, EyeOff } from 'lucide-react';

type ViewState = 'dashboard' | 'finance' | 'tasks' | 'shopping' | 'pets' | 'ape' | 'map';

const App: React.FC = () => {
  const { dashboardLayout, setDashboardLayout, currentWeather, user } = useData(); // Added user

  // Local state for UI only (sidebar, layout editing)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const [currentPersona, setCurrentPersona] = useState<PersonaId>('aura'); // Kept for now
  const currentVoice: VoiceId = 'Sulafat';
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [exploreQuery, setExploreQuery] = useState('');

  // Derived state for Auth
  const isAuthenticated = !!user;

  // handleLogin is no longer needed to set state, but AuthScreen expects a prop.
  // We can just pass a void function or nice transition.
  const handleLogin = (user: any) => {
    // User state is handled by DataContext automatically via Supabase Auth Listener
    console.log("Logged in user:", user);
  };

  const handleLogout = async () => {
    const { supabase } = await import('./lib/supabase');
    await supabase.auth.signOut();
    setCurrentView('dashboard');
    setIsSidebarOpen(false);
  };

  const toggleWidgetVisibility = (id: string) => {
    setDashboardLayout(dashboardLayout.map(w =>
      w.id === id ? { ...w, isVisible: !w.isVisible } : w
    ));
  };

  const updateWidgetSpan = (id: string) => {
    setDashboardLayout(dashboardLayout.map(w =>
      w.id === id ? { ...w, colSpan: w.colSpan === 1 ? 2 : 1 } : w
    ));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...dashboardLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newLayout.length) {
      [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
      setDashboardLayout(newLayout);
    }
  };

  const handleExplore = (query: string) => {
    setExploreQuery(query);
    setCurrentView('map');
  };

  // Mantém apenas o modo claro independente da hora do dia ou clima
  const bgClasses = useMemo(() => {
    // Gradiente premium claro e energético constante
    return 'from-[#74EBD5] via-[#9FACE6] to-[#CFDEF3]';
  }, []);

  const renderWidget = (widget: WidgetLayoutItem, index: number) => {
    const isVisible = widget.isVisible;
    if (!isVisible && !isEditingLayout) return null;

    const commonClass = `transition-all duration-500 relative ${isEditingLayout ? 'ring-2 ring-indigo-400 ring-offset-4 ring-offset-transparent' : ''} ${!isVisible ? 'opacity-30 scale-95 border-dashed' : ''}`;
    const spanClass = widget.colSpan === 2 ? 'col-span-2' : 'col-span-1';

    // Altura padronizada h-52 para manter simetria total no grid
    const heightClass = 'h-52';

    const getContent = () => {
      switch (widget.type) {
        case 'weather': return <WeatherWidget />;
        case 'ape': return <ApeWidget onClick={() => !isEditingLayout && setCurrentView('ape')} />;
        case 'music': return <MusicWidget />;
        case 'maps': return <MapsExploreWidget onExplore={handleExplore} />;
        case 'tasks': return <TaskWidget onClick={() => !isEditingLayout && setCurrentView('tasks')} />;
        case 'finance': return <FinanceWidget onClick={() => !isEditingLayout && setCurrentView('finance')} />;
        default: return null;
      }
    };

    const content = getContent();
    if (!content && !isEditingLayout && isVisible) return null;

    return (
      <div key={widget.id} className={`${spanClass} ${heightClass} ${commonClass}`}>
        {content}

        {isEditingLayout && (
          <div className="absolute -top-3 -right-3 z-50 flex gap-1 animate-in zoom-in duration-300">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${isVisible ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-600'}`}
            >
              {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              onClick={() => updateWidgetSpan(widget.id)}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white"
            >
              {widget.colSpan === 1 ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
            <div className="flex flex-col gap-1">
              {index > 0 && (
                <button onClick={() => moveWidget(index, 'up')} className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MoveUp size={12} />
                </button>
              )}
              {index < dashboardLayout.length - 1 && (
                <button onClick={() => moveWidget(index, 'down')} className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MoveDown size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'finance': return <FinancialHub onBack={() => setCurrentView('dashboard')} />;
      case 'tasks': return <TaskScreen onBack={() => setCurrentView('dashboard')} />;
      case 'shopping': return <ShoppingScreen onBack={() => setCurrentView('dashboard')} />;
      case 'pets': return <PetScreen onBack={() => setCurrentView('dashboard')} />;
      case 'ape': return <ApeScreen onBack={() => setCurrentView('dashboard')} />;
      case 'map': return <MapScreen onBack={() => setCurrentView('dashboard')} initialQuery={exploreQuery} />;
      default:
        return (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end pr-2">
              <Greeting />
              <button
                onClick={() => setIsEditingLayout(!isEditingLayout)}
                className={`mb-10 p-4 rounded-3xl transition-all shadow-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${isEditingLayout ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-white/40 text-slate-600 hover:bg-white/60'}`}
              >
                {isEditingLayout ? <><Check size={16} /> Pronto</> : <><Settings2 size={16} /> Layout</>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 px-1 pb-32">
              {dashboardLayout.map((widget, idx) => renderWidget(widget, idx))}
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-slate-800 font-sans selection:bg-pink-300 selection:text-pink-900">
      <div className={`fixed inset-0 z-[-1] bg-gradient-to-br animate-gradient-x transition-all duration-[2000ms] ${bgClasses}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        userMode={user ? 'google' : 'guest'}
      />

      <div className={`relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-4 pb-4 transition-all duration-700 ease-in-out ${isSidebarOpen ? 'scale-95 translate-x-4 blur-[2px]' : ''}`}>
        <div className={`transition-all duration-500 ease-in-out flex-1 flex flex-col ${'opacity-100 translate-y-0'}`}>
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 flex flex-col mt-2">
            {renderContent()}
          </main>
        </div>


      </div>
    </div>
  );
};

export default App;
