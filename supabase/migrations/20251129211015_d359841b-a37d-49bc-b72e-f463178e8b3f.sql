-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crea tipo enum per stato progetto
CREATE TYPE stato_progetto AS ENUM ('Attivo', 'In attesa', 'Chiuso');

-- Crea tipo enum per tipo movimento
CREATE TYPE tipo_movimento AS ENUM ('Ricavo', 'Costo');

-- Crea tipo enum per stato movimento
CREATE TYPE stato_movimento AS ENUM ('Previsto', 'Incassato', 'Pagato');

-- Tabella Settings
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cassa_iniziale DECIMAL(10,2) DEFAULT 0 NOT NULL CHECK (cassa_iniziale >= 0),
  soglia_allerta_cassa DECIMAL(10,2) DEFAULT 5000 NOT NULL CHECK (soglia_allerta_cassa >= 0),
  orizzonte_previsioni_mesi INTEGER DEFAULT 6 NOT NULL CHECK (orizzonte_previsioni_mesi > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inserisci settings di default
INSERT INTO public.settings (cassa_iniziale, soglia_allerta_cassa, orizzonte_previsioni_mesi)
VALUES (0, 5000, 6);

-- Tabella Progetti
CREATE TABLE public.progetti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codice VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  stato stato_progetto DEFAULT 'Attivo' NOT NULL,
  budget_totale DECIMAL(10,2) NOT NULL CHECK (budget_totale >= 0),
  costi_stimati DECIMAL(10,2) NOT NULL CHECK (costi_stimati >= 0),
  data_inizio DATE NOT NULL,
  data_fine DATE,
  probabilita INTEGER DEFAULT 100 NOT NULL CHECK (probabilita >= 0 AND probabilita <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabella FasiProgetto
CREATE TABLE public.fasi_progetto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progetto_id UUID NOT NULL REFERENCES public.progetti(id) ON DELETE CASCADE,
  fase VARCHAR(100) NOT NULL,
  tipo tipo_movimento NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  importo DECIMAL(10,2) NOT NULL CHECK (importo > 0),
  stato stato_movimento DEFAULT 'Previsto' NOT NULL,
  data_prevista DATE NOT NULL,
  data_effettiva DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabella CostiFissi
CREATE TABLE public.costi_fissi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voce VARCHAR(255) NOT NULL,
  importo_mensile DECIMAL(10,2) NOT NULL CHECK (importo_mensile > 0),
  giorno_scadenza INTEGER NOT NULL CHECK (giorno_scadenza >= 1 AND giorno_scadenza <= 28),
  categoria VARCHAR(100) NOT NULL,
  note TEXT,
  attivo BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabella MovimentiFissi
CREATE TABLE public.movimenti_fissi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  costo_fisso_id UUID NOT NULL REFERENCES public.costi_fissi(id) ON DELETE CASCADE,
  mese DATE NOT NULL,
  data_prevista DATE NOT NULL,
  importo DECIMAL(10,2) NOT NULL CHECK (importo > 0),
  stato stato_movimento DEFAULT 'Previsto' NOT NULL,
  data_effettiva DATE,
  categoria VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabella CompanyPrice
CREATE TABLE public.company_price (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruolo VARCHAR(255) NOT NULL,
  prezzo_giornaliero DECIMAL(10,2) NOT NULL CHECK (prezzo_giornaliero > 0),
  billable_rate DECIMAL(10,2) NOT NULL CHECK (billable_rate > 0),
  attivo BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Abilita RLS su tutte le tabelle
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progetti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasi_progetto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costi_fissi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimenti_fissi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_price ENABLE ROW LEVEL SECURITY;

-- Policy per settings (tutti possono leggere, nessuno può modificare senza autenticazione)
CREATE POLICY "Tutti possono leggere settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Utenti autenticati possono modificare settings" ON public.settings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy per progetti (pubblico per MVP)
CREATE POLICY "Tutti possono leggere progetti" ON public.progetti FOR SELECT USING (true);
CREATE POLICY "Tutti possono creare progetti" ON public.progetti FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono modificare progetti" ON public.progetti FOR UPDATE USING (true);
CREATE POLICY "Tutti possono eliminare progetti" ON public.progetti FOR DELETE USING (true);

-- Policy per fasi_progetto (pubblico per MVP)
CREATE POLICY "Tutti possono leggere fasi" ON public.fasi_progetto FOR SELECT USING (true);
CREATE POLICY "Tutti possono creare fasi" ON public.fasi_progetto FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono modificare fasi" ON public.fasi_progetto FOR UPDATE USING (true);
CREATE POLICY "Tutti possono eliminare fasi" ON public.fasi_progetto FOR DELETE USING (true);

-- Policy per costi_fissi (pubblico per MVP)
CREATE POLICY "Tutti possono leggere costi fissi" ON public.costi_fissi FOR SELECT USING (true);
CREATE POLICY "Tutti possono creare costi fissi" ON public.costi_fissi FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono modificare costi fissi" ON public.costi_fissi FOR UPDATE USING (true);
CREATE POLICY "Tutti possono eliminare costi fissi" ON public.costi_fissi FOR DELETE USING (true);

-- Policy per movimenti_fissi (pubblico per MVP)
CREATE POLICY "Tutti possono leggere movimenti fissi" ON public.movimenti_fissi FOR SELECT USING (true);
CREATE POLICY "Tutti possono creare movimenti fissi" ON public.movimenti_fissi FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono modificare movimenti fissi" ON public.movimenti_fissi FOR UPDATE USING (true);
CREATE POLICY "Tutti possono eliminare movimenti fissi" ON public.movimenti_fissi FOR DELETE USING (true);

-- Policy per company_price (pubblico per MVP)
CREATE POLICY "Tutti possono leggere company price" ON public.company_price FOR SELECT USING (true);
CREATE POLICY "Tutti possono creare company price" ON public.company_price FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutti possono modificare company price" ON public.company_price FOR UPDATE USING (true);
CREATE POLICY "Tutti possono eliminare company price" ON public.company_price FOR DELETE USING (true);

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progetti_updated_at BEFORE UPDATE ON public.progetti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fasi_progetto_updated_at BEFORE UPDATE ON public.fasi_progetto FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_costi_fissi_updated_at BEFORE UPDATE ON public.costi_fissi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimenti_fissi_updated_at BEFORE UPDATE ON public.movimenti_fissi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_price_updated_at BEFORE UPDATE ON public.company_price FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_fasi_progetto_progetto_id ON public.fasi_progetto(progetto_id);
CREATE INDEX idx_fasi_progetto_data_prevista ON public.fasi_progetto(data_prevista);
CREATE INDEX idx_fasi_progetto_stato ON public.fasi_progetto(stato);
CREATE INDEX idx_movimenti_fissi_costo_fisso_id ON public.movimenti_fissi(costo_fisso_id);
CREATE INDEX idx_movimenti_fissi_mese ON public.movimenti_fissi(mese);
CREATE INDEX idx_movimenti_fissi_stato ON public.movimenti_fissi(stato);