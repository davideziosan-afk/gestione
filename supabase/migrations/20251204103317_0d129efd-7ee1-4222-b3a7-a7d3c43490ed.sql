-- Rimuovi il vecchio vincolo e aggiungi uno nuovo che permette giorni 1-31
ALTER TABLE public.costi_fissi DROP CONSTRAINT costi_fissi_giorno_scadenza_check;
ALTER TABLE public.costi_fissi ADD CONSTRAINT costi_fissi_giorno_scadenza_check CHECK (giorno_scadenza >= 1 AND giorno_scadenza <= 31);