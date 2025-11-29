import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/dateUtils";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function CompanyPrice() {
  const queryClient = useQueryClient();

  const { data: companyPrices, isLoading } = useQuery({
    queryKey: ["company_price"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_price")
        .select("*")
        .order("ruolo");
      if (error) throw error;
      return data;
    },
  });

  const createPrice = useMutation({
    mutationFn: async (price: any) => {
      const { data, error } = await supabase
        .from("company_price")
        .insert(price)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_price"] });
      toast.success("Tariffa creata con successo");
    },
  });

  const updatePrice = useMutation({
    mutationFn: async ({ id, ...price }: any) => {
      const { data, error } = await supabase
        .from("company_price")
        .update(price)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_price"] });
      toast.success("Tariffa aggiornata con successo");
    },
  });

  const deletePrice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("company_price")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company_price"] });
      toast.success("Tariffa eliminata con successo");
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [formData, setFormData] = useState({
    ruolo: "",
    prezzo_giornaliero: "",
    billable_rate: "",
  });

  const [simulazione, setSimulazione] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPrice) {
      await updatePrice.mutateAsync({ id: selectedPrice.id, ...formData });
    } else {
      await createPrice.mutateAsync(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      ruolo: "",
      prezzo_giornaliero: "",
      billable_rate: "",
    });
    setSelectedPrice(null);
  };

  const calcolaCostoProgetto = () => {
    let totale = 0;
    companyPrices?.forEach(price => {
      const giorni = parseFloat(simulazione[price.id] || "0");
      if (giorni > 0) {
        totale += giorni * parseFloat(String(price.prezzo_giornaliero));
      }
    });
    return totale;
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">tariffe</h2>
          <p className="text-muted-foreground">gestisci le tariffe giornaliere dei ruoli</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              nuova tariffa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPrice ? "Modifica Tariffa" : "Nuova Tariffa"}</DialogTitle>
              <DialogDescription>Inserisci i dettagli della tariffa giornaliera</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="ruolo">Ruolo</Label>
                <Input
                  id="ruolo"
                  value={formData.ruolo}
                  onChange={(e) => setFormData({ ...formData, ruolo: e.target.value })}
                  placeholder="es. Davide – Architect"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prezzo_giornaliero">Costo Interno (€/giorno)</Label>
                <Input
                  id="prezzo_giornaliero"
                  type="number"
                  step="0.01"
                  value={formData.prezzo_giornaliero}
                  onChange={(e) => setFormData({ ...formData, prezzo_giornaliero: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billable_rate">Billable Rate (€/giorno)</Label>
                <Input
                  id="billable_rate"
                  type="number"
                  step="0.01"
                  value={formData.billable_rate}
                  onChange={(e) => setFormData({ ...formData, billable_rate: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">Salva</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tariffe Table */}
      <div className="border border-border">
        <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-secondary">
          <div className="col-span-4">ruolo</div>
          <div className="col-span-3">costo interno</div>
          <div className="col-span-3">billable rate</div>
          <div className="col-span-2">azioni</div>
        </div>
        {companyPrices?.map((price) => (
          <div key={price.id} className="grid grid-cols-12 gap-4 p-4 border-t border-border items-center">
            <div className="col-span-4 font-medium flex items-center gap-2">
              {price.ruolo}
              {price.attivo && <Badge variant="outline">attivo</Badge>}
            </div>
            <div className="col-span-3">{formatCurrency(price.prezzo_giornaliero)}/giorno</div>
            <div className="col-span-3">{formatCurrency(price.billable_rate)}/giorno</div>
            <div className="col-span-2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedPrice(price);
                  setFormData({
                    ruolo: price.ruolo,
                    prezzo_giornaliero: String(price.prezzo_giornaliero),
                    billable_rate: String(price.billable_rate),
                  });
                  setDialogOpen(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Eliminare questa tariffa?")) {
                    deletePrice.mutate(price.id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>simulazione costo progetto</CardTitle>
          <CardDescription>calcola il costo interno stimato per un progetto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companyPrices?.map((price) => (
            <div key={price.id} className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor={`sim-${price.id}`}>{price.ruolo}</Label>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(price.prezzo_giornaliero)}/giorno
                </p>
              </div>
              <div className="w-32">
                <Input
                  id={`sim-${price.id}`}
                  type="number"
                  step="0.5"
                  placeholder="Giorni"
                  value={simulazione[price.id] || ""}
                  onChange={(e) => setSimulazione({ ...simulazione, [price.id]: e.target.value })}
                />
              </div>
              <div className="w-32 text-right font-bold">
                {formatCurrency(
                  parseFloat(simulazione[price.id] || "0") * parseFloat(String(price.prezzo_giornaliero))
                )}
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">totale costo interno stimato</p>
              <p className="text-2xl font-bold">{formatCurrency(calcolaCostoProgetto())}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}