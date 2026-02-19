
import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, Plus, Trash2, PawPrint, Dog, Cat, Bird, Save, X, Heart, Pencil, Syringe, Scale, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Pet, Vaccine, WeightEntry } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';

const WeightChart: React.FC<{ history: WeightEntry[] }> = ({ history }) => {
  const data = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  if (data.length < 2) {
    return (
      <div className="h-32 flex flex-col items-center justify-center bg-white/20 rounded-3xl border border-dashed border-white/40">
        <TrendingUp size={24} className="text-slate-300 mb-2" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
          Registre mais pesos para ver a tendência
        </p>
      </div>
    );
  }

  const padding = 20;
  const width = 300;
  const height = 120;
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) * 0.95;
  const maxW = Math.max(...weights) * 1.05;
  const range = maxW - minW || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.weight - minW) / range) * (height - padding * 2);
    return { x, y, weight: d.weight };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="relative bg-white/30 backdrop-blur-md rounded-[2rem] border border-white/50 p-4 shadow-inner overflow-hidden">
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Evolução de Peso</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <path d={areaPath} fill="rgba(16, 185, 129, 0.1)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#10b981" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
};

interface PetScreenProps {
  onBack: () => void;
}

export const PetScreen: React.FC<PetScreenProps> = ({ onBack }) => {
  const { pets, setPets } = useData();
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<Pet['type']>('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [microchip, setMicrochip] = useState('');

  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const [vacName, setVacName] = useState('');
  const [vacDate, setVacDate] = useState('');
  const [vacNext, setVacNext] = useState('');

  const [weightVal, setWeightVal] = useState('');
  const [weightDate, setWeightDate] = useState('');

  const handleSaveVaccine = () => {
    if (!vacName || !vacDate || !selectedPetId) return;
    const newVac: Vaccine = {
      id: uuidv4(),
      name: vacName,
      dateAdministered: vacDate,
      nextDueDate: vacNext || undefined
    };
    setPets(pets.map(p => p.id === selectedPetId ? { ...p, vaccines: [...(p.vaccines || []), newVac] } : p));
    setIsVaccineModalOpen(false);
    setVacName(''); setVacDate(''); setVacNext('');
  };

  const handleSaveWeight = () => {
    if (!weightVal || !weightDate || !selectedPetId) return;
    const newEntry: WeightEntry = {
      id: uuidv4(),
      date: weightDate,
      weight: parseFloat(weightVal)
    };
    setPets(pets.map(p => p.id === selectedPetId ? { ...p, weightHistory: [...(p.weightHistory || []), newEntry] } : p));
    setIsWeightModalOpen(false);
    setWeightVal(''); setWeightDate('');
  };

  const getSelectedPet = () => pets.find(p => p.id === selectedPetId);

  const calculateAge = (dateString?: string) => {
    if (!dateString) return 'Idade desconhecida';
    const birth = new Date(dateString);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return years > 0 ? `${years}a ${months}m` : `${months} meses`;
  };

  const handleSavePet = () => {
    if (!name.trim()) return;
    if (view === 'form' && selectedPetId) {
      setPets(pets.map(p => p.id === selectedPetId ? { ...p, name, type, breed, birthDate, microchip } : p));
    } else {
      const newPet: Pet = { id: uuidv4(), name, type, breed, birthDate, microchip, weightHistory: [], vaccines: [] };
      setPets([...pets, newPet]);
    }
    setView('list');
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setType('dog');
    setBreed('');
    setBirthDate('');
    setMicrochip('');
    setSelectedPetId(null);
  };

  const startNewPet = () => {
    resetForm();
    setView('form');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'dog': return <Dog size={24} />;
      case 'cat': return <Cat size={24} />;
      case 'bird': return <Bird size={24} />;
      default: return <PawPrint size={24} />;
    }
  };

  if (view === 'details' && selectedPetId) {
    const pet = getSelectedPet()!;
    return (
      <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{pet.name}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{pet.breed || 'Pet Amigo'}</p>
          </div>
        </div>

        <div className="mb-6 relative group">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsWeightModalOpen(true)}
              className="p-2 rounded-full bg-indigo-500 text-white shadow-lg hover:scale-110 transition-all"
              title="Adicionar Peso"
            >
              <Plus size={16} />
            </button>
          </div>
          <WeightChart history={pet.weightHistory || []} />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2"><Syringe size={16} className="text-indigo-500" /> Vacinas</h3>
            <button onClick={() => setIsVaccineModalOpen(true)} className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">+ ADICIONAR</button>
          </div>

          <div className="space-y-2">
            {!pet.vaccines || pet.vaccines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma vacina registrada.</p>
            ) : (
              pet.vaccines.map((vac, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{vac.name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(vac.dateAdministered).toLocaleDateString()}</p>
                  </div>
                  {vac.nextDueDate && (
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Próxima</p>
                      <p className="font-bold text-indigo-500 text-xs">{new Date(vac.nextDueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL VACINA */}
        {isVaccineModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-sm" padding="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Nova Vacina</h3>
                <button onClick={() => setIsVaccineModalOpen(false)}><X size={20} className="text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Nome da Vacina" value={vacName} onChange={e => setVacName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400/50" />
                <input type="date" placeholder="Data da Aplicação" value={vacDate} onChange={e => setVacDate(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400/50" />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Próxima Dose (Opcional)</label>
                  <input type="date" value={vacNext} onChange={e => setVacNext(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400/50" />
                </div>
                <button onClick={handleSaveVaccine} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">Salvar Vacina</button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* MODAL PESO */}
        {isWeightModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-sm" padding="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Novo Peso</h3>
                <button onClick={() => setIsWeightModalOpen(false)}><X size={20} className="text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <input type="number" placeholder="Peso (kg)" value={weightVal} onChange={e => setWeightVal(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400/50" />
                <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-white/60 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400/50" />
                <button onClick={handleSaveWeight} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg mt-2">Salvar Peso</button>
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full w-full animate-in slide-in-from-bottom duration-500 relative px-1">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedPetId ? 'Editar Pet' : 'Novo Pet'}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preencha os dados</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Rex"
              className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
            <div className="flex gap-2">
              {(['dog', 'cat', 'bird', 'other'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 p-3 rounded-xl border flex items-center justify-center transition-all ${type === t ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' : 'bg-white/40 border-white/60 text-slate-500 hover:bg-white/60'}`}
                >
                  {getIcon(t)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Raça</label>
            <input
              type="text"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              placeholder="Ex: Golden Retriever"
              className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 text-slate-800 font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSavePet}
              className="w-full p-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar Pet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative px-1">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all"><ChevronLeft size={24} /></button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Meus Pets</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saúde & Bem-estar</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={startNewPet} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-lg"><Plus size={18} /> Novo Pet</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-3">
        {pets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-50">
            <PawPrint size={48} className="text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase">Nenhum pet cadastrado</p>
          </div>
        ) : (
          pets.map(pet => (
            <div key={pet.id} onClick={() => { setSelectedPetId(pet.id); setView('details'); }} className="group flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 shadow-sm">{getIcon(pet.type)}</div>
                <div>
                  <p className="font-bold text-slate-800">{pet.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{calculateAge(pet.birthDate)}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
