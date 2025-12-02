import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCategorie() {
  return useQuery({
    queryKey: ["categorie"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorie")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoria: { nome: string; tipo: string }) => {
      const { data, error } = await supabase
        .from("categorie")
        .insert(categoria)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorie"] });
      toast.success("Categoria creata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...categoria }: { id: string; nome?: string; tipo?: string }) => {
      const { data, error } = await supabase
        .from("categorie")
        .update(categoria)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorie"] });
      toast.success("Categoria aggiornata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categorie")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorie"] });
      toast.success("Categoria eliminata con successo");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}
