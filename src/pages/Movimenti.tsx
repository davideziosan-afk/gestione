import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFasiProgetto, useDeleteFase, useMarkAsIncassato, useMarkAsPagato as useMarkFaseAsPagato, useUpdateFase } from "@/hooks/useFasiProgetto";
import { useMovimentiFissi, useCostiFissi, useCreateCostoFisso, useMarkMovimentoAsPagato, useDeleteCostoFisso, useDeleteMovimentoFisso, useCreateMovimentoUnaTantum, useUpdateMovimentoFisso, useUpdateCostoFisso } from "@/hooks/useCostiFissi";
import { useProjects } from "@/hooks/useProjects";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Trash2, Pencil, CreditCard } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FREQUENZE = [
  { value: "1", label: "Mensile" },
  { value: "2", label: "Bimestrale" },
  { value: "3", label: "Trimestrale" },
  { value: "6", label: "Semestrale" },
  { value: "12", label: "Annuale" },
];

export default function Movimenti() {
  const { data: fasi } = useFasiProgetto();
  const { data: movimentiFissi } = useMovimentiFissi();
  const { data: costiFissi } = useCostiFissi();
  const { data: progetti } = useProjects();
  const createCostoFisso = useCreateCostoFisso();
  const updateCostoFisso = useUpdateCostoFisso();
  
  const markAsPagato = useMarkMovimentoAsPagato();
  const deleteCostoFisso = useDeleteCostoFisso();
  const deleteMovimentoFisso = useDeleteMovimentoFisso();
  const deleteFase = useDeleteFase();
  const markFaseAsIncassato = useMarkAsIncassato();
  const markFaseAsPagato = useMarkFaseAsPagato();
  const createMovimentoUnaTantum = useCreateMovimentoUnaTantum();
  const updateMovimentoFisso = useUpdateMovimentoFisso();
  const updateFase = useUpdateFase();

  const [filters, setFilters] = useState({
    search: "",
    stato: "all",
    tipo: "all",
    tipoMovimento: "all",
  });

  const [costoDialogOpen, setCostoDialogOpen] = useState(false);
  const [movimentoDialogOpen, setMovimentoDialogOpen] = useState(false);
  const [editMovimentoDialogOpen, setEditMovimentoDialogOpen] = useState(false);
  const [editCostoDialogOpen, setEditCostoDialogOpen] = useState(false);
  
  const [costoForm, setCostoForm] = useState({
    id: "",
    voce: "",
    importo_mensile: "",
    giorno_scadenza: "1",
    categoria: "",
    note: "",
    frequenza_mesi: "1",
    pagamento_automatico: false,
    data_scadenza: "",
  });
  
  const [movimentoForm, setMovimentoForm] = useState({
    descrizione: "",
    importo: "",
    data_prevista: "",
    categoria: "",
    note: "",
    progetto_id: "",
    stato: "Previsto",
    dilazionato: false,
    numero_rate: "2",
    giorno_rata: "1",
    addebito_automatico: false,
  });

  const [editingMovimento, setEditingMovimento] = useState<{
    id: string;
    tipo: 'fisso' | 'progetto';
    importo: string;
    data_prevista: string;
    categoria: string;
    note: string;
    stato: string;
    progetto_id: string;
  } | null>(null);

  // Filter only active projects
  const progettiAttivi = progetti?.filter(p => p.stato === 'Attivo') || [];

  const handleCostoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCostoFisso.mutateAsync({
      voce: costoForm.voce,
      importo_mensile: parseFloat(costoForm.importo_mensile),
      giorno_scadenza: parseInt(costoForm.giorno_scadenza),
      categoria: costoForm.categoria,
      note: costoForm.note || null,
      frequenza_mesi: parseInt(costoForm.frequenza_mesi),
      pagamento_automatico: costoForm.pagamento_automatico,
      data_scadenza: costoForm.data_scadenza || null,
    });
    setCostoDialogOpen(false);
    setCostoForm({ id: "", voce: "", importo_mensile: "", giorno_scadenza: "1", categoria: "", note: "", frequenza_mesi: "1", pagamento_automatico: false, data_scadenza: "" });
  };

  const handleCostoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCostoFisso.mutateAsync({
      id: costoForm.id,
      voce: costoForm.voce,
      importo_mensile: parseFloat(costoForm.importo_mensile),
      giorno_scadenza: parseInt(costoForm.giorno_scadenza),
      categoria: costoForm.categoria,
      note: costoForm.note || null,
      frequenza_mesi: parseInt(costoForm.frequenza_mesi),
      pagamento_automatico: costoForm.pagamento_automatico,
      data_scadenza: costoForm.data_scadenza || null,
    });
    setEditCostoDialogOpen(false);
    setCostoForm({ id: "", voce: "", importo_mensile: "", giorno_scadenza: "1", categoria: "", note: "", frequenza_mesi: "1", pagamento_automatico: false, data_scadenza: "" });
  };

  const handleMovimentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMovimentoUnaTantum.mutateAsync({
      descrizione: movimentoForm.descrizione,
      importo: parseFloat(movimentoForm.importo),
      data_prevista: movimentoForm.data_prevista,
      categoria: movimentoForm.categoria,
      note: movimentoForm.note || undefined,
      progetto_id: movimentoForm.progetto_id || undefined,
      stato: movimentoForm.stato as "Previsto" | "Pagato",
      dilazionato: movimentoForm.dilazionato,
      numero_rate: movimentoForm.dilazionato ? parseInt(movimentoForm.numero_rate) : undefined,
      giorno_rata: movimentoForm.dilazionato ? parseInt(movimentoForm.giorno_rata) : undefined,
      addebito_automatico: movimentoForm.dilazionato ? movimentoForm.addebito_automatico : undefined,
    });
    setMovimentoDialogOpen(false);
    setMovimentoForm({ descrizione: "", importo: "", data_prevista: "", categoria: "", note: "", progetto_id: "", stato: "Previsto", dilazionato: false, numero_rate: "2", giorno_rata: "1", addebito_automatico: false });
  };

  const handleEditMovimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovimento) return;

    if (editingMovimento.tipo === 'fisso') {
      await updateMovimentoFisso.mutateAsync({
        id: editingMovimento.id,
        importo: parseFloat(editingMovimento.importo),
        data_prevista: editingMovimento.data_prevista,
        categoria: editingMovimento.categoria,
        note: editingMovimento.note,
        stato: editingMovimento.stato as "Previsto" | "Pagato" | "Fatturato" | "Incassato" | "Annullato",
        progetto_id: editingMovimento.progetto_id || null,
        data_effettiva: editingMovimento.stato === "Pagato" ? editingMovimento.data_prevista : null,
      });
    } else {
      await updateFase.mutateAsync({
        id: editingMovimento.id,
        importo: parseFloat(editingMovimento.importo),
        data_prevista: editingMovimento.data_prevista,
        categoria: editingMovimento.categoria,
        note: editingMovimento.note,
        stato: editingMovimento.stato as any,
      });
    }
    setEditMovimentoDialogOpen(false);
    setEditingMovimento(null);
  };

  const openEditMovimento = (movimento: any) => {
    setEditingMovimento({
      id: movimento.id,
      tipo: movimento.is_fisso ? 'fisso' : 'progetto',
      importo: String(movimento.importo),
      data_prevista: movimento.data_prevista,
      categoria: movimento.categoria,
      note: movimento.fase || movimento.note || "",
      stato: movimento.stato,
      progetto_id: movimento.progetto_id || "",
    });
    setEditMovimentoDialogOpen(true);
  };

  const openEditCosto = (costo: any) => {
    setCostoForm({
      id: costo.id,
      voce: costo.voce,
      importo_mensile: String(costo.importo_mensile),
      giorno_scadenza: String(costo.giorno_scadenza),
      categoria: costo.categoria,
      note: costo.note || "",
      frequenza_mesi: String(costo.frequenza_mesi || 1),
      pagamento_automatico: costo.pagamento_automatico || false,
      data_scadenza: costo.data_scadenza || "",
    });
    setEditCostoDialogOpen(true);
  };

  // Combine all movements
  const allMovimenti = [
    ...(fasi?.map(f => ({
      ...f,
      tipo_movimento: 'progetto',
      direzione: f.tipo === 'Ricavo' ? 'Entrata' : 'Uscita',
      nome: (f.progetti as any)?.nome || '-',
      is_fisso: false,
    })) || []),
    ...(movimentiFissi?.map(m => ({
      ...m,
      tipo_movimento: 'fisso',
      direzione: 'Uscita',
      tipo: 'Costo',
      fase: m.note,
      nome: '-',
      is_fisso: true,
    })) || [])
  ];

  // Apply filters
  const filteredMovimenti = allMovimenti
    .filter(m => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          (m.fase || '').toLowerCase().includes(searchLower) ||
          m.categoria.toLowerCase().includes(searchLower) ||
          m.nome.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(m => filters.stato === 'all' || m.stato === filters.stato)
    .filter(m => filters.tipo === 'all' || m.direzione === filters.tipo)
    .filter(m => {
      if (filters.tipoMovimento === 'all') return true;
      if (filters.tipoMovimento === 'fisso') return m.is_fisso;
      if (filters.tipoMovimento === 'progetto') return m.tipo_movimento === 'progetto';
      return true;
    })
    .sort((a, b) => new Date(b.data_prevista).getTime() - new Date(a.data_prevista).getTime());

  const getFrequenzaLabel = (mesi: number) => {
    return FREQUENZE.find(f => f.value === String(mesi))?.label || "Mensile";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">movimenti</h2>
          <p className="text-muted-foreground text-sm">tutti i movimenti finanziari</p>
        </div>
        <Dialog open={movimentoDialogOpen} onOpenChange={setMovimentoDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              nuovo costo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Costo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMovimentoSubmit} className="space-y-4">
              <div>
                <Label>Descrizione</Label>
                <Input
                  value={movimentoForm.descrizione}
                  onChange={(e) => setMovimentoForm({ ...movimentoForm, descrizione: e.target.value })}
                  placeholder="es. Acquisto attrezzatura"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Importo Totale (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={movimentoForm.importo}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, importo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{movimentoForm.dilazionato ? "Data Prima Rata" : "Data Prevista"}</Label>
                  <Input
                    type="date"
                    value={movimentoForm.data_prevista}
                    onChange={(e) => setMovimentoForm({ ...movimentoForm, data_prevista: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={movimentoForm.categoria}
                  onChange={(e) => setMovimentoForm({ ...movimentoForm, categoria: e.target.value })}
                  placeholder="es. Forniture, Servizi..."
                  required
                />
              </div>
              <div>
                <Label>Note (opzionale)</Label>
                <Input
                  value={movimentoForm.note}
                  onChange={(e) => setMovimentoForm({ ...movimentoForm, note: e.target.value })}
                />
              </div>
              <div>
                <Label>Progetto (opzionale)</Label>
                <Select
                  value={movimentoForm.progetto_id || "none"}
                  onValueChange={(value) => setMovimentoForm({ ...movimentoForm, progetto_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nessun progetto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun progetto</SelectItem>
                    {progettiAttivi.map((progetto) => (
                      <SelectItem key={progetto.id} value={progetto.id}>
                        {progetto.codice} - {progetto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stato {movimentoForm.dilazionato ? "Prima Rata" : ""}</Label>
                <Select
                  value={movimentoForm.stato}
                  onValueChange={(value) => setMovimentoForm({ ...movimentoForm, stato: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Previsto">Previsto</SelectItem>
                    <SelectItem value="Pagato">Pagato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dilazionato"
                  checked={movimentoForm.dilazionato}
                  onCheckedChange={(checked) => setMovimentoForm({ ...movimentoForm, dilazionato: checked === true })}
                />
                <Label htmlFor="dilazionato" className="text-sm font-normal cursor-pointer">
                  Costo dilazionato (suddiviso in rate)
                </Label>
              </div>
              {movimentoForm.dilazionato && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
                  <div>
                    <Label>Numero Rate</Label>
                    <Input
                      type="number"
                      min="2"
                      max="60"
                      value={movimentoForm.numero_rate}
                      onChange={(e) => setMovimentoForm({ ...movimentoForm, numero_rate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Giorno del Mese</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={movimentoForm.giorno_rata}
                      onChange={(e) => setMovimentoForm({ ...movimentoForm, giorno_rata: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Importo per rata: €{(parseFloat(movimentoForm.importo || "0") / parseInt(movimentoForm.numero_rate || "2")).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Checkbox
                      id="addebito_automatico"
                      checked={movimentoForm.addebito_automatico}
                      onCheckedChange={(checked) => setMovimentoForm({ ...movimentoForm, addebito_automatico: checked === true })}
                    />
                    <Label htmlFor="addebito_automatico" className="text-sm font-normal cursor-pointer">
                      Addebito automatico (segna tutte le rate come pagate alla data prevista)
                    </Label>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setMovimentoDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={createMovimentoUnaTantum.isPending}>
                  Salva
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Movement Dialog */}
      <Dialog open={editMovimentoDialogOpen} onOpenChange={setEditMovimentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Movimento</DialogTitle>
          </DialogHeader>
          {editingMovimento && (
            <form onSubmit={handleEditMovimento} className="space-y-4">
              <div>
                <Label>Descrizione</Label>
                <Input
                  value={editingMovimento.note}
                  onChange={(e) => setEditingMovimento({ ...editingMovimento, note: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Importo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingMovimento.importo}
                    onChange={(e) => setEditingMovimento({ ...editingMovimento, importo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Data Prevista</Label>
                  <Input
                    type="date"
                    value={editingMovimento.data_prevista}
                    onChange={(e) => setEditingMovimento({ ...editingMovimento, data_prevista: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={editingMovimento.categoria}
                  onChange={(e) => setEditingMovimento({ ...editingMovimento, categoria: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Stato</Label>
                <Select
                  value={editingMovimento.stato}
                  onValueChange={(value) => setEditingMovimento({ ...editingMovimento, stato: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Previsto">Previsto</SelectItem>
                    {editingMovimento.tipo === 'fisso' ? (
                      <SelectItem value="Pagato">Pagato</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="Fatturato">Fatturato</SelectItem>
                        <SelectItem value="Incassato">Incassato</SelectItem>
                        <SelectItem value="Pagato">Pagato</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {editingMovimento.tipo === 'fisso' && (
                <div>
                  <Label>Progetto (opzionale)</Label>
                  <Select
                    value={editingMovimento.progetto_id || "none"}
                    onValueChange={(value) => setEditingMovimento({ ...editingMovimento, progetto_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessun progetto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessun progetto</SelectItem>
                      {progetti?.map((progetto) => (
                        <SelectItem key={progetto.id} value={progetto.id}>
                          {progetto.codice} - {progetto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditMovimentoDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={updateMovimentoFisso.isPending || updateFase.isPending}>
                  Salva
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="tutti">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="tutti">tutti</TabsTrigger>
          <TabsTrigger value="costi-fissi">uscite</TabsTrigger>
        </TabsList>

        <TabsContent value="tutti">
          {/* Filters */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">filtri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">cerca</Label>
                  <Input
                    placeholder="cerca..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">stato</Label>
                  <Select value={filters.stato} onValueChange={(value) => setFilters({ ...filters, stato: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="Previsto">Previsto</SelectItem>
                      <SelectItem value="Fatturato">Fatturato</SelectItem>
                      <SelectItem value="Incassato">Incassato</SelectItem>
                      <SelectItem value="Pagato">Pagato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">direzione</Label>
                  <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="Entrata">Entrata</SelectItem>
                      <SelectItem value="Uscita">Uscita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">tipo</Label>
                  <Select value={filters.tipoMovimento} onValueChange={(value) => setFilters({ ...filters, tipoMovimento: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="progetto">Progetto</SelectItem>
                      <SelectItem value="fisso">Costo Fisso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">risultati ({filteredMovimenti.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredMovimenti.length === 0 ? (
                <p className="text-sm text-muted-foreground">nessun movimento trovato</p>
              ) : (
                <div className="space-y-2">
                  {filteredMovimenti.map((movimento) => (
                    <div key={`${movimento.tipo_movimento}-${movimento.id}`} className="border border-border p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{movimento.fase || movimento.note}</p>
                            <Badge variant={movimento.direzione === 'Entrata' ? 'default' : 'secondary'} className="text-xs">
                              {movimento.direzione}
                            </Badge>
                            <Badge variant={movimento.stato === 'Previsto' ? 'outline' : 'default'} className="text-xs">
                              {movimento.stato}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {movimento.is_fisso ? 'Fisso' : 'Progetto'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(movimento.data_prevista)}
                            {movimento.data_effettiva && ` → ${formatDate(movimento.data_effettiva)}`}
                            {' · '}{movimento.categoria}
                            {movimento.tipo_movimento === 'progetto' && movimento.nome !== '-' && ` · ${movimento.nome}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{formatCurrency(movimento.importo)}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditMovimento(movimento)}
                            title="Modifica"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {movimento.stato === 'Previsto' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (movimento.is_fisso) {
                                  markAsPagato.mutate(movimento.id);
                                } else if (movimento.tipo === 'Costo') {
                                  markFaseAsPagato.mutate(movimento.id);
                                } else {
                                  markFaseAsIncassato.mutate(movimento.id);
                                }
                              }}
                              title={movimento.tipo === 'Ricavo' ? "Segna incassato" : "Segna pagato"}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Eliminare questo movimento?")) {
                                if (movimento.is_fisso) {
                                  deleteMovimentoFisso.mutate(movimento.id);
                                } else {
                                  deleteFase.mutate(movimento.id);
                                }
                              }
                            }}
                            title="Elimina"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costi-fissi">
          {/* Costi Fissi Management */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">costi fissi</CardTitle>
                  <CardDescription className="text-xs">costi ricorrenti</CardDescription>
                </div>
                <Dialog open={costoDialogOpen} onOpenChange={setCostoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      nuovo costo fisso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuovo Costo Fisso</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCostoSubmit} className="space-y-4">
                      <div>
                        <Label>Voce</Label>
                        <Input
                          value={costoForm.voce}
                          onChange={(e) => setCostoForm({ ...costoForm, voce: e.target.value })}
                          placeholder="es. Affitto, Utenze..."
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Importo (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={costoForm.importo_mensile}
                            onChange={(e) => setCostoForm({ ...costoForm, importo_mensile: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Giorno Scadenza</Label>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            value={costoForm.giorno_scadenza}
                            onChange={(e) => setCostoForm({ ...costoForm, giorno_scadenza: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Frequenza</Label>
                        <Select
                          value={costoForm.frequenza_mesi}
                          onValueChange={(value) => setCostoForm({ ...costoForm, frequenza_mesi: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FREQUENZE.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Input
                          value={costoForm.categoria}
                          onChange={(e) => setCostoForm({ ...costoForm, categoria: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Note</Label>
                        <Input
                          value={costoForm.note}
                          onChange={(e) => setCostoForm({ ...costoForm, note: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Data Scadenza (opzionale)</Label>
                        <Input
                          type="date"
                          value={costoForm.data_scadenza}
                          onChange={(e) => setCostoForm({ ...costoForm, data_scadenza: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Lascia vuoto se il costo non ha una scadenza</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pagamento_automatico"
                          checked={costoForm.pagamento_automatico}
                          onCheckedChange={(checked) => setCostoForm({ ...costoForm, pagamento_automatico: checked === true })}
                        />
                        <Label htmlFor="pagamento_automatico" className="text-sm font-normal cursor-pointer">
                          Pagamento automatico (es. addebito diretto, RID)
                        </Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setCostoDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button type="submit">Salva</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!costiFissi || costiFissi.length === 0 ? (
                <p className="text-sm text-muted-foreground">nessun costo fisso definito</p>
              ) : (
                <div className="space-y-2">
                  {costiFissi.filter(c => c.attivo).map((costo) => (
                    <div key={costo.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{costo.voce}</p>
                          {(costo as any).pagamento_automatico && (
                            <Badge variant="secondary" className="text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(costo.importo_mensile)} · {getFrequenzaLabel((costo as any).frequenza_mesi || 1)} · scadenza giorno {costo.giorno_scadenza} · {costo.categoria}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditCosto(costo)}
                          title="Modifica"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Eliminare questo costo fisso?")) {
                              deleteCostoFisso.mutate(costo.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Costo Fisso Dialog */}
          <Dialog open={editCostoDialogOpen} onOpenChange={setEditCostoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifica Costo Fisso</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCostoUpdate} className="space-y-4">
                <div>
                  <Label>Voce</Label>
                  <Input
                    value={costoForm.voce}
                    onChange={(e) => setCostoForm({ ...costoForm, voce: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Importo (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={costoForm.importo_mensile}
                      onChange={(e) => setCostoForm({ ...costoForm, importo_mensile: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Giorno Scadenza</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={costoForm.giorno_scadenza}
                      onChange={(e) => setCostoForm({ ...costoForm, giorno_scadenza: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Frequenza</Label>
                  <Select
                    value={costoForm.frequenza_mesi}
                    onValueChange={(value) => setCostoForm({ ...costoForm, frequenza_mesi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENZE.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input
                    value={costoForm.categoria}
                    onChange={(e) => setCostoForm({ ...costoForm, categoria: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Note</Label>
                  <Input
                    value={costoForm.note}
                    onChange={(e) => setCostoForm({ ...costoForm, note: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Data Scadenza (opzionale)</Label>
                  <Input
                    type="date"
                    value={costoForm.data_scadenza}
                    onChange={(e) => setCostoForm({ ...costoForm, data_scadenza: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Lascia vuoto se il costo non ha una scadenza</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_pagamento_automatico"
                    checked={costoForm.pagamento_automatico}
                    onCheckedChange={(checked) => setCostoForm({ ...costoForm, pagamento_automatico: checked === true })}
                  />
                  <Label htmlFor="edit_pagamento_automatico" className="text-sm font-normal cursor-pointer">
                    Pagamento automatico (es. addebito diretto, RID)
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditCostoDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={updateCostoFisso.isPending}>
                    Salva
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Generated Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">costi</CardTitle>
              <CardDescription className="text-xs">tutti i costi (fissi e una tantum)</CardDescription>
            </CardHeader>
            <CardContent>
              {!movimentiFissi || movimentiFissi.length === 0 ? (
                <p className="text-sm text-muted-foreground">nessun costo presente</p>
              ) : (
                <div className="space-y-2">
                  {movimentiFissi.map((mov) => (
                    <div key={mov.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border p-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{mov.note}</p>
                          <Badge variant={mov.stato === 'Previsto' ? 'outline' : 'default'} className="text-xs">
                            {mov.stato}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(mov.data_prevista)}
                          {mov.data_effettiva && ` → ${formatDate(mov.data_effettiva)}`}
                          {' · '}{mov.categoria}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{formatCurrency(mov.importo)}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditMovimento({ ...mov, is_fisso: true, fase: mov.note })}
                          title="Modifica"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {mov.stato === 'Previsto' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsPagato.mutate(mov.id)}
                            title="Segna pagato"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Eliminare questo movimento?")) {
                              deleteMovimentoFisso.mutate(mov.id);
                            }
                          }}
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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