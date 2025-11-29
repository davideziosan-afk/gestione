import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUserApprovalStatus(userId?: string) {
  return useQuery({
    queryKey: ["user-approval", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("user_approvals")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_approvals")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("user_approvals")
        .update({
          approved: true,
          approved_by: currentUser.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast.success("utente approvato");
    },
    onError: (error: any) => {
      toast.error("errore: " + error.message);
    },
  });
}

export function useRejectUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from("user_approvals")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
      
      // Delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast.success("utente rifiutato");
    },
    onError: (error: any) => {
      toast.error("errore: " + error.message);
    },
  });
}

export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!userId,
  });
}
