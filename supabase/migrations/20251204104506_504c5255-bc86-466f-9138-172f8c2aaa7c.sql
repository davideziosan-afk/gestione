-- Aggiungi colonna per pagamento automatico ai costi fissi
ALTER TABLE public.costi_fissi ADD COLUMN pagamento_automatico boolean NOT NULL DEFAULT false;