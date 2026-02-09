-- Create Accounts Table
create table public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('checking', 'savings', 'investment', 'cash', 'other')) not null,
  balance numeric default 0,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.accounts enable row level security;
create policy "Users can CRUD own accounts." on public.accounts for all using (auth.uid() = user_id);

-- Create Credit Cards Table
create table public.credit_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  limit_amount numeric default 0,
  closing_day integer,
  due_day integer,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.credit_cards enable row level security;
create policy "Users can CRUD own credit cards." on public.credit_cards for all using (auth.uid() = user_id);

-- Update Tasks Table with Notes
alter table public.tasks add column if not exists notes text;

-- Update Transactions Table with Account/Card Links
alter table public.transactions add column if not exists account_id uuid references public.accounts(id);
alter table public.transactions add column if not exists card_id uuid references public.credit_cards(id);
alter table public.transactions add column if not exists category text; 
