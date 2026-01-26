-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public profiles, editable by user)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- QUESTIONS (Created by users/students)
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) not null,
  question_text text not null,
  options jsonb not null, -- Array of 4 strings
  correct_option_index integer not null check (correct_option_index between 0 and 3),
  explanation text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZZES (Collections of questions)
create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  time_limit_seconds integer default 600,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZ_QUESTIONS (Many-to-Many link)
create table public.quiz_questions (
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  primary key (quiz_id, question_id)
);

-- QUIZ_ATTEMPTS (History of taken quizzes)
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  quiz_id uuid references public.quizzes(id),
  score integer not null,
  total_questions integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Questions: Public read, Creator update/delete
create policy "Questions are viewable by everyone." on public.questions for select using (true);
create policy "Users can insert their own questions." on public.questions for insert with check (auth.uid() = creator_id);
create policy "Users can update own questions." on public.questions for update using (auth.uid() = creator_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
