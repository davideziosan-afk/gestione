import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProjects() {
  return useQuery({
    queryKey: ["progetti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progetti")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["progetti", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progetti")
        .select("*, fasi_progetto(*)")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: any) => {
      const { data, error } = await supabase
        .from("progetti")
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Progetto creato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante la creazione del progetto: " + error.message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...project }: any) => {
      const { data, error } = await supabase
        .from("progetti")
        .update(project)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Progetto aggiornato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante l'aggiornamento: " + error.message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("progetti")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progetti"] });
      toast.success("Progetto eliminato con successo");
    },
    onError: (error: any) => {
      toast.error("Errore durante l'eliminazione: " + error.message);
    },
  });
}