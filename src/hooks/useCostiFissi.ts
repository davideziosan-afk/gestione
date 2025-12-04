import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addMonths, startOfMonth } from "date-fns";

export function useCostiFissi() {
  return useQuery({
    queryKey: ["costi_fissi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("costi_fissi")
        .select("*")
        .order("voce");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useMovimentiFissi() {
  return useQuery({
    queryKey: ["movimenti_fissi"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .select("*")
        .order("mese", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCostoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (costo: {
      voce: string;
      importo_mensile: number;
      giorno_scadenza: number;
      categoria: string;
      note?: string | null;
      frequenza_mesi?: number;
      pagamento_automatico?: boolean;
      data_scadenza?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("costi_fissi")
        .insert({
          ...costo,
          frequenza_mesi: costo.frequenza_mesi || 1,
          pagamento_automatico: costo.pagamento_automatico || false,
          data_scadenza: costo.data_scadenza || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Automatically generate 12 months of movements
      const frequenza = costo.frequenza_mesi || 1;
      const pagamentoAutomatico = costo.pagamento_automatico || false;
      const dataScadenza = costo.data_scadenza ? new Date(costo.data_scadenza) : null;
      const movimenti = [];
      const today = new Date();
      
      for (let i = 0; i < 12; i += frequenza) {
        const mese = startOfMonth(addMonths(today, i));
        const dataPrevista = new Date(mese);
        dataPrevista.setDate(costo.giorno_scadenza);
        
        // Skip if past expiration date
        if (dataScadenza && dataPrevista > dataScadenza) {
          break;
        }
        
        const dataPrevistaStr = dataPrevista.toISOString().split('T')[0];
        
        movimenti.push({
          costo_fisso_id: data.id,
          mese: mese.toISOString().split('T')[0],
          data_prevista: dataPrevistaStr,
          importo: costo.importo_mensile,
          stato: pagamentoAutomatico ? "Pagato" : "Previsto",
          data_effettiva: pagamentoAutomatico ? dataPrevistaStr : null,
          categoria: costo.categoria,
          note: costo.voce,
        });
      }
      
      const { error: movError } = await supabase
        .from("movimenti_fissi")
        .insert(movimenti);
      
      if (movError) throw movError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costi_fissi"] });
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Costo fisso creato e movimenti generati");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useUpdateCostoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...costo }: {
      id: string;
      voce?: string;
      importo_mensile?: number;
      giorno_scadenza?: number;
      categoria?: string;
      note?: string | null;
      frequenza_mesi?: number;
      pagamento_automatico?: boolean;
      data_scadenza?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("costi_fissi")
        .update(costo)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costi_fissi"] });
      toast.success("Costo fisso aggiornato");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useGenerateMovimentiFissi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (costoFissoId: string) => {
      // Get the costo fisso
      const { data: costo, error: costoError } = await supabase
        .from("costi_fissi")
        .select("*")
        .eq("id", costoFissoId)
        .single();
      
      if (costoError) throw costoError;
      
      const frequenza = (costo as any).frequenza_mesi || 1;
      const pagamentoAutomatico = (costo as any).pagamento_automatico || false;
      const movimenti = [];
      const today = new Date();
      
      // Generate 12 months worth of movements based on frequency
      for (let i = 0; i < 12; i += frequenza) {
        const mese = startOfMonth(addMonths(today, i));
        const dataPrevista = new Date(mese);
        dataPrevista.setDate(costo.giorno_scadenza);
        
        const dataPrevistaStr = dataPrevista.toISOString().split('T')[0];
        
        movimenti.push({
          costo_fisso_id: costo.id,
          mese: mese.toISOString().split('T')[0],
          data_prevista: dataPrevistaStr,
          importo: costo.importo_mensile,
          stato: pagamentoAutomatico ? "Pagato" : "Previsto",
          data_effettiva: pagamentoAutomatico ? dataPrevistaStr : null,
          categoria: costo.categoria,
          note: costo.voce,
        });
      }
      
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .insert(movimenti)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimenti generati con successo");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useUpdateMovimentoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...movimento }: {
      id: string;
      importo?: number;
      data_prevista?: string;
      categoria?: string;
      note?: string;
      stato?: "Previsto" | "Pagato" | "Fatturato" | "Incassato" | "Annullato";
      data_effettiva?: string | null;
      progetto_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .update(movimento)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimento aggiornato");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useMarkMovimentoAsPagato() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .update({ 
          stato: "Pagato", 
          data_effettiva: new Date().toISOString().split('T')[0] 
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimento marcato come pagato");
    },
  });
}

export function useCreateMovimentoUnaTantum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movimento: {
      descrizione: string;
      importo: number;
      data_prevista: string;
      categoria: string;
      note?: string;
      progetto_id?: string;
      stato?: "Previsto" | "Pagato";
    }) => {
      // We'll use movimenti_fissi with tipo_uscita = 'una_tantum' and a dummy costo_fisso_id
      // First create a temporary costo_fisso entry
      const { data: costoFisso, error: costoError } = await supabase
        .from("costi_fissi")
        .insert({
          voce: movimento.descrizione,
          importo_mensile: movimento.importo,
          giorno_scadenza: 1,
          categoria: movimento.categoria,
          note: movimento.note || null,
          attivo: false, // Mark as inactive since it's one-time
        })
        .select()
        .single();
      
      if (costoError) throw costoError;
      
      const isPagato = movimento.stato === "Pagato";
      
      // Then create the movimento
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .insert({
          costo_fisso_id: costoFisso.id,
          mese: movimento.data_prevista,
          data_prevista: movimento.data_prevista,
          importo: movimento.importo,
          stato: movimento.stato || "Previsto",
          categoria: movimento.categoria,
          note: movimento.descrizione,
          tipo_uscita: "una_tantum",
          progetto_id: movimento.progetto_id || null,
          data_effettiva: isPagato ? movimento.data_prevista : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimento creato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useMovimentiFissiByProgetto(progettoId?: string) {
  return useQuery({
    queryKey: ["movimenti_fissi_progetto", progettoId],
    queryFn: async () => {
      if (!progettoId) return [];
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .select("*")
        .eq("progetto_id", progettoId)
        .order("data_prevista", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!progettoId,
  });
}

export function useDeleteCostoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("costi_fissi")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costi_fissi"] });
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Costo fisso eliminato");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useDeleteMovimentoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movimenti_fissi")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimento eliminato");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}