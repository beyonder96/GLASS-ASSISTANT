
import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Circle, ListTodo, Calendar, X } from 'lucide-react';
import { Task } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';

interface TaskScreenProps {
  onBack: () => void;
}

export const TaskScreen: React.FC<TaskScreenProps> = ({ onBack }) => {
  const { tasks, setTasks } = useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState('');

  const handleAdd = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false
    };
    setTasks(prev => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    if (window.confirm("Remover todas as tarefas concluídas?")) {
        setTasks(prev => prev.filter(t => !t.completed));
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tarefas</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Produtividade Diária</p>
        </div>
      </div>

      {/* Progress Card */}
      <GlassCard className="mb-6" padding="p-6">
        <div className="flex justify-between items-end mb-2">
            <div>
                <p className="text-3xl font-black text-slate-800">{completionRate}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concluído</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                <ListTodo size={24} />
            </div>
        </div>
        <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionRate}%` }}
            />
        </div>
      </GlassCard>

      {/* Input Area */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
            <input 
                type="text" 
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Adicionar nova tarefa..."
                className="w-full h-12 pl-4 pr-4 rounded-2xl bg-white/40 border border-white/40 focus:bg-white/60 focus:ring-2 focus:ring-indigo-400/50 outline-none text-slate-800 placeholder:text-slate-500 font-medium transition-all"
            />
        </div>
        <button 
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
            <Plus size={24} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 p-1 bg-white/30 rounded-xl backdrop-blur-md">
            {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                        px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                        ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-white/40'}
                    `}
                >
                    {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : 'Feitas'}
                </button>
            ))}
        </div>
        {tasks.some(t => t.completed) && (
            <button 
                onClick={clearCompleted}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
                Limpar Concluídas
            </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-2">
        {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                <Calendar size={48} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Lista Vazia</p>
            </div>
        ) : (
            filteredTasks.map((task) => (
                <div 
                    key={task.id} 
                    className="group flex items-center gap-3 p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all animate-in slide-in-from-bottom-2 duration-300"
                >
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className={`shrink-0 transition-all active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-500'}`}
                    >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    
                    <span 
                        onClick={() => toggleTask(task.id)}
                        className={`flex-1 font-medium text-sm cursor-pointer select-none transition-all ${task.completed ? 'line-through text-slate-400 decoration-slate-400' : 'text-slate-800'}`}
                    >
                        {task.title}
                    </span>

                    <button 
                        onClick={() => removeTask(task.id)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
