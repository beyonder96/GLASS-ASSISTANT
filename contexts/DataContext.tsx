import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Task, Transaction, ShoppingItem, Pet, ConstructionPhase, ApeNote, WidgetLayoutItem, AppMemory, Account, CreditCard, Budget } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export type WeatherState = 'sunny' | 'cloudy' | 'rainy' | 'night' | 'default';

interface DataContextType {
  user: User | null;
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
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  memory: AppMemory[];
  setMemory: React.Dispatch<React.SetStateAction<AppMemory[]>>;
  currentWeather: WeatherState;
  setCurrentWeather: React.Dispatch<React.SetStateAction<WeatherState>>;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
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

// Helper to check if string is a valid UUID
const isUUID = (str: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('offline');

  // State Definitions
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingItem[]>([]);
  const [pets, setPetsState] = useState<Pet[]>([]);
  const [apePhases, setApePhasesState] = useState<ConstructionPhase[]>([]);
  const [apeNotes, setApeNotesState] = useState<ApeNote[]>([]);
  const [accounts, setAccountsState] = useState<Account[]>([]);
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>([]);
  const [dashboardLayout, setDashboardLayoutState] = useState<WidgetLayoutItem[]>([]);
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [memory, setMemoryState] = useState<AppMemory[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherState>('default');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Refs to prevent sync loops
  const isInitialLoad = useRef(true);

  // 1. Load from LocalStorage (Initial)
  useEffect(() => {
    try {
      const load = (key: string, setter: any) => {
        const saved = localStorage.getItem(key);
        if (saved) setter(JSON.parse(saved));
      };

      load('glass_tasks', setTasksState);
      load('glass_transactions', setTransactionsState);
      load('glass_shopping', setShoppingListState);
      load('glass_pets', setPetsState);
      load('ape_phases', setApePhasesState);
      load('ape_notes', setApeNotesState);
      load('glass_accounts', setAccountsState);
      load('glass_credit_cards', setCreditCardsState);
      load('glass_budgets', setBudgetsState);
      load('glass_memory', setMemoryState);
      load('glass_profile_image', setProfileImage);

      const savedLayout = localStorage.getItem('glass_dashboard_layout');
      if (savedLayout) setDashboardLayoutState(JSON.parse(savedLayout));
      else setDashboardLayoutState(DEFAULT_LAYOUT);

      setIsLoaded(true);
    } catch (e) {
      console.error("Critical: Failed to load local data", e);
    }
  }, []);

  // 2. Auth & Remote Fetch
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
      const fetchData = async (table: string, setter: any, mapper: (item: any) => any) => {
        const { data } = await supabase.from(table).select('*').eq('user_id', userId);
        if (data && data.length > 0) setter(data.map(mapper));
      };

      await Promise.all([
        fetchData('tasks', setTasksState, t => ({ id: t.id, title: t.text, completed: t.completed, notes: t.notes })),
        fetchData('shopping_items', setShoppingListState, s => ({ id: s.id, name: s.text, completed: s.completed })),
        fetchData('accounts', setAccountsState, a => ({ id: a.id, name: a.name, type: a.type, balance: Number(a.balance), color: a.color })),
        fetchData('credit_cards', setCreditCardsState, c => ({ id: c.id, name: c.name, limit: Number(c.limit_amount), closingDay: c.closing_day, dueDay: c.due_day, color: c.color })),
        fetchData('pets', setPetsState, p => ({
          id: p.id, name: p.name, type: p.type, breed: p.breed, birthDate: p.birth_date, microchip: p.microchip,
          weightHistory: typeof p.weight_history === 'string' ? JSON.parse(p.weight_history) : p.weight_history,
          vaccines: typeof p.vaccines === 'string' ? JSON.parse(p.vaccines) : p.vaccines
        })),
        fetchData('transactions', setTransactionsState, t => ({
          id: t.id, description: t.description, amount: Number(t.amount), type: t.type, date: t.date, accountId: t.account_id, cardId: t.card_id, category: t.category
        }))
      ]);

      setSyncStatus('synced');
    } catch (error) {
      console.error("Error fetching remote data:", error);
      setSyncStatus('error');
    } finally {
      isInitialLoad.current = false;
    }
  };

