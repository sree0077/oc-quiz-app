-- 1. Create subjects table
create table if not exists public.subjects (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add subject_id column to questions if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='questions' and column_name='subject_id') then
    alter table public.questions add column subject_id uuid references public.subjects(id) on delete set null;
  end if;
end $$;

-- 3. Enable RLS and setup policies
alter table public.subjects enable row level security;
alter table public.questions enable row level security;

-- Drop existing policies to avoid errors on retry
drop policy if exists "Subjects are viewable by everyone." on public.subjects;
drop policy if exists "Users can insert their own subjects." on public.subjects;
drop policy if exists "Users can delete own questions." on public.questions;

create policy "Subjects are viewable by everyone." on public.subjects for select using (true);
create policy "Users can insert their own subjects." on public.subjects for insert with check (auth.uid() = creator_id);
create policy "Users can delete own questions." on public.questions for delete using (auth.uid() = creator_id);
