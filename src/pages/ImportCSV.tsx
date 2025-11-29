import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ImportCSV() {
  const queryClient = useQueryClient();
  const [fasiFile, setFasiFile] = useState<File | null>(null);
  const [movimentiFile, setMovimentiFile] = useState<File | null>(null);
  const [fasiPreview, setFasiPreview] = useState<any[]>([]);
  const [movimentiPreview, setMovimentiPreview] = useState<any[]>([]);

  const { data: progetti } = useQuery({
    queryKey: ["progetti"],
    queryFn: async () => {
      const { data, error } = await supabase.from("progetti").select("*");
      if (error) throw error;
      return data;
    },
  });

  const parseFasiCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      
      // Validate and map progetto_codice
      const progetto = progetti?.find(p => p.codice === row.progetto_codice);
      row.progetto_id = progetto?.id;
      row.progetto_nome = progetto?.nome;
      row.valid = !!progetto;
      row.error = !progetto ? "Progetto non trovato" : null;
      
      parsed.push(row);
    }
    
    setFasiPreview(parsed);
  };

  const parseMovimentiCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      
      row.valid = true;
      parsed.push(row);
    }
    
    setMovimentiPreview(parsed);
  };

  const importFasi = useMutation({
    mutationFn: async () => {
      const validRows = fasiPreview.filter(r => r.valid);
      const toInsert = validRows.map(r => ({
        progetto_id: r.progetto_id,
        fase: r.fase,
        tipo: r.tipo,
        categoria: r.categoria,
        importo: parseFloat(r.importo),
        stato: r.stato,
        data_prevista: r.data_prevista,
        data_effettiva: r.data_effettiva || null,
      }));
      
      const { data, error } = await supabase
        .from("fasi_progetto")
        .insert(toInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fasi_progetto"] });
      toast.success("Fasi importate con successo");
      setFasiPreview([]);
      setFasiFile(null);
    },
    onError: (error: any) => {
      toast.error("Errore durante l'importazione: " + error.message);
    },
  });

  const importMovimenti = useMutation({
    mutationFn: async () => {
      const toInsert = movimentiPreview.map(r => ({
        costo_fisso_id: r.costo_fisso_id,
        mese: r.mese,
        data_prevista: r.data_prevista,
        importo: parseFloat(r.importo),
        stato: r.stato,
        data_effettiva: r.data_effettiva || null,
        categoria: r.categoria,
        note: r.note,
      }));
      
      const { data, error } = await supabase
        .from("movimenti_fissi")
        .insert(toInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimenti_fissi"] });
      toast.success("Movimenti importati con successo");
      setMovimentiPreview([]);
      setMovimentiFile(null);
    },
    onError: (error: any) => {
      toast.error("Errore durante l'importazione: " + error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Import CSV</h2>
        <p className="text-muted-foreground">Importa dati da file CSV</p>
      </div>

      <Tabs defaultValue="fasi">
        <TabsList>
          <TabsTrigger value="fasi">Fasi Progetto</TabsTrigger>
          <TabsTrigger value="movimenti">Movimenti Fissi</TabsTrigger>
        </TabsList>

        <TabsContent value="fasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Fasi Progetto</CardTitle>
              <CardDescription>
                Formato CSV richiesto: progetto_codice, fase, tipo, categoria, importo, stato, data_prevista,
                data_effettiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fasi-file">File CSV</Label>
                <Input
                  id="fasi-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFasiFile(file);
                      parseFasiCSV(file);
                    }
                  }}
                />
              </div>

              {fasiPreview.length > 0 && (
                <>
                  <div className="border border-border p-4 space-y-2">
                    <h3 className="font-bold">Anteprima ({fasiPreview.length} righe)</h3>
                    {fasiPreview.map((row, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 border border-border ${
                          !row.valid ? 'bg-destructive/10' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {row.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">
                              {row.progetto_codice} - {row.fase}
                            </span>
                            <Badge variant={row.tipo === 'Ricavo' ? 'default' : 'secondary'}>
                              {row.tipo}
                            </Badge>
                          </div>
                          {row.error && (
                            <p className="text-sm text-destructive">{row.error}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">€ {row.importo}</p>
                          <p className="text-xs text-muted-foreground">{row.data_prevista}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFasiPreview([]);
                        setFasiFile(null);
                      }}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={() => importFasi.mutate()}
                      disabled={!fasiPreview.some(r => r.valid)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importa {fasiPreview.filter(r => r.valid).length} Fasi
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimenti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Movimenti Fissi</CardTitle>
              <CardDescription>
                Formato CSV richiesto: costo_fisso_id, mese, data_prevista, importo, stato, data_effettiva, categoria,
                note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="movimenti-file">File CSV</Label>
                <Input
                  id="movimenti-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMovimentiFile(file);
                      parseMovimentiCSV(file);
                    }
                  }}
                />
              </div>

              {movimentiPreview.length > 0 && (
                <>
                  <div className="border border-border p-4 space-y-2">
                    <h3 className="font-bold">Anteprima ({movimentiPreview.length} righe)</h3>
                    {movimentiPreview.slice(0, 10).map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border border-border">
                        <div className="flex-1">
                          <p className="font-medium">{row.note}</p>
                          <p className="text-sm text-muted-foreground">
                            {row.mese} · {row.categoria}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">€ {row.importo}</p>
                        </div>
                      </div>
                    ))}
                    {movimentiPreview.length > 10 && (
                      <p className="text-sm text-muted-foreground">
                        ...e altre {movimentiPreview.length - 10} righe
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMovimentiPreview([]);
                        setMovimentiFile(null);
                      }}
                    >
                      Annulla
                    </Button>
                    <Button onClick={() => importMovimenti.mutate()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importa {movimentiPreview.length} Movimenti
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}