import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const authSchema = z.object({
  email: z.string().trim().email({ message: "email non valida" }).max(255).refine(
    (email) => email.endsWith('@dpastudio.it'),
    { message: "solo email @dpastudio.it sono consentite" }
  ),
  password: z.string().min(6, { message: "la password deve essere di almeno 6 caratteri" }).max(100),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      authSchema.parse({ email, password });

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('credenziali non valide');
          } else {
            toast.error(`errore: ${error.message}`);
          }
          return;
        }

        // Check if user has MFA enabled
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        
        if (factorsData && factorsData.totp && factorsData.totp.length > 0) {
          // User has MFA enabled, show MFA input
          setNeedsMfa(true);
          toast.success('inserisci il codice di autenticazione');
        } else {
          // No MFA, login successful
          toast.success('accesso effettuato');
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('email già registrata');
          } else {
            toast.error(`errore: ${error.message}`);
          }
          return;
        }

        toast.success('registrazione completata! configura ora l\'autenticazione a due fattori');
        // After signup, log them in and redirect to 2FA setup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        
        if (!signInError) {
          navigate('/setup-2fa');
        } else {
          setIsLogin(true);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('errore durante l\'autenticazione');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (!factors.data?.totp?.[0]) {
        toast.error('errore MFA');
        return;
      }

      const factorId = factors.data.totp[0].id;

      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: mfaCode,
      });

      if (verify.error) throw verify.error;

      toast.success('accesso effettuato');
      navigate('/');
    } catch (error: any) {
      toast.error('codice non valido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsMfa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>autenticazione a due fattori</CardTitle>
            <CardDescription>
              inserisci il codice dalla tua app di autenticazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div>
                <Label htmlFor="mfaCode">codice</Label>
                <Input
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'verifica...' : 'verifica'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setNeedsMfa(false);
                  setMfaCode('');
                }}
                disabled={loading}
              >
                annulla
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'accedi' : 'registrati'}</CardTitle>
          <CardDescription>
            {isLogin ? 'accedi al tuo account' : 'crea un nuovo account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'caricamento...' : (isLogin ? 'accedi' : 'registrati')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? 'non hai un account? registrati' : 'hai già un account? accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
