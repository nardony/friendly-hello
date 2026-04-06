import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Zap, LogOut, Coins, ShoppingCart, MessageCircle } from 'lucide-react';
import backgroundHero from '@/assets/background-hero.png';
import { PanelCheckoutModal } from '@/components/PanelCheckoutModal';

const AuthRevenda = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotRegistered, setShowNotRegistered] = useState(false);
  const [failedEmail, setFailedEmail] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { signIn, signUp, signOut, user, loading } = useAuth();
  const navigate = useNavigate();

  const redirectTo = new URLSearchParams(window.location.search).get('redirect');
  const isLogout = new URLSearchParams(window.location.search).get('logout') === '1';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isOAuthReturn = params.get('oauth') === '1';

    if (!loading && user && isOAuthReturn) {
      // Check if this user was just auto-created (new user with no prior account)
      const validateUser = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

          // If profile was created less than 30 seconds ago, it's a new user
          if (diffSeconds < 30) {
            // Sign out the new user
            await signOut();
            toast.error('Email não cadastrado na plataforma. Redirecionando para o suporte...');
            
            const message = encodeURIComponent(
              `Olá! Tentei acessar o Gerador de Créditos com o email ${user.email} mas não tenho conta cadastrada. Gostaria de enviar meu comprovante de pagamento para ativar meu acesso.`
            );
            setTimeout(() => {
              window.open(`https://wa.me/5548996029392?text=${message}`, '_blank');
            }, 1500);
            return;
          }
        }

        navigate(redirectTo || '/gerador');
      };
      validateUser();
    }
  }, [user, loading, navigate, redirectTo, signOut]);

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
      if (isLogin) {
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
        return;
      }

      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + '/authrevenda?oauth=1',
      extraParams: {
        prompt: "select_account",
      },
    });
    if (error) {
      toast.error('Erro ao entrar com Google');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-md border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Você já está logado!
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user.email}
              </p>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Seus créditos</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {balance !== null ? balance.toLocaleString('pt-BR') : <Loader2 className="w-5 h-5 animate-spin mx-auto" />}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => navigate(redirectTo || '/gerador')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Acessar Gerador de Créditos
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-md border-border/50">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <ShoppingCart className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-foreground">
                Email não cadastrado
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                O email <span className="font-semibold text-foreground">{failedEmail}</span> não possui conta no painel.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Para ter acesso ao Gerador de Créditos, adquira o Painel por <span className="font-bold text-primary text-lg">R$ 199,00</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => setShowCheckoutModal(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar Painel — R$ 199,00
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
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
                className="w-full text-muted-foreground"
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundHero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-md border-border/50">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Gerador de Créditos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? 'Faça login para acessar o gerador' : 'Crie sua conta para começar'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required={!isLogin}
                  className="bg-background/50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="off"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
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
                  className="bg-background/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRevenda;