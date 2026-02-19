import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Task, Transaction, ShoppingItem, Pet, ConstructionPhase, ApeNote, WidgetLayoutItem, AppMemory, Account, CreditCard, Budget, Goal } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export type WeatherState = 'sunny' | 'cloudy' | 'rainy' | 'night' | 'default';

interface DataContextType {
  user: User | null;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;

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
  addAccount: (acc: Account) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;

  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  addCard: (card: CreditCard) => void;
  updateCard: (card: CreditCard) => void;
  deleteCard: (id: string) => void;

  dashboardLayout: WidgetLayoutItem[];
  setDashboardLayout: React.Dispatch<React.SetStateAction<WidgetLayoutItem[]>>;

  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

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
        })),
        fetchData('ape_phases', setApePhasesState, p => ({ id: p.id, name: p.name, status: p.status, progress: Number(p.progress) })),
        fetchData('ape_notes', setApeNotesState, n => ({ id: n.id, title: n.title, content: n.content }))
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

    // Safety: Ensure we are sending valid UUIDs. 
    // If the ID is NOT a UUID (old data or temp ID), we should properly migrate or handle it.
    // For now, we filter out invalid IDs to prevent DB errors, 
    // BUT we should really be ensuring all IDs are UUIDs from creation.
    const cleanPayload = data.map(item => {
      const payload = { ...item, user_id: user.id };
      // If we encounter a non-UUID ID that IS meant to be inserted, it should have been a UUID.
      // If it is a purely local ID (like 'temp-1'), we should remove it so Supabase generates one?
      // MO: We will enforcing UUID generation on the CLIENT side for optimistic updates.
      return payload;
    }).filter(item => isUUID(item.id)); // Only sync valid UUID records

    if (cleanPayload.length === 0) return;

    const { error } = await supabase.from(table).upsert(cleanPayload);
    if (error) {
      console.error(`Error syncing ${table}:`, error);
      setSyncStatus('error');
    } else {
      setSyncStatus('synced');
    }
  }, [user]);

  // --- DELETE HELPER ---
  const deleteData = useCallback(async (table: string, id: string) => {
    if (!user) return;

    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      setSyncStatus('error');
    } else {
      setSyncStatus('synced');
    }
  }, [user]);


  // --- PUBLIC ACTIONS (Optimistic + Sync) ---

  const addAccount = (account: Account) => {
    setAccountsState(prev => [...prev, account]);
    upsertData('accounts', [
      { id: account.id, name: account.name, type: account.type, balance: account.balance, color: account.color }
    ]);
  };

  const updateAccount = (account: Account) => {
    setAccountsState(prev => prev.map(a => a.id === account.id ? account : a));
    upsertData('accounts', [
      { id: account.id, name: account.name, type: account.type, balance: account.balance, color: account.color }
    ]);
  };

  const deleteAccount = (id: string) => {
    setAccountsState(prev => prev.filter(a => a.id !== id));
    deleteData('accounts', id);
  };

  const addCard = (card: CreditCard) => {
    setCreditCardsState(prev => [...prev, card]);
    upsertData('credit_cards', [
      { id: card.id, name: card.name, limit_amount: card.limit, closing_day: card.closingDay, due_day: card.dueDay, color: card.color }
    ]);
  };

  const updateCard = (card: CreditCard) => {
    setCreditCardsState(prev => prev.map(c => c.id === card.id ? card : c));
    upsertData('credit_cards', [
      { id: card.id, name: card.name, limit_amount: card.limit, closing_day: card.closingDay, due_day: card.dueDay, color: card.color }
    ]);
  };

  const deleteCard = (id: string) => {
    setCreditCardsState(prev => prev.filter(c => c.id !== id));
    deleteData('credit_cards', id);
  };

  const addTransaction = (inputTx: Transaction) => {
    // Ensure we have a valid Date object or ISO string
    const tx = { ...inputTx };
    setTransactionsState(prev => [tx, ...prev]);

    upsertData('transactions', [
      {
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        account_id: tx.accountId,
        card_id: tx.cardId,
        category: tx.category,
        destination_account_id: tx.destinationAccountId,
        recurrence: tx.recurrence
      }
    ]);
  };

  const updateTransaction = (inputTx: Transaction) => {
    const tx = { ...inputTx };
    setTransactionsState(prev => prev.map(t => t.id === tx.id ? tx : t));

    upsertData('transactions', [
      {
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        account_id: tx.accountId,
        card_id: tx.cardId,
        category: tx.category,
        destination_account_id: tx.destinationAccountId,
        recurrence: tx.recurrence
      }
    ]);
  };

  const deleteTransaction = (id: string) => {
    setTransactionsState(prev => prev.filter(t => t.id !== id));
    deleteData('transactions', id);
  };


  // --- SPLIT SYNC EFFECTS ---
  // MO: We are moving away from the "Watcher Effect" pattern for critical data (Finance)
  // because it causes loops and race conditions. 
  // We now use explicit actions (addAccount, deleteAccount, etc.) which handle both Local State and Remote Sync.
  // The effects below will remain for "Passive" syncing (e.g. initial load or background updates), 
  // but we should avoid using them for user-initiated actions if possible to prevent the "Zombie Return" bug.

  // 1. Sync Tasks (Keep as is for now, low risk)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_tasks', JSON.stringify(tasks));
    if (user && !isInitialLoad.current) {
      // Debounce only for rapid text changes, functionality remains similar
      const timer = setTimeout(() => {
        upsertData('tasks', tasks.map(t => ({ id: t.id, text: t.title, completed: t.completed, notes: t.notes })));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tasks, isLoaded, user, upsertData]);

  // 2. Sync Finance (Transactions, Accounts, Cards) 
  // CHANGED: Only update LocalStorage here. Remote sync is done via actions.
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_transactions', JSON.stringify(transactions));
    localStorage.setItem('glass_accounts', JSON.stringify(accounts));
    localStorage.setItem('glass_credit_cards', JSON.stringify(creditCards));
  }, [transactions, accounts, creditCards, isLoaded]); // Removed user/upsertData dependency to stop auto-sync loop

  // 3. Sync Shopping
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_shopping', JSON.stringify(shoppingList));
    if (user && !isInitialLoad.current) {
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
      const timer = setTimeout(() => {
        upsertData('pets', pets.map(p => ({
          id: p.id, name: p.name, type: p.type, breed: p.breed, birth_date: p.birthDate, microchip: p.microchip,
          weight_history: p.weightHistory, vaccines: p.vaccines
        })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pets, isLoaded, user, upsertData]);

  // 5. Sync Meu Apê
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('ape_phases', JSON.stringify(apePhases));
    if (user && !isInitialLoad.current && apePhases.length > 0) {
      upsertData('ape_phases', apePhases.map(p => ({ id: p.id, name: p.name, status: p.status, progress: p.progress })));
    }
  }, [apePhases, isLoaded, user, upsertData]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('ape_notes', JSON.stringify(apeNotes));
    if (user && !isInitialLoad.current && apeNotes.length > 0) {
      const timer = setTimeout(() => {
        upsertData('ape_notes', apeNotes.map(n => ({ id: n.id, title: n.title, content: n.content })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [apeNotes, isLoaded, user, upsertData]);

  // 6. Sync Others (Local Only or Less Frequent)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('glass_dashboard_layout', JSON.stringify(dashboardLayout));
      localStorage.setItem('glass_budgets', JSON.stringify(budgets));
      localStorage.setItem('glass_memory', JSON.stringify(memory));
      if (profileImage) localStorage.setItem('glass_profile_image', JSON.stringify(profileImage));
    }
  }, [dashboardLayout, memory, profileImage, isLoaded]);

  // --- BUDGET LOGIC ---
  const addBudget = (budget: Budget) => {
    setBudgetsState(prev => [...prev, budget]);
    upsertData('budgets', [
      { id: budget.id, category: budget.category, amount: budget.amount, spent: budget.spent }
    ]);
  };

  const updateBudget = (budget: Budget) => {
    setBudgetsState(prev => prev.map(b => b.id === budget.id ? budget : b));
    upsertData('budgets', [
      { id: budget.id, category: budget.category, amount: budget.amount, spent: budget.spent }
    ]);
  };

  const deleteBudget = (id: string) => {
    setBudgetsState(prev => prev.filter(b => b.id !== id));
    deleteData('budgets', id);
  };

  // --- GOALS LOGIC ---
  const [goals, setGoalsState] = useState<Goal[]>([]);

  const addGoal = (goal: Goal) => {
    setGoalsState(prev => [...prev, goal]);
    upsertData('goals', [
      {
        id: goal.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        icon: goal.icon,
        color: goal.color
      }
    ]);
  };

  const updateGoal = (goal: Goal) => {
    setGoalsState(prev => prev.map(g => g.id === goal.id ? goal : g));
    upsertData('goals', [
      {
        id: goal.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline,
        icon: goal.icon,
        color: goal.color
      }
    ]);
  };

  const deleteGoal = (id: string) => {
    setGoalsState(prev => prev.filter(g => g.id !== id));
    deleteData('goals', id);
  };

  // Sync Goals
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('glass_goals', JSON.stringify(goals));
    // No auto-sync watcher to avoid loops, rely on actions
  }, [goals, isLoaded]);

  // Load Goals on Init
  useEffect(() => {
    const savedGoals = localStorage.getItem('glass_goals');
    if (savedGoals) setGoalsState(JSON.parse(savedGoals));
  }, []);

  // Fetch Goals Remote
  useEffect(() => {
    if (user) {
      supabase.from('goals').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data) {
          setGoalsState(data.map(g => ({
            id: g.id,
            name: g.name,
            targetAmount: g.target_amount,
            currentAmount: g.current_amount,
            deadline: g.deadline,
            icon: g.icon,
            color: g.color
          })));
        }
      });
    }
  }, [user]);

  return (
    <DataContext.Provider value={{
      user,
      tasks, setTasks: setTasksState,
      transactions,
      setTransactions: setTransactionsState,
      addTransaction, updateTransaction, deleteTransaction,

      shoppingList, setShoppingList: setShoppingListState,
      pets, setPets: setPetsState,
      apePhases, setApePhases: setApePhasesState,
      apeNotes, setApeNotes: setApeNotesState,

      accounts,
      setAccounts: setAccountsState,
      addAccount, updateAccount, deleteAccount,

      creditCards,
      setCreditCards: setCreditCardsState,
      addCard, updateCard, deleteCard,

      dashboardLayout, setDashboardLayout: setDashboardLayoutState,

      budgets,
      setBudgets: setBudgetsState,
      addBudget, updateBudget, deleteBudget,

      goals,
      setGoals: setGoalsState,
      addGoal, updateGoal, deleteGoal,

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