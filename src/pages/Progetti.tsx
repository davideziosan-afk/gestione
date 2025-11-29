import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useFasiProgetto, useCreateFase, useMarkAsIncassato, useMarkAsPagato, useDeleteFase } from "@/hooks/useFasiProgetto";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { Plus, Edit2, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Progetti() {
  const { data: progetti, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  
  const createFase = useCreateFase();
  const markAsIncassato = useMarkAsIncassato();
  const markAsPagato = useMarkAsPagato();
  const deleteFase = useDeleteFase();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [faseDialogOpen, setFaseDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: fasi } = useFasiProgetto(selectedProject?.id);

  const [formData, setFormData] = useState({
    codice: "",
    nome: "",
    cliente: "",
    stato: "Attivo",
    budget_totale: "",
    costi_stimati: "",
    data_inizio: "",
    data_fine: "",
    probabilita: "100",
  });

  const [faseFormData, setFaseFormData] = useState({
    fase: "",
    tipo: "Ricavo",
    categoria: "",
    importo: "",
    stato: "Previsto",
    data_prevista: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      await updateProject.mutateAsync({ id: selectedProject.id, ...formData });
    } else {
      await createProject.mutateAsync(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleFaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFase.mutateAsync({
      progetto_id: selectedProject.id,
      ...faseFormData,
    });
    setFaseDialogOpen(false);
    resetFaseForm();
  };

  const resetForm = () => {
    setFormData({
      codice: "",
      nome: "",
      cliente: "",
      stato: "Attivo",
      budget_totale: "",
      costi_stimati: "",
      data_inizio: "",
      data_fine: "",
      probabilita: "100",
    });
    setSelectedProject(null);
  };

  const resetFaseForm = () => {
    setFaseFormData({
      fase: "",
      tipo: "Ricavo",
      categoria: "",
      importo: "",
      stato: "Previsto",
      data_prevista: "",
      note: "",
    });
  };

  const filteredProjects = progetti?.filter(p =>
    p.codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate project totals
  const calculateTotals = (projectFasi: any[]) => {
    const ricaviEffettivi = projectFasi.filter(f => f.tipo === 'Ricavo' && f.stato === 'Incassato')
      .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const ricaviPrevisti = projectFasi.filter(f => f.tipo === 'Ricavo' && f.stato === 'Previsto')
      .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const costiEffettivi = projectFasi.filter(f => f.tipo === 'Costo' && f.stato === 'Pagato')
      .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const costiPrevisti = projectFasi.filter(f => f.tipo === 'Costo' && f.stato === 'Previsto')
      .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);

    return {
      ricaviEffettivi,
      ricaviPrevisti,
      costiEffettivi,
      costiPrevisti,
      margine: (ricaviEffettivi + ricaviPrevisti) - (costiEffettivi + costiPrevisti),
    };
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">progetti</h2>
          <p className="text-muted-foreground">gestisci i progetti dello studio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              nuovo progetto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProject ? "Modifica Progetto" : "Nuovo Progetto"}</DialogTitle>
              <DialogDescription>Inserisci i dettagli del progetto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codice">Codice</Label>
                  <Input
                    id="codice"
                    value={formData.codice}
                    onChange={(e) => setFormData({ ...formData, codice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stato">Stato</Label>
                  <Select value={formData.stato} onValueChange={(value) => setFormData({ ...formData, stato: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Attivo">Attivo</SelectItem>
                      <SelectItem value="In attesa">In attesa</SelectItem>
                      <SelectItem value="Chiuso">Chiuso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_totale">Budget Totale (€)</Label>
                  <Input
                    id="budget_totale"
                    type="number"
                    step="0.01"
                    value={formData.budget_totale}
                    onChange={(e) => setFormData({ ...formData, budget_totale: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="costi_stimati">Costi Stimati (€)</Label>
                  <Input
                    id="costi_stimati"
                    type="number"
                    step="0.01"
                    value={formData.costi_stimati}
                    onChange={(e) => setFormData({ ...formData, costi_stimati: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inizio">Data Inizio</Label>
                  <Input
                    id="data_inizio"
                    type="date"
                    value={formData.data_inizio}
                    onChange={(e) => setFormData({ ...formData, data_inizio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fine">Data Fine (opzionale)</Label>
                  <Input
                    id="data_fine"
                    type="date"
                    value={formData.data_fine}
                    onChange={(e) => setFormData({ ...formData, data_fine: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="probabilita">Probabilità (%)</Label>
                <Input
                  id="probabilita"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probabilita}
                  onChange={(e) => setFormData({ ...formData, probabilita: e.target.value })}
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

      {/* Search */}
      <Input
        placeholder="cerca per codice, nome o cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {/* Projects Table */}
      <div className="border border-border">
        <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-secondary">
          <div className="col-span-1">codice</div>
          <div className="col-span-2">nome</div>
          <div className="col-span-2">cliente</div>
          <div className="col-span-1">stato</div>
          <div className="col-span-2">budget</div>
          <div className="col-span-2">costi stim.</div>
          <div className="col-span-1">probab.</div>
          <div className="col-span-1">azioni</div>
        </div>
        {filteredProjects?.map((project) => (
          <div key={project.id} className="grid grid-cols-12 gap-4 p-4 border-t border-border items-center">
            <div className="col-span-1 font-mono font-bold">{project.codice}</div>
            <div className="col-span-2">{project.nome}</div>
            <div className="col-span-2">{project.cliente}</div>
            <div className="col-span-1">
              <Badge variant={project.stato === 'Attivo' ? 'default' : 'secondary'}>
                {project.stato}
              </Badge>
            </div>
            <div className="col-span-2">{formatCurrency(project.budget_totale)}</div>
            <div className="col-span-2">{formatCurrency(project.costi_stimati)}</div>
            <div className="col-span-1">{project.probabilita}%</div>
            <div className="col-span-1 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedProject(project);
                  setDetailOpen(true);
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedProject(project);
                  setFormData({
                    codice: project.codice,
                    nome: project.nome,
                    cliente: project.cliente,
                    stato: project.stato,
                    budget_totale: String(project.budget_totale),
                    costi_stimati: String(project.costi_stimati),
                    data_inizio: project.data_inizio,
                    data_fine: project.data_fine || "",
                    probabilita: String(project.probabilita),
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
                  if (confirm("Eliminare questo progetto?")) {
                    deleteProject.mutate(project.id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProject?.codice} - {selectedProject?.nome}
            </DialogTitle>
            <DialogDescription>Dettagli progetto e fasi</DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informazioni Progetto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Cliente:</span> {selectedProject.cliente}
                    </div>
                    <div>
                      <span className="font-medium">Stato:</span> {selectedProject.stato}
                    </div>
                    <div>
                      <span className="font-medium">Periodo:</span>{" "}
                      {formatDate(selectedProject.data_inizio)}
                      {selectedProject.data_fine && ` - ${formatDate(selectedProject.data_fine)}`}
                    </div>
                    <div>
                      <span className="font-medium">Probabilità:</span> {selectedProject.probabilita}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              {fasi && (
                <Card>
                  <CardHeader>
                    <CardTitle>Totali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const totals = calculateTotals(fasi);
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Ricavi Effettivi</p>
                            <p className="text-2xl font-bold">{formatCurrency(totals.ricaviEffettivi)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ricavi Previsti</p>
                            <p className="text-2xl font-bold">{formatCurrency(totals.ricaviPrevisti)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Costi Effettivi</p>
                            <p className="text-2xl font-bold">{formatCurrency(totals.costiEffettivi)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Costi Previsti</p>
                            <p className="text-2xl font-bold">{formatCurrency(totals.costiPrevisti)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Margine (Ricavi - Costi)</p>
                            <p className="text-3xl font-bold">{formatCurrency(totals.margine)}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Fasi */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fasi del Progetto</CardTitle>
                    <Dialog open={faseDialogOpen} onOpenChange={setFaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={resetFaseForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Aggiungi Fase
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nuova Fase</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFaseSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="fase">Nome Fase</Label>
                            <Input
                              id="fase"
                              value={faseFormData.fase}
                              onChange={(e) => setFaseFormData({ ...faseFormData, fase: e.target.value })}
                              placeholder="es. Acconto, SAL, Saldo"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tipo">Tipo</Label>
                              <Select value={faseFormData.tipo} onValueChange={(value) => setFaseFormData({ ...faseFormData, tipo: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ricavo">Ricavo</SelectItem>
                                  <SelectItem value="Costo">Costo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="categoria">Categoria</Label>
                              <Input
                                id="categoria"
                                value={faseFormData.categoria}
                                onChange={(e) => setFaseFormData({ ...faseFormData, categoria: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="importo">Importo (€)</Label>
                              <Input
                                id="importo"
                                type="number"
                                step="0.01"
                                value={faseFormData.importo}
                                onChange={(e) => setFaseFormData({ ...faseFormData, importo: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="stato_fase">Stato</Label>
                              <Select value={faseFormData.stato} onValueChange={(value) => setFaseFormData({ ...faseFormData, stato: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Previsto">Previsto</SelectItem>
                                  <SelectItem value="Incassato">Incassato</SelectItem>
                                  <SelectItem value="Pagato">Pagato</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="data_prevista">Data Prevista</Label>
                            <Input
                              id="data_prevista"
                              type="date"
                              value={faseFormData.data_prevista}
                              onChange={(e) => setFaseFormData({ ...faseFormData, data_prevista: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="note">Note</Label>
                            <Input
                              id="note"
                              value={faseFormData.note}
                              onChange={(e) => setFaseFormData({ ...faseFormData, note: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setFaseDialogOpen(false)}>
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
                  {!fasi || fasi.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessuna fase presente</p>
                  ) : (
                    <div className="space-y-2">
                      {fasi.map((fase) => (
                        <div key={fase.id} className="flex items-center justify-between border border-border p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{fase.fase}</p>
                              <Badge variant={fase.tipo === 'Ricavo' ? 'default' : 'secondary'}>
                                {fase.tipo}
                              </Badge>
                              <Badge variant={fase.stato === 'Previsto' ? 'outline' : 'default'}>
                                {fase.stato}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(fase.data_prevista)} · {fase.categoria}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{formatCurrency(fase.importo)}</p>
                            {fase.stato === 'Previsto' && fase.tipo === 'Ricavo' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsIncassato.mutate(fase.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {fase.stato === 'Previsto' && fase.tipo === 'Costo' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsPagato.mutate(fase.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Eliminare questa fase?")) {
                                  deleteFase.mutate(fase.id);
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}