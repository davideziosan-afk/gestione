import { usePendingApprovals, useApproveUser, useRejectUser } from '@/hooks/useUserApproval';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export default function AdminApprovals() {
  const { data: pendingApprovals, isLoading } = usePendingApprovals();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  if (isLoading) {
    return <div>caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">richieste di accesso</h2>
        <p className="text-muted-foreground">gestisci le richieste di accesso all'applicazione</p>
      </div>

      {!pendingApprovals || pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">nessuna richiesta in sospeso</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingApprovals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <CardTitle>{approval.email}</CardTitle>
                <CardDescription>
                  richiesta il {new Date(approval.created_at).toLocaleString('it-IT')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveUser.mutate({ userId: approval.user_id })}
                    disabled={approveUser.isPending || rejectUser.isPending}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    approva
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Sei sicuro di voler rifiutare ${approval.email}?`)) {
                        rejectUser.mutate({ userId: approval.user_id });
                      }
                    }}
                    disabled={approveUser.isPending || rejectUser.isPending}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    rifiuta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
