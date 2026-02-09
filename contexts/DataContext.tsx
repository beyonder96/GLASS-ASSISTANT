
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Task, Transaction, ShoppingItem, Pet, ConstructionPhase, ApeNote, WidgetLayoutItem, AppMemory, Account, CreditCard } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Define and export WeatherState as it is required by Widgets.tsx
export type WeatherState = 'sunny' | 'cloudy' | 'rainy' | 'night' | 'default';

interface DataContextType {
  user: User | null; // Added User
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  shoppingList: ShoppingItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  apePhases: ConstructionPhase[];
  setApePhases: React.Dispatch<React.SetStateAction<ConstructionPhase[]>>;
  apeNotes: ApeNote[];
  setApeNotes: React.Dispatch<React.SetStateAction<ApeNote[]>>;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  dashboardLayout: WidgetLayoutItem[];
  setDashboardLayout: React.Dispatch<React.SetStateAction<WidgetLayoutItem[]>>;
  memory: AppMemory[];
  setMemory: React.Dispatch<React.SetStateAction<AppMemory[]>>;
  currentWeather: WeatherState;
  setCurrentWeather: React.Dispatch<React.SetStateAction<WeatherState>>;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline'; // Added Sync Status
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_LAYOUT: WidgetLayoutItem[] = [
  { id: 'w1', type: 'weather', colSpan: 1, isVisible: true },
  { id: 'w2', type: 'ape', colSpan: 1, isVisible: true },
  { id: 'w3', type: 'music', colSpan: 2, isVisible: true },
  { id: 'w4', type: 'maps', colSpan: 2, isVisible: true },
  { id: 'w5', type: 'tasks', colSpan: 1, isVisible: true },
  { id: 'w6', type: 'finance', colSpan: 1, isVisible: true }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('offline');

  const [tasks, setTasksState] = useState<Task[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingItem[]>([]);
  const [pets, setPetsState] = useState<Pet[]>([]);
  const [apePhases, setApePhasesState] = useState<ConstructionPhase[]>([]);
  const [apeNotes, setApeNotesState] = useState<ApeNote[]>([]);
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>([]);
  const [dashboardLayout, setDashboardLayoutState] = useState<WidgetLayoutItem[]>([]);
  const [memory, setMemoryState] = useState<AppMemory[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherState>('default');

  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  // 1. Load from LocalStorage (Fallback/Cache)
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('glass_tasks');
      const savedTxs = localStorage.getItem('glass_transactions');
      const savedShop = localStorage.getItem('glass_shopping');
      const savedPets = localStorage.getItem('glass_pets');
      const savedApePhases = localStorage.getItem('ape_phases');
      const savedApeNotes = localStorage.getItem('ape_notes');
      const savedAccounts = localStorage.getItem('glass_accounts');
      const savedCreditCards = localStorage.getItem('glass_credit_cards');
      const savedLayout = localStorage.getItem('glass_dashboard_layout');
      const savedMemory = localStorage.getItem('glass_memory');

      if (savedTasks) setTasksState(JSON.parse(savedTasks));
      if (savedTxs) setTransactionsState(JSON.parse(savedTxs));
      if (savedShop) setShoppingListState(JSON.parse(savedShop));
      if (savedPets) setPetsState(JSON.parse(savedPets));
      if (savedApePhases) setApePhasesState(JSON.parse(savedApePhases));
      if (savedApeNotes) setApeNotesState(JSON.parse(savedApeNotes));
      if (savedAccounts) setAccountsState(JSON.parse(savedAccounts));
      if (savedCreditCards) setCreditCardsState(JSON.parse(savedCreditCards));

      if (savedLayout) {
        setDashboardLayoutState(JSON.parse(savedLayout));
      } else {
        setDashboardLayoutState(DEFAULT_LAYOUT);
      }

      if (savedMemory) setMemoryState(JSON.parse(savedMemory));

      setIsLoaded(true);
    } catch (e) {
      console.error("Erro ao carregar dados locais", e);
    }
  }, []);

