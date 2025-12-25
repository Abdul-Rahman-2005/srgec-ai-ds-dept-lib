-- Revert ON DELETE CASCADE change on csp_project_files.uploaded_by
ALTER TABLE public.csp_project_files
  DROP CONSTRAINT IF EXISTS csp_project_files_uploaded_by_fkey;

ALTER TABLE public.csp_project_files
  ADD CONSTRAINT csp_project_files_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.users(id);

-- Remove librarian delete policy on users (revert to previous state)
DROP POLICY IF EXISTS "Librarian can delete users" ON public.users;

