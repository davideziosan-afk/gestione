import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useFasiProgetto, useCreateFase, useUpdateFase, useMarkAsIncassato, useMarkAsPagato, useDeleteFase } from "@/hooks/useFasiProgetto";
import { useProjectCostsMap } from "@/hooks/useProjectCosts";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { Plus, Edit2, Trash2, Eye, CheckCircle2, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Generate project code: YYYY-NNN format
const generateProjectCode = (existingProjects: any[] | undefined) => {
  const currentYear = new Date().getFullYear();
  const yearProjects = existingProjects?.filter(p => p.codice?.startsWith(`${currentYear}-`)) || [];
  const maxNumber = yearProjects.reduce((max, p) => {
    const num = parseInt(p.codice?.split('-')[1] || '0', 10);
    return num > max ? num : max;
  }, 0);
  return `${currentYear}-${String(maxNumber + 1).padStart(3, '0')}`;
};
export default function Progetti() {
  const {
    data: progetti,
    isLoading
  } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createFase = useCreateFase();
  const updateFase = useUpdateFase();
  const markAsIncassato = useMarkAsIncassato();
  const markAsPagato = useMarkAsPagato();
  const deleteFase = useDeleteFase();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [faseDialogOpen, setFaseDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedFase, setSelectedFase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    data: fasi
  } = useFasiProgetto(selectedProject?.id);
  const projectCostsMap = useProjectCostsMap();

  // Auto-generate code for new projects
  const nextProjectCode = useMemo(() => generateProjectCode(progetti), [progetti]);
  const [formData, setFormData] = useState({
    codice: "",
    nome: "",
    cliente: "",
    stato: "Attivo",
    budget_totale: "",
    costi_stimati: "",
    data_inizio: "",
    data_fine: "",
    probabilita: "100"
  });
  const [faseFormData, setFaseFormData] = useState({
    fase: "",
    tipo: "Ricavo",
    categoria: "",
    importo: "",
    stato: "Previsto",
    data_prevista_fattura: "",
    data_effettiva_fattura: "",
    data_prevista_pagamento: "",
    data_effettiva_pagamento: "",
    note: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      await updateProject.mutateAsync({
        id: selectedProject.id,
        ...formData
      });
    } else {
      // Use auto-generated code for new projects
      await createProject.mutateAsync({
        ...formData,
        codice: nextProjectCode
      });
    }
    setDialogOpen(false);
    resetForm();
  };
  const handleFaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const faseData = {
      progetto_id: selectedProject.id,
      fase: faseFormData.fase,
      tipo: faseFormData.tipo,
      categoria: faseFormData.categoria,
      importo: faseFormData.importo,
      stato: faseFormData.stato,
      data_prevista: faseFormData.data_prevista_pagamento || new Date().toISOString().split('T')[0],
      data_prevista_fattura: faseFormData.data_prevista_fattura || null,
      data_effettiva_fattura: faseFormData.data_effettiva_fattura || null,
      data_prevista_pagamento: faseFormData.data_prevista_pagamento || null,
      data_effettiva_pagamento: faseFormData.data_effettiva_pagamento || null,
      note: faseFormData.note || null
    };
    if (selectedFase) {
      await updateFase.mutateAsync({
        id: selectedFase.id,
        ...faseData
      });
    } else {
      await createFase.mutateAsync(faseData);
    }
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
      probabilita: "100"
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
      data_prevista_fattura: "",
      data_effettiva_fattura: "",
      data_prevista_pagamento: "",
      data_effettiva_pagamento: "",
      note: ""
    });
    setSelectedFase(null);
  };
  const filteredProjects = progetti?.filter(p => {
    const matchesSearch = p.codice.toLowerCase().includes(searchTerm.toLowerCase()) || p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.stato === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const calculateTotals = (projectFasi: any[]) => {
    const ricaviEffettivi = projectFasi.filter(f => f.tipo === 'Ricavo' && f.stato === 'Incassato').reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const ricaviPrevisti = projectFasi.filter(f => f.tipo === 'Ricavo' && f.stato === 'Previsto').reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const costiEffettivi = projectFasi.filter(f => f.tipo === 'Costo' && f.stato === 'Pagato').reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    const costiPrevisti = projectFasi.filter(f => f.tipo === 'Costo' && f.stato === 'Previsto').reduce((sum, f) => sum + parseFloat(String(f.importo)), 0);
    return {
      ricaviEffettivi,
      ricaviPrevisti,
      costiEffettivi,
      costiPrevisti,
      margine: ricaviEffettivi + ricaviPrevisti - (costiEffettivi + costiPrevisti)
    };
  };
  const getStatoBadgeVariant = (stato: string) => {
    switch (stato) {
      case 'Previsto':
        return 'outline';
      case 'Fatturato':
        return 'secondary';
      case 'Incassato':
        return 'default';
      case 'Pagato':
        return 'default';
      case 'Annullato':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  if (isLoading) {
    return <div>Caricamento...</div>;
  }
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">progetti</h2>
          <p className="text-muted-foreground text-sm">gestisci i progetti dello studio</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              nuovo progetto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject ? "Modifica Progetto" : "Nuovo Progetto"}</DialogTitle>
              <DialogDescription>Inserisci i dettagli del progetto</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codice">Codice</Label>
                  <Input id="codice" value={selectedProject ? formData.codice : nextProjectCode} onChange={e => setFormData({
                  ...formData,
                  codice: e.target.value
                })} disabled={!selectedProject} className={!selectedProject ? "bg-muted" : ""} />
                  {!selectedProject && <p className="text-xs text-muted-foreground mt-1">Generato automaticamente</p>}
                </div>
                <div>
                  <Label htmlFor="stato">Stato</Label>
                  <Select value={formData.stato} onValueChange={value => setFormData({
                  ...formData,
                  stato: value
                })}>
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
                <Input id="nome" value={formData.nome} onChange={e => setFormData({
                ...formData,
                nome: e.target.value
              })} required />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input id="cliente" value={formData.cliente} onChange={e => setFormData({
                ...formData,
                cliente: e.target.value
              })} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_totale">Budget Totale (€)</Label>
                  <Input id="budget_totale" type="number" step="0.01" value={formData.budget_totale} onChange={e => setFormData({
                  ...formData,
                  budget_totale: e.target.value
                })} required />
                </div>
                <div>
                  <Label htmlFor="costi_stimati">Costi Stimati (€)</Label>
                  <Input id="costi_stimati" type="number" step="0.01" value={formData.costi_stimati} onChange={e => setFormData({
                  ...formData,
                  costi_stimati: e.target.value
                })} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inizio">Data Inizio</Label>
                  <Input id="data_inizio" type="date" value={formData.data_inizio} onChange={e => setFormData({
                  ...formData,
                  data_inizio: e.target.value
                })} required />
                </div>
                <div>
                  <Label htmlFor="data_fine">Data Fine (opzionale)</Label>
                  <Input id="data_fine" type="date" value={formData.data_fine} onChange={e => setFormData({
                  ...formData,
                  data_fine: e.target.value
                })} />
                </div>
              </div>
              <div>
                <Label htmlFor="probabilita">Probabilità (%)</Label>
                <Input id="probabilita" type="number" min="0" max="100" value={formData.probabilita} onChange={e => setFormData({
                ...formData,
                probabilita: e.target.value
              })} required />
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="cerca per codice, nome o cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="sm:max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="Attivo">Attivo</SelectItem>
            <SelectItem value="In attesa">In attesa</SelectItem>
            <SelectItem value="Chiuso">Chiuso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects List - Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {filteredProjects?.map(project => <Card key={project.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono font-bold text-sm">{project.codice}</p>
                  <p className="font-medium">{project.nome}</p>
                  <p className="text-sm text-muted-foreground">{project.cliente}</p>
                </div>
                <Badge variant={project.stato === 'Attivo' ? 'default' : 'secondary'}>
                  {project.stato}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Budget:</span> {formatCurrency(project.budget_totale)}
                </div>
                <div>
                  <span className="text-muted-foreground">Prob:</span> {project.probabilita}%
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
              setSelectedProject(project);
              setDetailOpen(true);
            }}>
                  <Eye className="h-3 w-3 mr-1" /> dettagli
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
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
                probabilita: String(project.probabilita)
              });
              setDialogOpen(true);
            }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
              if (confirm("Eliminare questo progetto?")) {
                deleteProject.mutate(project.id);
              }
            }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Projects Table - Desktop */}
      <div className="border border-border hidden lg:block overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 gap-4 p-4 font-bold bg-secondary text-sm">
            <div className="col-span-1">codice</div>
            <div className="col-span-2">nome</div>
            <div className="col-span-2">cliente</div>
            <div className="col-span-1">stato</div>
            <div className="col-span-1">budget</div>
            <div className="col-span-1">costi stim.</div>
            <div className="col-span-1">costi eff.</div>
            <div className="col-span-1">prob.</div>
            <div className="col-span-2">azioni</div>
          </div>
          {filteredProjects?.map(project => {
            const projectCosts = projectCostsMap.get(project.id) || { costiEffettivi: 0, ricaviEffettivi: 0 };
            return <div key={project.id} className="grid grid-cols-12 gap-4 p-4 border-t border-border items-center text-sm">
              <div className="col-span-1 font-mono font-bold truncate">{project.codice}</div>
              <div className="col-span-2 truncate">{project.nome}</div>
              <div className="col-span-2 truncate">{project.cliente}</div>
              <div className="col-span-1">
                <Badge variant={project.stato === 'Attivo' ? 'default' : 'secondary'} className="text-xs">
                  {project.stato}
                </Badge>
              </div>
              <div className="col-span-1">{formatCurrency(project.budget_totale)}</div>
              <div className="col-span-1">{formatCurrency(project.costi_stimati)}</div>
              <div className="col-span-1">{formatCurrency(projectCosts.costiEffettivi)}</div>
              <div className="col-span-1">{project.probabilita}%</div>
              <div className="col-span-2 flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => {
              setSelectedProject(project);
              setDetailOpen(true);
            }}>
                  <Box className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
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
                probabilita: String(project.probabilita)
              });
              setDialogOpen(true);
            }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
              if (confirm("Eliminare questo progetto?")) {
                deleteProject.mutate(project.id);
              }
            }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          })}
        </div>
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
          
          {selectedProject && <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informazioni Progetto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              {fasi && <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Totali</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                const totals = calculateTotals(fasi);
                return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Ricavi Eff.</p>
                            <p className="text-lg font-bold">{formatCurrency(totals.ricaviEffettivi)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ricavi Prev.</p>
                            <p className="text-lg font-bold">{formatCurrency(totals.ricaviPrevisti)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Costi Eff.</p>
                            <p className="text-lg font-bold">{formatCurrency(totals.costiEffettivi)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Margine</p>
                            <p className="text-lg font-bold">{formatCurrency(totals.margine)}</p>
                          </div>
                        </div>;
              })()}
                  </CardContent>
                </Card>}

              {/* Fasi */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Fasi del Progetto</CardTitle>
                    <Dialog open={faseDialogOpen} onOpenChange={setFaseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={resetFaseForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Aggiungi Fase
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedFase ? "Modifica Fase" : "Nuova Fase"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFaseSubmit} className="space-y-4">
                          <div>
                            <Label>Nome Fase</Label>
                            <Input value={faseFormData.fase} onChange={e => setFaseFormData({
                          ...faseFormData,
                          fase: e.target.value
                        })} placeholder="es. Acconto, SAL, Saldo" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Tipo</Label>
                              <Select value={faseFormData.tipo} onValueChange={value => setFaseFormData({
                            ...faseFormData,
                            tipo: value
                          })}>
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
                              <Label>Categoria</Label>
                              <Input value={faseFormData.categoria} onChange={e => setFaseFormData({
                            ...faseFormData,
                            categoria: e.target.value
                          })} required />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Importo (€)</Label>
                              <Input type="number" step="0.01" value={faseFormData.importo} onChange={e => setFaseFormData({
                            ...faseFormData,
                            importo: e.target.value
                          })} required />
                            </div>
                            <div>
                              <Label>Stato</Label>
                              <Select value={faseFormData.stato} onValueChange={value => setFaseFormData({
                            ...faseFormData,
                            stato: value
                          })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Previsto">Previsto</SelectItem>
                                  <SelectItem value="Fatturato">Fatturato</SelectItem>
                                  <SelectItem value="Incassato">Incassato</SelectItem>
                                  <SelectItem value="Pagato">Pagato</SelectItem>
                                  <SelectItem value="Annullato">Annullato</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Data prev. fattura</Label>
                              <Input type="date" value={faseFormData.data_prevista_fattura} onChange={e => setFaseFormData({
                            ...faseFormData,
                            data_prevista_fattura: e.target.value
                          })} />
                            </div>
                            <div>
                              <Label>Data eff. fattura</Label>
                              <Input type="date" value={faseFormData.data_effettiva_fattura} onChange={e => setFaseFormData({
                            ...faseFormData,
                            data_effettiva_fattura: e.target.value
                          })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Data prev. pagamento</Label>
                              <Input type="date" value={faseFormData.data_prevista_pagamento} onChange={e => setFaseFormData({
                            ...faseFormData,
                            data_prevista_pagamento: e.target.value
                          })} required />
                            </div>
                            <div>
                              <Label>Data eff. pagamento</Label>
                              <Input type="date" value={faseFormData.data_effettiva_pagamento} onChange={e => setFaseFormData({
                            ...faseFormData,
                            data_effettiva_pagamento: e.target.value
                          })} />
                            </div>
                          </div>
                          <div>
                            <Label>Note</Label>
                            <Input value={faseFormData.note} onChange={e => setFaseFormData({
                          ...faseFormData,
                          note: e.target.value
                        })} />
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
                  {!fasi || fasi.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna fase presente</p> : <div className="space-y-2">
                      {fasi.map(fase => <div key={fase.id} className="border border-border p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-medium">{fase.fase}</p>
                                <Badge variant={fase.tipo === 'Ricavo' ? 'default' : 'secondary'} className="text-xs">
                                  {fase.tipo}
                                </Badge>
                                <Badge variant={getStatoBadgeVariant(fase.stato)} className="text-xs">
                                  {fase.stato}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {fase.data_prevista_pagamento && `Pag. prev: ${formatDate(fase.data_prevista_pagamento)}`}
                                {fase.data_effettiva_pagamento && ` | Pag. eff: ${formatDate(fase.data_effettiva_pagamento)}`}
                                {!fase.data_prevista_pagamento && formatDate(fase.data_prevista)}
                                {' · '}{fase.categoria}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{formatCurrency(fase.importo)}</p>
                              {fase.stato === 'Previsto' && fase.tipo === 'Ricavo' && <Button size="sm" variant="ghost" onClick={() => markAsIncassato.mutate(fase.id)} title="Segna incassato">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>}
                              {fase.stato === 'Previsto' && fase.tipo === 'Costo' && <Button size="sm" variant="ghost" onClick={() => markAsPagato.mutate(fase.id)} title="Segna pagato">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>}
                              <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedFase(fase);
                        setFaseFormData({
                          fase: fase.fase,
                          tipo: fase.tipo,
                          categoria: fase.categoria,
                          importo: String(fase.importo),
                          stato: fase.stato,
                          data_prevista_fattura: fase.data_prevista_fattura || "",
                          data_effettiva_fattura: fase.data_effettiva_fattura || "",
                          data_prevista_pagamento: fase.data_prevista_pagamento || fase.data_prevista || "",
                          data_effettiva_pagamento: fase.data_effettiva_pagamento || fase.data_effettiva || "",
                          note: fase.note || ""
                        });
                        setFaseDialogOpen(true);
                      }}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                        if (confirm("Eliminare questa fase?")) {
                          deleteFase.mutate(fase.id);
                        }
                      }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>)}
                    </div>}
                </CardContent>
              </Card>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}