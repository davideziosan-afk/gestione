import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCostiFissi, useMovimentiFissi, useCreateCostoFisso, useGenerateMovimentiFissi, useMarkMovimentoAsPagato } from "@/hooks/useCostiFissi";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { Plus, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CostiFissi() {
  const { data: costiFissi } = useCostiFissi();
  const { data: movimentiFissi } = useMovimentiFissi();
  const createCostoFisso = useCreateCostoFisso();
  const generateMovimenti = useGenerateMovimentiFissi();
  const markAsPagato = useMarkMovimentoAsPagato();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    voce: "",
    importo_mensile: "",
    giorno_scadenza: "1",
    categoria: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCostoFisso.mutateAsync(formData);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      voce: "",
      importo_mensile: "",
      giorno_scadenza: "1",
      categoria: "",
      note: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">costi fissi</h2>
          <p className="text-muted-foreground">gestisci i costi ricorrenti dello studio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              nuovo costo fisso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Costo Fisso</DialogTitle>
              <DialogDescription>Inserisci i dettagli del costo ricorrente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="voce">Voce</Label>
                <Input
                  id="voce"
                  value={formData.voce}
                  onChange={(e) => setFormData({ ...formData, voce: e.target.value })}
                  placeholder="es. Affitto, Commercialista"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="importo_mensile">Importo Mensile (€)</Label>
                  <Input
                    id="importo_mensile"
                    type="number"
                    step="0.01"
                    value={formData.importo_mensile}
                    onChange={(e) => setFormData({ ...formData, importo_mensile: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="giorno_scadenza">Giorno Scadenza (1-28)</Label>
                  <Input
                    id="giorno_scadenza"
                    type="number"
                    min="1"
                    max="28"
                    value={formData.giorno_scadenza}
                    onChange={(e) => setFormData({ ...formData, giorno_scadenza: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="es. Locazioni, Software"
                  required
                />
              </div>
              <div>
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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

      <Tabs defaultValue="costi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="costi">costi fissi</TabsTrigger>
          <TabsTrigger value="movimenti">movimenti generati</TabsTrigger>
        </TabsList>

        <TabsContent value="costi" className="space-y-4">
          <div className="border border-border">
            <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-secondary">
              <div className="col-span-3">voce</div>
              <div className="col-span-2">importo/mese</div>
              <div className="col-span-2">giorno scad.</div>
              <div className="col-span-2">categoria</div>
              <div className="col-span-2">note</div>
              <div className="col-span-1">azioni</div>
            </div>
            {costiFissi?.map((costo) => (
              <div key={costo.id} className="grid grid-cols-12 gap-4 p-4 border-t border-border items-center">
                <div className="col-span-3 font-medium">{costo.voce}</div>
                <div className="col-span-2">{formatCurrency(costo.importo_mensile)}</div>
                <div className="col-span-2">{costo.giorno_scadenza}</div>
                <div className="col-span-2">{costo.categoria}</div>
                <div className="col-span-2 text-sm text-muted-foreground">{costo.note || "-"}</div>
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateMovimenti.mutate(costo.id)}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Genera 12m
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="movimenti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimenti Fissi Generati</CardTitle>
              <CardDescription>Istanze mensili dei costi fissi</CardDescription>
            </CardHeader>
            <CardContent>
              {!movimentiFissi || movimentiFissi.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun movimento generato. Usa il pulsante "Genera 12m" per creare i movimenti mensili.
                </p>
              ) : (
                <div className="space-y-2">
                  {movimentiFissi.map((movimento) => (
                    <div key={movimento.id} className="flex items-center justify-between border border-border p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{movimento.note}</p>
                          <Badge variant={movimento.stato === 'Previsto' ? 'outline' : 'default'}>
                            {movimento.stato}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(movimento.data_prevista)} · {movimento.categoria}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{formatCurrency(movimento.importo)}</p>
                        {movimento.stato === 'Previsto' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsPagato.mutate(movimento.id)}
                            title="Marca come pagato"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}