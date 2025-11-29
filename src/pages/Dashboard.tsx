import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/dateUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown, Euro } from "lucide-react";
import { startOfYear, endOfMonth, format, startOfMonth, addMonths, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { AIAssistant } from "@/components/AIAssistant";

export default function Dashboard() {
  // Fetch all data
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const { data: fasi } = useQuery({
    queryKey: ["fasi_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fasi_progetto").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: movimentiFissi } = useQuery({
    queryKey: ["movimenti_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("movimenti_fissi").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate KPIs
  const yearStart = startOfYear(new Date());
  const today = new Date();

  const entrateEffettive = fasi?.filter(f => 
    f.tipo === 'Ricavo' && f.stato === 'Incassato' && new Date(f.data_effettiva || f.data_prevista) >= yearStart
  ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

  const usciteEffettive = (
    fasi?.filter(f => 
      f.tipo === 'Costo' && f.stato === 'Pagato' && new Date(f.data_effettiva || f.data_prevista) >= yearStart
    ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0
  ) + (
    movimentiFissi?.filter(m => 
      m.stato === 'Pagato' && new Date(m.data_effettiva || m.data_prevista) >= yearStart
    ).reduce((sum, m) => sum + parseFloat(String(m.importo)), 0) || 0
  );

  const cassaAttuale = (settings?.cassa_iniziale || 0) + entrateEffettive - usciteEffettive;

  // Prossime scadenze (30 giorni)
  const prossimeScadenze = [
    ...(fasi?.filter(f => {
      const dataScadenza = new Date(f.data_prevista);
      const diff = differenceInDays(dataScadenza, today);
      return f.stato === 'Previsto' && diff >= 0 && diff <= 30;
    }).map(f => ({
      ...f,
      tipo_movimento: 'fase',
      direzione: f.tipo === 'Ricavo' ? 'Entrata' : 'Uscita'
    })) || []),
    ...(movimentiFissi?.filter(m => {
      const dataScadenza = new Date(m.data_prevista);
      const diff = differenceInDays(dataScadenza, today);
      return m.stato === 'Previsto' && diff >= 0 && diff <= 30;
    }).map(m => ({
      ...m,
      tipo_movimento: 'fisso',
      direzione: 'Uscita',
      tipo: 'Costo'
    })) || [])
  ].sort((a, b) => new Date(a.data_prevista).getTime() - new Date(b.data_prevista).getTime()).slice(0, 5);

  // Generate chart data (last 12 months)
  const chartData = [];
  for (let i = 11; i >= 0; i--) {
    const mese = startOfMonth(addMonths(today, -i));
    const meseEnd = endOfMonth(mese);
    
    const entrateEffettiveMese = fasi?.filter(f =>
      f.tipo === 'Ricavo' && f.stato === 'Incassato' && 
      new Date(f.data_effettiva || '') >= mese && new Date(f.data_effettiva || '') <= meseEnd
    ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

    const entratePrevisteMese = fasi?.filter(f =>
      f.tipo === 'Ricavo' && f.stato === 'Previsto' && 
      new Date(f.data_prevista) >= mese && new Date(f.data_prevista) <= meseEnd
    ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

    const usciteEffettiveMese = (
      fasi?.filter(f =>
        f.tipo === 'Costo' && f.stato === 'Pagato' && 
        new Date(f.data_effettiva || '') >= mese && new Date(f.data_effettiva || '') <= meseEnd
      ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0
    ) + (
      movimentiFissi?.filter(m =>
        m.stato === 'Pagato' && 
        new Date(m.data_effettiva || '') >= mese && new Date(m.data_effettiva || '') <= meseEnd
      ).reduce((sum, m) => sum + parseFloat(String(m.importo)), 0) || 0
    );

    const uscitePrevisteMese = (
      fasi?.filter(f =>
        f.tipo === 'Costo' && f.stato === 'Previsto' && 
        new Date(f.data_prevista) >= mese && new Date(f.data_prevista) <= meseEnd
      ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0
    ) + (
      movimentiFissi?.filter(m =>
        m.stato === 'Previsto' && 
        new Date(m.data_prevista) >= mese && new Date(m.data_prevista) <= meseEnd
      ).reduce((sum, m) => sum + parseFloat(String(m.importo)), 0) || 0
    );

    chartData.push({
      mese: format(mese, 'MMM yy', { locale: it }),
      entrateEffettive: entrateEffettiveMese,
      entratePreviste: entratePrevisteMese,
      usciteEffettive: usciteEffettiveMese,
      uscitePreviste: uscitePrevisteMese,
    });
  }

  // Calculate cumulative cash
  let cassaCumulata = settings?.cassa_iniziale || 0;
  const cassaData = chartData.map(item => {
    cassaCumulata += (item.entrateEffettive + item.entratePreviste) - (item.usciteEffettive + item.uscitePreviste);
    return {
      mese: item.mese,
      cassa: cassaCumulata,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">dashboard</h2>
        <p className="text-muted-foreground">panoramica finanziaria dello studio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">cassa attuale</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cassaAttuale)}</div>
            <p className="text-xs text-muted-foreground">
              {cassaAttuale < (settings?.soglia_allerta_cassa || 0) && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  sotto soglia allerta
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">entrate ytd</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(entrateEffettive)}</div>
            <p className="text-xs text-muted-foreground">incassato dall'inizio anno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">uscite ytd</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(usciteEffettive)}</div>
            <p className="text-xs text-muted-foreground">pagato dall'inizio anno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">margine ytd</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(entrateEffettive - usciteEffettive)}</div>
            <p className="text-xs text-muted-foreground">differenza entrate/uscite</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>entrate vs uscite</CardTitle>
            <CardDescription>ultimi 12 mesi (effettivi + previsti)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mese" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="entrateEffettive" name="entrate" fill="hsl(var(--primary))" />
                <Bar dataKey="usciteEffettive" name="uscite" fill="hsl(var(--muted-foreground))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>cassa cumulata</CardTitle>
            <CardDescription>proiezione basata su effettivi + previsti</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cassaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mese" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Line type="monotone" dataKey="cassa" name="cassa" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Prossime Scadenze */}
      <Card>
        <CardHeader>
          <CardTitle>prossime scadenze (30 giorni)</CardTitle>
          <CardDescription>movimenti previsti in scadenza</CardDescription>
        </CardHeader>
        <CardContent>
          {prossimeScadenze.length === 0 ? (
            <p className="text-sm text-muted-foreground">nessuna scadenza nei prossimi 30 giorni</p>
          ) : (
            <div className="space-y-2">
              {prossimeScadenze.map((scadenza, idx) => (
                <div key={idx} className="flex items-center justify-between border border-border p-3">
                  <div>
                    <p className="font-medium">
                      {scadenza.tipo_movimento === 'fase' ? (scadenza as any).fase : (scadenza as any).note}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(scadenza.data_prevista), 'dd/MM/yyyy', { locale: it })} · {scadenza.direzione}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(scadenza.importo)}</p>
                    <p className="text-xs text-muted-foreground">{scadenza.categoria}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}