  // 2. Auth Listener & Fetch Remote Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRemoteData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRemoteData(session.user.id);
      else setSyncStatus('offline');
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRemoteData = async (userId: string) => {
    setSyncStatus('syncing');
    try {
      // Fetch Tasks
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userId);
      if (tasksData && tasksData.length > 0) setTasksState(tasksData.map(t => ({ id: t.id, title: t.text, completed: t.completed, notes: t.notes })));

      // Fetch Transactions
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', userId);
      if (txData && txData.length > 0) setTransactionsState(txData.map(t => ({ id: t.id, description: t.description, amount: Number(t.amount), type: t.type as 'income' | 'expense', date: t.date, accountId: t.account_id, cardId: t.card_id, category: t.category })));

      // Fetch Shopping
      const { data: shopData } = await supabase.from('shopping_items').select('*').eq('user_id', userId);
      if (shopData && shopData.length > 0) setShoppingListState(shopData.map(t => ({ id: t.id, name: t.text, completed: t.completed })));

      // Fetch Pets
      const { data: petsData } = await supabase.from('pets').select('*').eq('user_id', userId);
      if (petsData && petsData.length > 0) setPetsState(petsData.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type as any,
        breed: p.breed,
        birthDate: p.birth_date, // Mapped
        microchip: p.microchip,
        weightHistory: typeof p.weight_history === 'string' ? JSON.parse(p.weight_history) : p.weight_history,
        vaccines: typeof p.vaccines === 'string' ? JSON.parse(p.vaccines) : p.vaccines
      })));

      // Fetch Accounts
      const { data: accData } = await supabase.from('accounts').select('*').eq('user_id', userId);
      if (accData && accData.length > 0) setAccountsState(accData.map(a => ({ id: a.id, name: a.name, type: a.type as any, balance: Number(a.balance), color: a.color })));

      // Fetch Credit Cards
      const { data: ccData } = await supabase.from('credit_cards').select('*').eq('user_id', userId);
      if (ccData && ccData.length > 0) setCreditCardsState(ccData.map(c => ({ id: c.id, name: c.name, limit: Number(c.limit_amount), closingDay: c.closing_day, dueDay: c.due_day, color: c.color })));

      setSyncStatus('synced');
    } catch (error) {
      console.error("Erro ao buscar dados remotos:", error);
      setSyncStatus('error');
    }
  };

  // 3. Sync Changes to Supabase (Debounced)
  // Limitation: We wipe and recreate for simplicity/consistency in this MVP.
  // Ideally, we'd use upsert.
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoaded) {
      // Always save to LocalStorage
      localStorage.setItem('glass_tasks', JSON.stringify(tasks));
      localStorage.setItem('glass_transactions', JSON.stringify(transactions));
      localStorage.setItem('glass_shopping', JSON.stringify(shoppingList));
      localStorage.setItem('glass_pets', JSON.stringify(pets));
      localStorage.setItem('ape_phases', JSON.stringify(apePhases));
      localStorage.setItem('ape_notes', JSON.stringify(apeNotes));
      localStorage.setItem('glass_accounts', JSON.stringify(accounts));
      localStorage.setItem('glass_credit_cards', JSON.stringify(creditCards));
      localStorage.setItem('glass_dashboard_layout', JSON.stringify(dashboardLayout));
      localStorage.setItem('glass_memory', JSON.stringify(memory));

      // If User Logged In, Sync to Supabase
      if (user) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setSyncStatus('syncing');
        timeoutRef.current = setTimeout(async () => {
          saveToSupabase();
        }, 2000); // 2s debounce
      }
    }
  }, [tasks, transactions, shoppingList, pets, apePhases, apeNotes, accounts, creditCards, dashboardLayout, memory, isLoaded, user]);

  const saveToSupabase = async () => {
    if (!user) return;
    try {
      // Sync Tasks (Delete all & Insert)
      await supabase.from('tasks').delete().eq('user_id', user.id);
      if (tasks.length > 0) {
        await supabase.from('tasks').insert(tasks.map(t => ({
          user_id: user.id,
          text: t.title,
          completed: t.completed,
          notes: t.notes
          // id is auto-generated or we can preserve it if uuid? 
          // schema says id uuid default gen_random_uuid().
          // If we want to preserve local IDs (which are Date.now().toString()), we need to change schema or just let Supabase generate new ones.
          // Issue: If Supabase generates new IDs, our local IDs become invalid sync-wise.
          // Fix: We should probably store the local ID? Or just trust the content?
          // For MVP, we'll just insert content.
        })));
      }

      // Sync Shopping
      await supabase.from('shopping_items').delete().eq('user_id', user.id);
      if (shoppingList.length > 0) {
        await supabase.from('shopping_items').insert(shoppingList.map(t => ({
          user_id: user.id,
          text: t.name,
          completed: t.completed
        })));
      }

      // Sync Transactions
      await supabase.from('transactions').delete().eq('user_id', user.id);
      if (transactions.length > 0) {
        await supabase.from('transactions').insert(transactions.map(t => ({
          user_id: user.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          type: t.type,
          date: t.date,
          account_id: t.accountId,
          card_id: t.cardId,
          category: t.category
        })));
      }

      // Sync Pets
      // We do Upsert here because Pets are more complex? No, Delete/Insert is safer for Consistency if lists are small.
      await supabase.from('pets').delete().eq('user_id', user.id);
      if (pets.length > 0) {
        await supabase.from('pets').insert(pets.map(p => ({
          user_id: user.id,
          name: p.name,
          type: p.type,
          breed: p.breed,
          birth_date: p.birthDate,
          microchip: p.microchip,
          weight_history: p.weightHistory, // JSONB
          vaccines: p.vaccines // JSONB
        })));
      }

      // Sync Accounts
      await supabase.from('accounts').delete().eq('user_id', user.id);
      if (accounts.length > 0) {
        await supabase.from('accounts').insert(accounts.map(a => ({
          user_id: user.id,
          name: a.name,
          type: a.type,
          balance: a.balance,
          color: a.color
        })));
      }

      // Sync Credit Cards
      await supabase.from('credit_cards').delete().eq('user_id', user.id);
      if (creditCards.length > 0) {
        await supabase.from('credit_cards').insert(creditCards.map(c => ({
          user_id: user.id,
          name: c.name,
          limit_amount: c.limit,
          closing_day: c.closingDay,
          due_day: c.dueDay,
          color: c.color
        })));
      }

      setSyncStatus('synced');
    } catch (e) {
      console.error("Erro no sync Supabase:", e);
      setSyncStatus('error');
    }
  };

  return (
    <DataContext.Provider value={{
      user,
      tasks, setTasks: setTasksState,
      transactions, setTransactions: setTransactionsState,
      shoppingList, setShoppingList: setShoppingListState,
      pets, setPets: setPetsState,
      apePhases, setApePhases: setApePhasesState,
      apeNotes, setApeNotes: setApeNotesState,
      accounts, setAccounts: setAccountsState,
      creditCards, setCreditCards: setCreditCardsState,
      dashboardLayout, setDashboardLayout: setDashboardLayoutState,
      memory, setMemory: setMemoryState,
      currentWeather, setCurrentWeather,
      syncStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
