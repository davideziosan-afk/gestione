import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { useFasiProgetto } from "@/hooks/useFasiProgetto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/dateUtils";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ProgettoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projectLoading } = useProject(id!);
  const { data: fasi, isLoading: fasiLoading } = useFasiProgetto(id);

  if (projectLoading || fasiLoading) {
    return <div className="p-6">Caricamento...</div>;
  }

  if (!project) {
    return <div className="p-6">Progetto non trovato</div>;
  }

  // Calculate totals
  const ricaviIncassati = fasi?.filter(f => f.tipo === 'Ricavo' && f.stato === 'Incassato')
    .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;
  const ricaviPrevisti = fasi?.filter(f => f.tipo === 'Ricavo' && f.stato === 'Previsto')
    .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;
  const ricaviFatturati = fasi?.filter(f => f.tipo === 'Ricavo' && f.stato === 'Fatturato')
    .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;
  
  const costiPagati = fasi?.filter(f => f.tipo === 'Costo' && f.stato === 'Pagato')
    .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;
  const costiPrevisti = fasi?.filter(f => f.tipo === 'Costo' && f.stato === 'Previsto')
    .reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

  const totaleRicavi = ricaviIncassati + ricaviPrevisti + ricaviFatturati;
  const totaleCosti = costiPagati + costiPrevisti;
  
  // Data for pie chart - revenues
  const ricaviChartData = [
    { name: 'Incassato', value: ricaviIncassati, color: 'hsl(var(--chart-1))' },
    { name: 'Fatturato', value: ricaviFatturati, color: 'hsl(var(--chart-2))' },
    { name: 'Previsto', value: ricaviPrevisti, color: 'hsl(var(--chart-3))' },
  ].filter(d => d.value > 0);

  // Data for pie chart - costs
  const costiChartData = [
    { name: 'Pagato', value: costiPagati, color: 'hsl(var(--chart-4))' },
    { name: 'Previsto', value: costiPrevisti, color: 'hsl(var(--chart-5))' },
  ].filter(d => d.value > 0);

  // Progress percentage
  const progressPercentage = totaleRicavi > 0 ? Math.round((ricaviIncassati / totaleRicavi) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/progetti')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">{project.codice}</span>
            <Badge variant={project.stato === 'Attivo' ? 'default' : 'secondary'}>
              {project.stato}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{project.nome}</h1>
          <p className="text-muted-foreground">{project.cliente}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Ricavi totali
            </div>
            <p className="text-xl font-bold">{formatCurrency(totaleRicavi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Incassato
            </div>
            <p className="text-xl font-bold text-chart-1">{formatCurrency(ricaviIncassati)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingDown className="h-4 w-4" />
              Costi totali
            </div>
            <p className="text-xl font-bold">{formatCurrency(totaleCosti)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              Avanzamento
            </div>
            <p className="text-xl font-bold">{progressPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ricavi Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stato Ricavi</CardTitle>
          </CardHeader>
          <CardContent>
            {ricaviChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ricaviChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ricaviChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nessun ricavo registrato
              </div>
            )}
          </CardContent>
        </Card>

        {/* Costi Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stato Costi</CardTitle>
          </CardHeader>
          <CardContent>
            {costiChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costiChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costiChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nessun costo registrato
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fasi List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fasi del Progetto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fasi?.map(fase => (
              <div key={fase.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fase.fase}</span>
                    <Badge variant={fase.stato === 'Incassato' || fase.stato === 'Pagato' ? 'default' : 'outline'} className="text-xs">
                      {fase.stato}
                    </Badge>
                    <Badge variant={fase.tipo === 'Ricavo' ? 'secondary' : 'destructive'} className="text-xs">
                      {fase.tipo}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fase.data_effettiva ? formatDate(fase.data_effettiva) : formatDate(fase.data_prevista)} • {fase.categoria}
                  </p>
                </div>
                <span className={`font-bold ${fase.tipo === 'Ricavo' ? 'text-chart-1' : 'text-chart-4'}`}>
                  {fase.tipo === 'Costo' ? '-' : ''}{formatCurrency(fase.importo)}
                </span>
              </div>
            ))}
            {(!fasi || fasi.length === 0) && (
              <p className="text-muted-foreground text-center py-4">Nessuna fase registrata</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
