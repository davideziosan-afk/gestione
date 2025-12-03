import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAllFasiProgetto() {
  return useQuery({
    queryKey: ["all_fasi_progetto"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fasi_progetto")
        .select("progetto_id, tipo, stato, importo");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAllMovimentiFissiConProgetto() {
  return useQuery({
    queryKey: ["all_movimenti_fissi_con_progetto"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .select("progetto_id, stato, importo")
        .not("progetto_id", "is", null);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectCostsMap() {
  const { data: fasi } = useAllFasiProgetto();
  const { data: movimentiFissi } = useAllMovimentiFissiConProgetto();
  
  // Calculate costs per project
  const costsMap = new Map<string, { costiEffettivi: number; ricaviEffettivi: number }>();
  
  // Costs from project phases
  fasi?.forEach((fase) => {
    const current = costsMap.get(fase.progetto_id) || { costiEffettivi: 0, ricaviEffettivi: 0 };
    
    if (fase.tipo === 'Costo' && fase.stato === 'Pagato') {
      current.costiEffettivi += parseFloat(String(fase.importo));
    }
    if (fase.tipo === 'Ricavo' && fase.stato === 'Incassato') {
      current.ricaviEffettivi += parseFloat(String(fase.importo));
    }
    
    costsMap.set(fase.progetto_id, current);
  });

  // Costs from movimenti fissi associated to projects
  movimentiFissi?.forEach((movimento) => {
    if (movimento.progetto_id && movimento.stato === 'Pagato') {
      const current = costsMap.get(movimento.progetto_id) || { costiEffettivi: 0, ricaviEffettivi: 0 };
      current.costiEffettivi += parseFloat(String(movimento.importo));
      costsMap.set(movimento.progetto_id, current);
    }
  });
  
  return costsMap;
}
