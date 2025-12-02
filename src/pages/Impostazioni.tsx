import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategorie, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from "@/hooks/useCategorie";
import { usePendingApprovals, useApproveUser, useRejectUser } from "@/hooks/useUserApproval";
import { useIsAdmin } from "@/hooks/useUserApproval";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Impostazioni() {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: categorie } = useCategorie();
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const deleteCategoria = useDeleteCategoria();
  const queryClient = useQueryClient();

  const { data: pendingApprovals } = usePendingApprovals();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      if (settings?.id) {
        const { error } = await supabase
          .from("settings")
          .update(newSettings)
          .eq("id", settings.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Impostazioni salvate");
    },
  });

  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [categoriaForm, setCategoriaForm] = useState({ nome: "", tipo: "uscita" });
  const [settingsForm, setSettingsForm] = useState({
    cassa_iniziale: settings?.cassa_iniziale?.toString() || "0",
    soglia_allerta_cassa: settings?.soglia_allerta_cassa?.toString() || "5000",
  });

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoria) {
      await updateCategoria.mutateAsync({ id: selectedCategoria.id, ...categoriaForm });
    } else {
      await createCategoria.mutateAsync(categoriaForm);
    }
    setCategoriaDialogOpen(false);
    setCategoriaForm({ nome: "", tipo: "uscita" });
    setSelectedCategoria(null);
  };

  const handleSettingsSave = () => {
    updateSettings.mutate({
      cassa_iniziale: parseFloat(settingsForm.cassa_iniziale) || 0,
      soglia_allerta_cassa: parseFloat(settingsForm.soglia_allerta_cassa) || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">impostazioni</h2>
        <p className="text-muted-foreground">configurazione dell'applicazione</p>
      </div>

      <Tabs defaultValue="categorie">
        <TabsList className="mb-4">
          <TabsTrigger value="categorie">categorie</TabsTrigger>
          <TabsTrigger value="generali">generali</TabsTrigger>
          {isAdmin && <TabsTrigger value="approvazioni">approvazioni</TabsTrigger>}
        </TabsList>

        <TabsContent value="categorie">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>categorie movimenti</CardTitle>
                  <CardDescription>gestisci le categorie per entrate e uscite</CardDescription>
                </div>
                <Dialog open={categoriaDialogOpen} onOpenChange={setCategoriaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => {
                      setSelectedCategoria(null);
                      setCategoriaForm({ nome: "", tipo: "uscita" });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      nuova categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedCategoria ? "Modifica Categoria" : "Nuova Categoria"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategoriaSubmit} className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={categoriaForm.nome}
                          onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={categoriaForm.tipo} onValueChange={(v) => setCategoriaForm({ ...categoriaForm, tipo: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrata">Entrata</SelectItem>
                            <SelectItem value="uscita">Uscita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setCategoriaDialogOpen(false)}>
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
              {!categorie || categorie.length === 0 ? (
                <p className="text-sm text-muted-foreground">nessuna categoria presente</p>
              ) : (
                <div className="space-y-2">
                  {categorie.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between border border-border p-3">
                      <div>
                        <p className="font-medium">{cat.nome}</p>
                        <p className="text-sm text-muted-foreground">{cat.tipo}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCategoria(cat);
                            setCategoriaForm({ nome: cat.nome, tipo: cat.tipo });
                            setCategoriaDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Eliminare questa categoria?")) {
                              deleteCategoria.mutate(cat.id);
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
        </TabsContent>

        <TabsContent value="generali">
          <Card>
            <CardHeader>
              <CardTitle>impostazioni generali</CardTitle>
              <CardDescription>configurazione finanziaria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cassa Iniziale (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settingsForm.cassa_iniziale}
                  onChange={(e) => setSettingsForm({ ...settingsForm, cassa_iniziale: e.target.value })}
                />
              </div>
              <div>
                <Label>Soglia Allerta Cassa (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settingsForm.soglia_allerta_cassa}
                  onChange={(e) => setSettingsForm({ ...settingsForm, soglia_allerta_cassa: e.target.value })}
                />
              </div>
              <Button onClick={handleSettingsSave}>Salva Impostazioni</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="approvazioni">
            <Card>
              <CardHeader>
                <CardTitle>richieste di accesso</CardTitle>
                <CardDescription>gestisci le richieste di accesso all'applicazione</CardDescription>
              </CardHeader>
              <CardContent>
                {!pendingApprovals || pendingApprovals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">nessuna richiesta in sospeso</p>
                ) : (
                  <div className="space-y-2">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="flex items-center justify-between border border-border p-3">
                        <div>
                          <p className="font-medium">{approval.email}</p>
                          <p className="text-sm text-muted-foreground">
                            richiesta il {new Date(approval.created_at).toLocaleString('it-IT')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUser.mutate({ userId: approval.user_id })}
                            disabled={approveUser.isPending || rejectUser.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Rifiutare ${approval.email}?`)) {
                                rejectUser.mutate({ userId: approval.user_id });
                              }
                            }}
                            disabled={approveUser.isPending || rejectUser.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
