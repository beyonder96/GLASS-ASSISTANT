-- ATUALIZAÇÃO DO BANCO DE DADOS - GLASS ASSISTANT FINANCIAL HUB

-- 1. CRIAR TABELA DE ORÇAMENTOS (BUDGETS)
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  amount numeric not null,
  spent numeric default 0, -- Opcional, pois calculamos no front, mas bom ter persistido
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar segurança (RLS) para Budgets
alter table public.budgets enable row level security;

-- Política de segurança
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own budgets.') then
    create policy "Users can CRUD own budgets." on public.budgets for all using (auth.uid() = user_id);
  end if;
end $$;


-- 2. CRIAR TABELA DE METAS (GOALS)
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar segurança (RLS) para Goals
alter table public.goals enable row level security;

-- Política de segurança
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own goals.') then
    create policy "Users can CRUD own goals." on public.goals for all using (auth.uid() = user_id);
  end if;
end $$;


-- 3. ATUALIZAR TABELA DE TRANSAÇÕES (TRANSACTIONS)
-- Adiciona colunas para suportar Transferências e Recorrência
do $$ 
begin
  -- Adicionar coluna para conta destino (usada em transferências)
  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'destination_account_id') then
    alter table public.transactions add column destination_account_id uuid references public.accounts(id);
  end if;

  -- Adicionar coluna para recorrência (ex: 'monthly', 'weekly')
  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'recurrence') then
    alter table public.transactions add column recurrence text;
  end if;
end $$;
