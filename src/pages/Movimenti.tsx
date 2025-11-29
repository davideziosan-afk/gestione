import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFasiProgetto } from "@/hooks/useFasiProgetto";
import { useMovimentiFissi } from "@/hooks/useCostiFissi";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function Movimenti() {
  const { data: fasi } = useFasiProgetto();
  const { data: movimentiFissi } = useMovimentiFissi();

  const [filters, setFilters] = useState({
    search: "",
    stato: "all",
    tipo: "all",
  });

  // Combine both types of movements
  const allMovimenti = [
    ...(fasi?.map(f => ({
      ...f,
      tipo_movimento: 'progetto',
      direzione: f.tipo === 'Ricavo' ? 'Entrata' : 'Uscita',
      nome: (f.progetti as any)?.nome || '-',
    })) || []),
    ...(movimentiFissi?.map(m => ({
      ...m,
      tipo_movimento: 'fisso',
      direzione: 'Uscita',
      tipo: 'Costo',
      fase: m.note,
      nome: '-',
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
    .sort((a, b) => new Date(b.data_prevista).getTime() - new Date(a.data_prevista).getTime());

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">movimenti</h2>
          <p className="text-muted-foreground">tutti i movimenti finanziari (progetti + costi fissi)</p>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>filtri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>cerca</Label>
              <Input
                placeholder="cerca per nome, categoria..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label>stato</Label>
              <Select value={filters.stato} onValueChange={(value) => setFilters({ ...filters, stato: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  <SelectItem value="Previsto">Previsto</SelectItem>
                  <SelectItem value="Incassato">Incassato</SelectItem>
                  <SelectItem value="Pagato">Pagato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>tipo</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>risultati ({filteredMovimenti.length})</CardTitle>
          <CardDescription>movimenti filtrati</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMovimenti.length === 0 ? (
            <p className="text-sm text-muted-foreground">nessun movimento trovato</p>
          ) : (
            <div className="space-y-2">
              {filteredMovimenti.map((movimento, idx) => (
                <div key={`${movimento.tipo_movimento}-${movimento.id}`} className="flex items-center justify-between border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{movimento.fase || movimento.note}</p>
                      <Badge variant={movimento.direzione === 'Entrata' ? 'default' : 'secondary'}>
                        {movimento.direzione}
                      </Badge>
                      <Badge variant={movimento.stato === 'Previsto' ? 'outline' : 'default'}>
                        {movimento.stato}
                      </Badge>
                      <Badge variant="outline">{movimento.tipo_movimento === 'progetto' ? 'Progetto' : 'Costo Fisso'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(movimento.data_prevista)}
                      {movimento.data_effettiva && ` → ${formatDate(movimento.data_effettiva)}`}
                      {' · '}{movimento.categoria}
                      {movimento.tipo_movimento === 'progetto' && movimento.nome !== '-' && ` · ${movimento.nome}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(movimento.importo)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}