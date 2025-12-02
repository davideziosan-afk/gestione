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
    mutationFn: async (costo: any) => {
      const { data, error } = await supabase
        .from("costi_fissi")
        .insert(costo)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costi_fissi"] });
      toast.success("Costo fisso creato con successo");
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
      
      // Generate 12 months of movimenti
      const movimenti = [];
      const today = new Date();
      
      for (let i = 0; i < 12; i++) {
        const mese = startOfMonth(addMonths(today, i));
        const dataPrevista = new Date(mese);
        dataPrevista.setDate(costo.giorno_scadenza);
        
        movimenti.push({
          costo_fisso_id: costo.id,
          mese: mese.toISOString().split('T')[0],
          data_prevista: dataPrevista.toISOString().split('T')[0],
          importo: costo.importo_mensile,
          stato: "Previsto",
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
      toast.success("Generati 12 mesi di movimenti fissi");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useUpdateMovimentoFisso() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...movimento }: any) => {
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