-- Add progetto_id column to movimenti_fissi table
ALTER TABLE public.movimenti_fissi 
ADD COLUMN progetto_id uuid REFERENCES public.progetti(id) ON DELETE SET NULL;