-- 1. Add new values to stato_movimento enum
ALTER TYPE stato_movimento ADD VALUE IF NOT EXISTS 'Fatturato';
ALTER TYPE stato_movimento ADD VALUE IF NOT EXISTS 'Annullato';

-- 2. Add new date columns to fasi_progetto
ALTER TABLE public.fasi_progetto
ADD COLUMN IF NOT EXISTS data_prevista_fattura date,
ADD COLUMN IF NOT EXISTS data_effettiva_fattura date,
ADD COLUMN IF NOT EXISTS data_prevista_pagamento date,
ADD COLUMN IF NOT EXISTS data_effettiva_pagamento date;

-- Rename existing columns for clarity (data_prevista -> data_prevista_pagamento if needed)
-- Actually, let's keep data_prevista and data_effettiva as they were for backward compatibility
-- The new columns will be used for invoice dates

-- 3. Create categorie table
CREATE TABLE IF NOT EXISTS public.categorie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  tipo varchar NOT NULL DEFAULT 'uscita', -- 'entrata' or 'uscita'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categorie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categorie" ON public.categorie
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create categorie" ON public.categorie
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update categorie" ON public.categorie
FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete categorie" ON public.categorie
FOR DELETE USING (true);

-- 4. Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tags" ON public.tags
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.tags
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tags" ON public.tags
FOR DELETE USING (true);

-- 5. Create junction table for fasi_progetto tags
CREATE TABLE IF NOT EXISTS public.fase_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id uuid NOT NULL REFERENCES public.fasi_progetto(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(fase_id, tag_id)
);

ALTER TABLE public.fase_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read fase_tags" ON public.fase_tags
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create fase_tags" ON public.fase_tags
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fase_tags" ON public.fase_tags
FOR DELETE USING (true);

-- 6. Create junction table for movimenti_fissi tags
CREATE TABLE IF NOT EXISTS public.movimento_fisso_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movimento_fisso_id uuid NOT NULL REFERENCES public.movimenti_fissi(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(movimento_fisso_id, tag_id)
);

ALTER TABLE public.movimento_fisso_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read movimento_fisso_tags" ON public.movimento_fisso_tags
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create movimento_fisso_tags" ON public.movimento_fisso_tags
FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can delete movimento_fisso_tags" ON public.movimento_fisso_tags
FOR DELETE USING (true);

-- 7. Add tipo_uscita to movimenti_fissi to distinguish recurring vs one-time
ALTER TABLE public.movimenti_fissi
ADD COLUMN IF NOT EXISTS tipo_uscita varchar NOT NULL DEFAULT 'fisso'; -- 'fisso' or 'una_tantum'

-- 8. Add categoria_id to tables for linking to categorie
ALTER TABLE public.fasi_progetto
ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorie(id);

ALTER TABLE public.movimenti_fissi
ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorie(id);

-- 9. Update trigger for categorie
CREATE TRIGGER update_categorie_updated_at
BEFORE UPDATE ON public.categorie
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();