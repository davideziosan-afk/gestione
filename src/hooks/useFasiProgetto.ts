import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFasiProgetto(progettoId?: string) {
  return useQuery({
    queryKey: ["fasi_progetto", progettoId],
    queryFn: async () => {
      let query = supabase
        .from("fasi_progetto")
        .select("*, progetti(codice, nome)")
        .order("data_prevista", { ascending: false });
      
      if (progettoId) {
        query = query.eq("progetto_id", progettoId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !progettoId || !!progettoId,
  });
}

export function useCreateFase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fase: any) => {
      const { data, error } = await supabase
        .from("fasi_progetto")
        .insert(fase)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Fase creata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante la creazione: " + error.message);
    },
  });
}

export function useUpdateFase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...fase }: any) => {
      const { data, error } = await supabase
        .from("fasi_progetto")
        .update(fase)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Fase aggiornata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante l'aggiornamento: " + error.message);
    },
  });
}

export function useDeleteFase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fasi_progetto")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Fase eliminata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante l'eliminazione: " + error.message);
    },
  });
}

export function useMarkAsIncassato() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("fasi_progetto")
        .update({ 
          stato: "Incassato", 
          data_effettiva: new Date().toISOString().split('T')[0] 
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      toast.success("Movimento marcato come incassato");
    },
  });
}

export function useMarkAsPagato() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("fasi_progetto")
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
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      toast.success("Movimento marcato come pagato");
    },
  });
}