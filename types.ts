
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingSources?: GroundingSource[];
}

export interface WidgetLayoutItem {
  id: string;
  type: 'weather' | 'ape' | 'music' | 'maps' | 'tasks' | 'finance';
  colSpan: 1 | 2;
  isVisible: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitType: 'un' | 'kg';
  total: number;
}

export interface AppMemory {
  id: string;
  fact: string;
  category: 'personal' | 'preference' | 'important';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export interface Vaccine {
  id: string;
  name: string;
  dateAdministered: string;
  nextDueDate?: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  birthDate?: string; 
  microchip?: string;
  weightHistory?: WeightEntry[];
  vaccines?: Vaccine[];
}

export interface ConstructionPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export interface ApeNote {
  id: string;
  title: string;
  content: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url?: string;
}

export type PersonaId = 'aura';
export type VoiceId = 'Sulafat';
