-- Fix RLS policies to require authentication
-- All financial data should only be accessible to authenticated users

-- Drop existing permissive policies for progetti
DROP POLICY IF EXISTS "Tutti possono creare progetti" ON public.progetti;
DROP POLICY IF EXISTS "Tutti possono eliminare progetti" ON public.progetti;
DROP POLICY IF EXISTS "Tutti possono leggere progetti" ON public.progetti;
DROP POLICY IF EXISTS "Tutti possono modificare progetti" ON public.progetti;

-- Create authenticated-only policies for progetti
CREATE POLICY "Authenticated users can create progetti"
  ON public.progetti
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read progetti"
  ON public.progetti
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update progetti"
  ON public.progetti
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete progetti"
  ON public.progetti
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing permissive policies for fasi_progetto
DROP POLICY IF EXISTS "Tutti possono creare fasi" ON public.fasi_progetto;
DROP POLICY IF EXISTS "Tutti possono eliminare fasi" ON public.fasi_progetto;
DROP POLICY IF EXISTS "Tutti possono leggere fasi" ON public.fasi_progetto;
DROP POLICY IF EXISTS "Tutti possono modificare fasi" ON public.fasi_progetto;

-- Create authenticated-only policies for fasi_progetto
CREATE POLICY "Authenticated users can create fasi"
  ON public.fasi_progetto
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read fasi"
  ON public.fasi_progetto
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update fasi"
  ON public.fasi_progetto
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete fasi"
  ON public.fasi_progetto
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing permissive policies for costi_fissi
DROP POLICY IF EXISTS "Tutti possono creare costi fissi" ON public.costi_fissi;
DROP POLICY IF EXISTS "Tutti possono eliminare costi fissi" ON public.costi_fissi;
DROP POLICY IF EXISTS "Tutti possono leggere costi fissi" ON public.costi_fissi;
DROP POLICY IF EXISTS "Tutti possono modificare costi fissi" ON public.costi_fissi;

-- Create authenticated-only policies for costi_fissi
CREATE POLICY "Authenticated users can create costi_fissi"
  ON public.costi_fissi
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read costi_fissi"
  ON public.costi_fissi
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update costi_fissi"
  ON public.costi_fissi
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete costi_fissi"
  ON public.costi_fissi
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing permissive policies for movimenti_fissi
DROP POLICY IF EXISTS "Tutti possono creare movimenti fissi" ON public.movimenti_fissi;
DROP POLICY IF EXISTS "Tutti possono eliminare movimenti fissi" ON public.movimenti_fissi;
DROP POLICY IF EXISTS "Tutti possono leggere movimenti fissi" ON public.movimenti_fissi;
DROP POLICY IF EXISTS "Tutti possono modificare movimenti fissi" ON public.movimenti_fissi;

-- Create authenticated-only policies for movimenti_fissi
CREATE POLICY "Authenticated users can create movimenti_fissi"
  ON public.movimenti_fissi
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read movimenti_fissi"
  ON public.movimenti_fissi
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update movimenti_fissi"
  ON public.movimenti_fissi
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete movimenti_fissi"
  ON public.movimenti_fissi
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing permissive policies for company_price
DROP POLICY IF EXISTS "Tutti possono creare company price" ON public.company_price;
DROP POLICY IF EXISTS "Tutti possono eliminare company price" ON public.company_price;
DROP POLICY IF EXISTS "Tutti possono leggere company price" ON public.company_price;
DROP POLICY IF EXISTS "Tutti possono modificare company price" ON public.company_price;

-- Create authenticated-only policies for company_price
CREATE POLICY "Authenticated users can create company_price"
  ON public.company_price
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read company_price"
  ON public.company_price
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update company_price"
  ON public.company_price
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete company_price"
  ON public.company_price
  FOR DELETE
  TO authenticated
  USING (true);