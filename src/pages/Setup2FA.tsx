import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Setup2FA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    enrollMFA();
  }, [user]);

  const enrollMFA = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'DPA Studio Account',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (error: any) {
      toast.error('errore durante la configurazione 2FA: ' + error.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a challenge first
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // Verify the code
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });

      if (error) throw error;

      toast.success('autenticazione a due fattori attivata!');
      navigate('/');
    } catch (error: any) {
      toast.error('codice non valido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && enrolling) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">configurazione 2FA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>configura autenticazione a due fattori</CardTitle>
          <CardDescription>
            scansiona il QR code con un'app di autenticazione come Google Authenticator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">oppure inserisci manualmente:</p>
                <code className="bg-secondary px-2 py-1 rounded text-sm break-all">{secret}</code>
              </div>
            </div>
          )}

          <form onSubmit={verifyAndEnable} className="space-y-4">
            <div>
              <Label htmlFor="code">codice di verifica</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                salta per ora
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'verifica...' : 'verifica e attiva'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
