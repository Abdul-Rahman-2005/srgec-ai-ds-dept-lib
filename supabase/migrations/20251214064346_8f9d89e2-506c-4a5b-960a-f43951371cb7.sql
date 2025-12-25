-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'librarian');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'rejected');

-- Create enum for borrow status
CREATE TYPE public.borrow_status AS ENUM ('borrowed', 'returned');

-- Create users table (profiles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  roll_or_faculty_id TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  edition TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  cover_url TEXT,
  category TEXT,
  isbn TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create borrows table
CREATE TABLE public.borrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 months'),
  returned_at DATE,
  status borrow_status NOT NULL DEFAULT 'borrowed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create magazines table
CREATE TABLE public.magazines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  issue_number TEXT NOT NULL,
  publication_date DATE NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journals table
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_editor TEXT NOT NULL,
  journal_name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publication_date DATE NOT NULL,
  category TEXT,
  volume TEXT,
  issue TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CSP project files table
CREATE TABLE public.csp_project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csp_project_files ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is librarian
CREATE OR REPLACE FUNCTION public.is_librarian()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role = 'librarian'
    AND status = 'active'
  )
$$;

-- Create function to check if user is active
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND status = 'active'
  )
$$;

-- Create function to get current user id
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1
$$;

-- RLS Policies for users table
CREATE POLICY "Anyone can insert users (signup)" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth_id = auth.uid() OR public.is_librarian());

CREATE POLICY "Librarian can update users" ON public.users
  FOR UPDATE USING (public.is_librarian());

-- RLS Policies for books table (public read)
CREATE POLICY "Anyone can view books" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Librarian can insert books" ON public.books
  FOR INSERT WITH CHECK (public.is_librarian());

CREATE POLICY "Librarian can update books" ON public.books
  FOR UPDATE USING (public.is_librarian());

CREATE POLICY "Librarian can delete books" ON public.books
  FOR DELETE USING (public.is_librarian());

-- RLS Policies for borrows table
CREATE POLICY "Users can view their own borrows" ON public.borrows
  FOR SELECT USING (user_id = public.get_current_user_id() OR public.is_librarian());

CREATE POLICY "Librarian can insert borrows" ON public.borrows
  FOR INSERT WITH CHECK (public.is_librarian());

CREATE POLICY "Librarian can update borrows" ON public.borrows
  FOR UPDATE USING (public.is_librarian());

-- RLS Policies for magazines (public read)
CREATE POLICY "Anyone can view magazines" ON public.magazines
  FOR SELECT USING (true);

CREATE POLICY "Librarian can manage magazines" ON public.magazines
  FOR ALL USING (public.is_librarian());

-- RLS Policies for journals (public read)
CREATE POLICY "Anyone can view journals" ON public.journals
  FOR SELECT USING (true);

CREATE POLICY "Librarian can manage journals" ON public.journals
  FOR ALL USING (public.is_librarian());

-- RLS Policies for CSP files
CREATE POLICY "Active users can view CSP files" ON public.csp_project_files
  FOR SELECT USING (true);

CREATE POLICY "Librarian can manage CSP files" ON public.csp_project_files
  FOR ALL USING (public.is_librarian());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_magazines_updated_at
  BEFORE UPDATE ON public.magazines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for CSP files
INSERT INTO storage.buckets (id, name, public) VALUES ('csp-files', 'csp-files', true);

-- Storage policies
CREATE POLICY "Anyone can view CSP files" ON storage.objects
  FOR SELECT USING (bucket_id = 'csp-files');

CREATE POLICY "Librarian can upload CSP files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'csp-files');