-- Add optional expiration date to costi_fissi
ALTER TABLE public.costi_fissi 
ADD COLUMN data_scadenza date DEFAULT NULL;