  // --- GENERIC UPSERT HELPER ---
  const upsertData = useCallback(async (table: string, data: any[]) => {
    if (!user) return;

    // Safety: If ID is not a valid UUID (it's a temp local ID), strip it so Supabase generates a new UUID.
    // If it IS a UUID, we keep it to update the existing record.
    const cleanPayload = data.map(item => {
      const payload = { ...item, user_id: user.id };
      if (payload.id && !isUUID(payload.id)) {
        delete payload.id;
      }
      return payload;
    });

    if (cleanPayload.length === 0) return;

    const { error } = await supabase.from(table).upsert(cleanPayload);
    if (error) {
      console.error(`Error syncing ${table}:`, error);
      setSyncStatus('error');
    } else {
      setSyncStatus('synced');
    }
  }, [user]);

  // --- SPLIT SYNC EFFECTS ---

  // 1. Sync Tasks
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_tasks', JSON.stringify(tasks));
    if (user && !isInitialLoad.current) {
      setSyncStatus('syncing');
      const timer = setTimeout(() => {
        upsertData('tasks', tasks.map(t => ({ id: t.id, text: t.title, completed: t.completed, notes: t.notes })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, isLoaded, user, upsertData]);

  // 2. Sync Finance (Transactions, Accounts, Cards) - grouped because they relate
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_transactions', JSON.stringify(transactions));
    localStorage.setItem('glass_accounts', JSON.stringify(accounts));
    localStorage.setItem('glass_credit_cards', JSON.stringify(creditCards));

    if (user && !isInitialLoad.current) {
      setSyncStatus('syncing');
      const timer = setTimeout(() => {
        // Sync Accounts
        upsertData('accounts', accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance, color: a.color })));
        // Sync Cards
        upsertData('credit_cards', creditCards.map(c => ({ id: c.id, name: c.name, limit_amount: c.limit, closing_day: c.closingDay, due_day: c.dueDay, color: c.color })));
        // Sync Transactions
        upsertData('transactions', transactions.map(t => ({ id: t.id, description: t.description, amount: t.amount, type: t.type, date: t.date, account_id: t.accountId, card_id: t.cardId, category: t.category })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [transactions, accounts, creditCards, isLoaded, user, upsertData]);

  // 3. Sync Shopping
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_shopping', JSON.stringify(shoppingList));
    if (user && !isInitialLoad.current) {
      setSyncStatus('syncing');
      const timer = setTimeout(() => {
        upsertData('shopping_items', shoppingList.map(s => ({ id: s.id, text: s.name, completed: s.completed })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shoppingList, isLoaded, user, upsertData]);

  // 4. Sync Pets
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_pets', JSON.stringify(pets));
    if (user && !isInitialLoad.current) {
      setSyncStatus('syncing');
      const timer = setTimeout(() => {
        upsertData('pets', pets.map(p => ({
          id: p.id, name: p.name, type: p.type, breed: p.breed, birth_date: p.birthDate, microchip: p.microchip,
          weight_history: p.weightHistory, vaccines: p.vaccines
        })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pets, isLoaded, user, upsertData]);

  // 5. Sync Others (Local Only or Less Frequent)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ape_phases', JSON.stringify(apePhases));
      localStorage.setItem('ape_notes', JSON.stringify(apeNotes));
      localStorage.setItem('glass_dashboard_layout', JSON.stringify(dashboardLayout));
      localStorage.setItem('glass_budgets', JSON.stringify(budgets));
      localStorage.setItem('glass_memory', JSON.stringify(memory));
      if (profileImage) localStorage.setItem('glass_profile_image', JSON.stringify(profileImage));
    }
  }, [apePhases, apeNotes, dashboardLayout, memory, profileImage, isLoaded]);

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
      budgets, setBudgets: setBudgetsState,
      memory, setMemory: setMemoryState,
      currentWeather, setCurrentWeather,
      profileImage, setProfileImage,
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