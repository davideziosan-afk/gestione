import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({ nome })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag eliminato");
    },
    onError: (error: any) => {
      toast.error("Errore: " + error.message);
    },
  });
}

export function useFaseTags(faseId?: string) {
  return useQuery({
    queryKey: ["fase_tags", faseId],
    queryFn: async () => {
      if (!faseId) return [];
      const { data, error } = await supabase
        .from("fase_tags")
        .select("*, tags(*)")
        .eq("fase_id", faseId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!faseId,
  });
}

export function useAddFaseTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ faseId, tagId }: { faseId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from("fase_tags")
        .insert({ fase_id: faseId, tag_id: tagId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fase_tags"] });
    },
  });
}

export function useRemoveFaseTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ faseId, tagId }: { faseId: string; tagId: string }) => {
      const { error } = await supabase
        .from("fase_tags")
        .delete()
        .eq("fase_id", faseId)
        .eq("tag_id", tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fase_tags"] });
    },
  });
}
