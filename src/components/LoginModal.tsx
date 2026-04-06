import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import logoPainel from '@/assets/logo-dashboard.png';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        
        if (data.user && data.session) {
          toast.success('Conta criada!', {
            description: 'Bem-vindo ao painel!',
          });
          onOpenChange(false);
          navigate('/dashboard');
        } else {
          toast.success('Conta criada!', {
            description: 'Verifique seu email para confirmar a conta.',
          });
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        const { data: roleData } = await supabase.rpc('has_role', {
          _user_id: data.user.id,
          _role: 'admin'
        });
        
        toast.success('Login realizado!', {
          description: 'Bem-vindo de volta.',
        });
        onOpenChange(false);
        
        if (roleData === true) {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Ocorreu um erro. Tente novamente.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Faça login em vez de criar conta.';
        setIsSignUp(false);
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique seus dados.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      }
      
      toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm bg-card border-border mx-auto p-5">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src={logoPainel} alt="Logo" className="h-20 object-contain" />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="text-xl font-bold text-foreground">
            {t('login.title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('login.subtitle')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-foreground text-sm">{t('login.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border h-9"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-foreground text-sm">{t('login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-background border-border h-9"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            className="w-full h-9"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('login.submit')}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
};
