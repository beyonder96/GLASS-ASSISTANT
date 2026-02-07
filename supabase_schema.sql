-- Enable RLS
alter table auth.users enable row level security;

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(name) >= 3)
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- TASKS
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.tasks enable row level security;
create policy "Users can CRUD own tasks." on public.tasks for all using (auth.uid() = user_id);

-- TRANSACTIONS (Finance)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
create policy "Users can CRUD own transactions." on public.transactions for all using (auth.uid() = user_id);

-- SHOPPING LIST
create table public.shopping_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.shopping_items enable row level security;
create policy "Users can CRUD own shopping items." on public.shopping_items for all using (auth.uid() = user_id);

-- PETS
create table public.pets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  breed text,
  birth_date date,
  microchip text,
  weight_history jsonb default '[]'::jsonb,
  vaccines jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.pets enable row level security;
create policy "Users can CRUD own pets." on public.pets for all using (auth.uid() = user_id);

-- Automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
