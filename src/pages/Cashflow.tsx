import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthLabel } from "@/lib/dateUtils";
import { startOfMonth, addMonths, endOfMonth } from "date-fns";
import { AlertCircle } from "lucide-react";

export default function Cashflow() {
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

  // Generate 12 months of cashflow data
  const today = new Date();
  const cashflowData = [];
  let cassaCumulata = settings?.cassa_iniziale || 0;

  for (let i = -6; i < 6; i++) {
    const mese = startOfMonth(addMonths(today, i));
    const meseEnd = endOfMonth(mese);

    const entrateEffettive = fasi?.filter(f =>
      f.tipo === 'Ricavo' && f.stato === 'Incassato' &&
      new Date(f.data_effettiva || '') >= mese && new Date(f.data_effettiva || '') <= meseEnd
    ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

    const entratePreviste = fasi?.filter(f =>
      f.tipo === 'Ricavo' && f.stato === 'Previsto' &&
      new Date(f.data_prevista) >= mese && new Date(f.data_prevista) <= meseEnd
    ).reduce((sum, f) => sum + parseFloat(String(f.importo)), 0) || 0;

    const usciteEffettive = (
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

    const uscitePreviste = (
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

    const saldoEffettivo = entrateEffettive - usciteEffettive;
    const saldoPrevisto = entratePreviste - uscitePreviste;
    const saldoTotale = saldoEffettivo + saldoPrevisto;

    cassaCumulata += saldoTotale;

    const sottoSoglia = cassaCumulata < (settings?.soglia_allerta_cassa || 0);

    cashflowData.push({
      mese: getMonthLabel(mese),
      entrateEffettive,
      entratePreviste,
      usciteEffettive,
      uscitePreviste,
      saldoEffettivo,
      saldoPrevisto,
      saldoTotale,
      cassaCumulata,
      sottoSoglia,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">cashflow mensile</h2>
        <p className="text-muted-foreground">analisi dettagliata per mese</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>tabella cashflow</CardTitle>
          <CardDescription>ultimi 6 mesi + prossimi 6 mesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-9 gap-2 p-3 font-bold bg-secondary border border-border text-xs">
                <div>mese</div>
                <div className="text-right">entrate eff.</div>
                <div className="text-right">entrate prev.</div>
                <div className="text-right">uscite eff.</div>
                <div className="text-right">uscite prev.</div>
                <div className="text-right">saldo eff.</div>
                <div className="text-right">saldo prev.</div>
                <div className="text-right">saldo tot.</div>
                <div className="text-right">cassa cum.</div>
              </div>

              {/* Data Rows */}
              {cashflowData.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-9 gap-2 p-3 border-b border-border text-xs ${
                    row.sottoSoglia ? 'bg-destructive/10' : ''
                  }`}
                >
                  <div className="font-medium">{row.mese}</div>
                  <div className="text-right">{formatCurrency(row.entrateEffettive)}</div>
                  <div className="text-right text-muted-foreground">{formatCurrency(row.entratePreviste)}</div>
                  <div className="text-right">{formatCurrency(row.usciteEffettive)}</div>
                  <div className="text-right text-muted-foreground">{formatCurrency(row.uscitePreviste)}</div>
                  <div className="text-right font-medium">{formatCurrency(row.saldoEffettivo)}</div>
                  <div className="text-right text-muted-foreground">{formatCurrency(row.saldoPrevisto)}</div>
                  <div className="text-right font-bold">{formatCurrency(row.saldoTotale)}</div>
                  <div className="text-right font-bold flex items-center justify-end gap-1">
                    {row.sottoSoglia && <AlertCircle className="h-3 w-3 text-destructive" />}
                    {formatCurrency(row.cassaCumulata)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Nota:</strong> Effettivi = movimenti con stato Incassato/Pagato. Previsti = movimenti con stato
          Previsto. Cassa cumulata parte da cassa iniziale ({formatCurrency(settings?.cassa_iniziale || 0)}) e
          considera sia effettivi che previsti.
        </p>
      </div>
    </div>
  );
}