
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
  notes?: string;
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

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'other';
  balance: number;
  color?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  accountId?: string;
  cardId?: string;
  category?: string;
  destinationAccountId?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    status: 'active' | 'paused';
  };
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

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

export interface ReportData {
  name: string;
  value: number;
  color?: string;
}

export type PersonaId = 'aura';
export type VoiceId = 'Sulafat';
