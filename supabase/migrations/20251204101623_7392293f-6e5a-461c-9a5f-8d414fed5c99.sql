-- Add frequency field to costi_fissi (1 = monthly, 2 = bimonthly, 3 = quarterly, 6 = semiannual, 12 = annual)
ALTER TABLE public.costi_fissi 
ADD COLUMN frequenza_mesi integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.costi_fissi.frequenza_mesi IS 'Frequenza in mesi: 1=mensile, 2=bimestrale, 3=trimestrale, 6=semestrale, 12=annuale';