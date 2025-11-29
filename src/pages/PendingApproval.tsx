import { useAuth } from '@/contexts/AuthContext';
import { useUserApprovalStatus } from '@/hooks/useUserApproval';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: approvalStatus } = useUserApprovalStatus(user?.id);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('errore durante il logout');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>in attesa di approvazione</CardTitle>
          <CardDescription>
            la tua richiesta di accesso è in attesa di approvazione da parte dell'amministratore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>email:</strong> {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>data richiesta:</strong> {approvalStatus?.created_at ? new Date(approvalStatus.created_at).toLocaleString('it-IT') : '-'}
            </p>
          </div>
          <p className="text-sm">
            riceverai una notifica via email quando il tuo account sarà approvato.
            puoi chiudere questa pagina e riprovare più tardi.
          </p>
          <Button onClick={handleLogout} className="w-full">
            esci
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
