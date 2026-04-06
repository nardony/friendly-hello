import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
// signUp removed - account creation is done externally
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Zap, LogOut, Coins, ShoppingCart, MessageCircle } from 'lucide-react';
import { PanelCheckoutModal } from '@/components/PanelCheckoutModal';

const AuthRevenda2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotRegistered, setShowNotRegistered] = useState(false);
  const [failedEmail, setFailedEmail] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { signOut, user, loading } = useAuth();
  const navigate = useNavigate();

  const redirectTo = new URLSearchParams(window.location.search).get('redirect');
  const isLogout = new URLSearchParams(window.location.search).get('logout') === '1';

  useEffect(() => {
    if (user && !isLogout) {
      const fetchBalance = async () => {
        const { data } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        setBalance(data?.balance ?? 0);
      };
      fetchBalance();
    }
  }, [user, isLogout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowNotRegistered(false);
    setFailedEmail('');

    try {
      const proxyUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/auth-proxy`;
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Email ou senha incorretos');
        if (res.status === 401) {
          setShowNotRegistered(true);
          setFailedEmail(email);
        }
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        toast.error('Erro ao estabelecer sessão');
        return;
      }

      toast.success('Login realizado com sucesso!');
      navigate(redirectTo || '/gerador');
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setBalance(null);
    toast.success('Você saiu da conta.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !isLogout) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <Card className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">
                Você já está logado!
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {user.email}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-sm text-white/50">Seus créditos</span>
              </div>
              <p className="text-3xl font-bold text-white font-mono tabular-nums">
                {balance !== null ? balance.toLocaleString('pt-BR') : <Loader2 className="w-5 h-5 animate-spin mx-auto" />}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-[0_0_30px_hsl(270_100%_65%_/_0.4)]"
                onClick={() => navigate(redirectTo || '/gerador')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Acessar Gerador de Créditos
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showNotRegistered) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <Card className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <ShoppingCart className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-white">
                Email não cadastrado
              </h1>
              <p className="text-sm text-white/50 mt-2">
                O email <span className="font-semibold text-white">{failedEmail}</span> não possui conta no painel.
              </p>
              <p className="text-sm text-white/50 mt-1">
                Para ter acesso ao Gerador de Créditos, adquira o Painel por <span className="font-bold text-primary text-lg">R$ 199,00</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-[0_0_30px_hsl(270_100%_65%_/_0.4)]"
                onClick={() => setShowCheckoutModal(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar Painel — R$ 199,00
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2 border-white/20 bg-white/5 hover:bg-white/10 text-white"
                onClick={() => {
                  const message = encodeURIComponent(
                    `Olá! Quero adquirir o Painel Gerador de Créditos. Meu email: ${failedEmail}`
                  );
                  window.open(`https://wa.me/5548996029392?text=${message}`, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Falar com Suporte via WhatsApp
              </Button>

              <Button
                variant="ghost"
                className="w-full text-white/50 hover:text-white"
                onClick={() => {
                  setShowNotRegistered(false);
                  setFailedEmail('');
                }}
              >
                Tentar outro email
              </Button>
            </div>
          </CardContent>
        </Card>
        <PanelCheckoutModal
          open={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <Card className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Gerador de Créditos
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Faça login para acessar o gerador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="off"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="off"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-[0_0_30px_hsl(270_100%_65%_/_0.4)]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRevenda2;
