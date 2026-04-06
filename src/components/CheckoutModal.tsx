import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Shield, Wallet, Link as LinkIcon, Tag, Loader2, CheckCircle, Eye, EyeOff, RefreshCw, X, Sparkles, Copy, Send, Phone, Globe, UserCircle, ChevronRight, ArrowLeft, Paperclip, ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PricingTier } from './PricingTiersSection';
import { generatePixPayload, generatePixQRCodeUrl, validatePixKey } from '@/lib/pix';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PricingTier | null;
  landingPageId: string;
  primaryColor?: string;
  accentColor?: string;
  // Checkout configuration
  showBalance?: boolean;
  balanceLabel?: string;
  securityText?: string;
  inviteEnabled?: boolean;
  inviteLabel?: string;
  invitePlaceholder?: string;
  couponEnabled?: boolean;
  couponLabel?: string;
  buttonText?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  // PIX configuration
  pixEnabled?: boolean;
  pixKey?: string;
  pixName?: string;
  pixQrBase?: string;
}

type Step = 'delivery' | 'checkout' | 'warning' | 'payment-method' | 'pix' | 'signup' | 'success';

export const CheckoutModal = ({
  isOpen,
  onClose,
  tier,
  landingPageId,
  primaryColor = '#8B5CF6',
  accentColor = '#22C55E',
  showBalance = true,
  balanceLabel = 'Seu saldo:',
  securityText = 'Pagamento 100% seguro',
  inviteEnabled = true,
  inviteLabel = 'Link de Convite',
  invitePlaceholder = 'https://lovable.dev/invite/...',
  couponEnabled = true,
  couponLabel = 'Cupom de Desconto',
  buttonText = 'Continuar para Pagamento',
  whatsappNumber = '',
  whatsappMessage = '',
  pixEnabled = false,
  pixKey = '',
  pixName = '',
  pixQrBase = ''
}: CheckoutModalProps) => {
  const [step, setStep] = useState<Step>('checkout');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [useBalanceAsDiscount, setUseBalanceAsDiscount] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [surname, setSurname] = useState('');
  const [sendLinkNow, setSendLinkNow] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  // Calculate discount and final price
  const calculateDiscount = () => {
    if (!tier || !useBalanceAsDiscount || userBalance <= 0) return { discount: 0, finalPrice: tier?.price_current || 0, creditsUsed: 0 };
    
    // Each credit is worth R$ 0.10 as discount (adjust this rate as needed)
    const creditValueInReais = 0.10;
    const maxDiscountFromBalance = userBalance * creditValueInReais;
    const discount = Math.min(maxDiscountFromBalance, tier.price_current);
    const creditsUsed = Math.ceil(discount / creditValueInReais);
    const finalPrice = Math.max(0, tier.price_current - discount);
    
    return { discount, finalPrice, creditsUsed };
  };

  const { discount, finalPrice, creditsUsed } = calculateDiscount();

  const fetchBalance = useCallback(async (userId: string, showLoading = false) => {
    if (showLoading) setLoadingBalance(true);
    try {
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (balanceError) {
        console.error('Error fetching user balance:', balanceError);
        return;
      }

      setUserBalance((balanceData?.balance as number) || 0);
    } finally {
      if (showLoading) setLoadingBalance(false);
    }
  }, []);

  const handleManualRefresh = () => {
    if (user?.id) {
      fetchBalance(user.id, true);
    }
  };

  const refreshUserContext = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const sessionUser = session?.user ?? null;
    setUser(sessionUser);

    if (!sessionUser) {
      setUserBalance(0);
      return;
    }

    // Pre-fill email
    setEmail(sessionUser.email || '');

    // Try to get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', sessionUser.id)
      .maybeSingle();

    if (profile?.full_name) {
      setName(profile.full_name);
    }

    await fetchBalance(sessionUser.id);
  }, [fetchBalance]);

  useEffect(() => {
    if (isOpen) {
      refreshUserContext();
      setStep('delivery');

      // Keep in sync if auth state changes while the modal is open
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const sessionUser = session?.user ?? null;
          setUser(sessionUser);

          if (sessionUser) {
            setEmail(sessionUser.email || '');
            fetchBalance(sessionUser.id);
          } else {
            setUserBalance(0);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [isOpen, refreshUserContext, fetchBalance]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    // Subscribe to realtime changes on user_balances
    const channel = supabase
      .channel(`balance-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime balance update:', payload);
          if (payload.new && 'balance' in payload.new) {
            setUserBalance((payload.new as { balance: number }).balance);
          }
        }
      )
      .subscribe();

    // Refetch when user returns to the tab/window (as fallback)
    const handleFocus = () => fetchBalance(user.id);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchBalance(user.id);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, user?.id, fetchBalance]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatWhatsapp = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsapp(e.target.value));
  };

  const handleSignup = async () => {
    if (!name || !whatsapp || !email || !password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Faça login.');
          return;
        }
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        setStep('checkout');
        toast.success('Conta criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!tier) return;
    
    if (!name || !whatsapp || !email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // If not logged in, go to signup
    if (!user) {
      setStep('signup');
      return;
    }

    setLoading(true);
    try {
      // If using balance as discount, deduct credits first
      if (useBalanceAsDiscount && creditsUsed > 0) {
        const { error: balanceError } = await supabase.rpc('update_user_balance', {
          _user_id: user.id,
          _amount: creditsUsed,
          _type: 'debit',
          _description: `Desconto no pedido - ${tier.name}`,
          _order_id: null,
          _admin_id: null
        });

        if (balanceError) {
          console.error('Error deducting balance:', balanceError);
          toast.error('Erro ao aplicar desconto do saldo');
          setLoading(false);
          return;
        }

        // Optimistic UI + ensure sync
        setUserBalance((prev) => Math.max(0, prev - creditsUsed));
        fetchBalance(user.id);
      }

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          landing_page_id: landingPageId,
          tier_id: tier.id,
          tier_name: tier.name,
          credits: tier.credits,
          price: finalPrice, // Use final price after discount
          customer_name: name,
          customer_whatsapp: whatsapp.replace(/\D/g, ''),
          customer_email: email,
          invite_link: sendLinkNow ? inviteLink : null,
          coupon_code: couponCode || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Pedido registrado! Redirecionando...');
      
      // Build WhatsApp message with order details
      const formattedPrice = formatPrice(finalPrice);
      const formattedOriginalPrice = formatPrice(tier.price_current);
      const discountText = useBalanceAsDiscount && discount > 0 
        ? `💎 *Desconto (${creditsUsed} créditos):* -${formatPrice(discount)}\n💰 *Valor Original:* ${formattedOriginalPrice}\n💰 *Valor Final:* ${formattedPrice}`
        : `💰 *Valor:* ${formattedPrice}`;
      const linkConviteText = sendLinkNow && inviteLink 
        ? `🔗 *Link de Convite:* ${inviteLink}` 
        : '⏳ *Link de Convite:* Será enviado depois';
      const cupomText = couponCode ? `🎫 *Cupom:* ${couponCode}` : '';
      
      // Use custom template if provided, otherwise use default
      let orderMessage: string;
      if (whatsappMessage) {
        orderMessage = whatsappMessage
          .replace('{pacote}', tier.name)
          .replace('{creditos}', tier.credits.toLocaleString('pt-BR'))
          .replace('{valor}', formattedPrice)
          .replace('{nome}', name)
          .replace('{whatsapp}', whatsapp)
          .replace('{email}', email)
          .replace('{link_convite}', linkConviteText)
          .replace('{cupom}', cupomText)
          .replace('{data}', new Date().toLocaleString('pt-BR'));
      } else {
        orderMessage = `🛒 *NOVO PEDIDO*

📦 *Pacote:* ${tier.name}
💳 *Créditos:* ${tier.credits.toLocaleString('pt-BR')}
${discountText}

👤 *Cliente:*
• Nome: ${name}
• WhatsApp: ${whatsapp}
• Email: ${email}

${linkConviteText}
${cupomText}

📅 *Data:* ${new Date().toLocaleString('pt-BR')}`;
      }

      // Send to WhatsApp if number is configured
      if (whatsappNumber) {
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(orderMessage);
        window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
      }
      
      // Also redirect to checkout link if available
      if (tier.checkout_link) {
        window.open(tier.checkout_link, '_blank');
        handleClose();
      } else {
        setStep('success');
      }
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('delivery');
    setName('');
    setSurname('');
    setWhatsapp('');
    setEmail('');
    setPassword('');
    setInviteLink('');
    setCouponCode('');
    setCpf('');
    setReceiptFile(null);
    setReceiptPreview(null);
    onClose();
  };

  if (!tier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 border-0">
        {step === 'delivery' && (
          <div className="flex flex-col">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-0 pt-6 pb-2 px-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1 text-muted-foreground">Pacote</span>
              </div>
              <div className="w-10 h-0.5 mt-[-12px]" style={{ backgroundColor: primaryColor }} />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  2
                </div>
                <span className="text-xs mt-1 font-semibold" style={{ color: primaryColor }}>Entrega</span>
              </div>
              <div className="w-10 h-0.5 mt-[-12px] bg-border" />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-muted text-muted-foreground">
                  3
                </div>
                <span className="text-xs mt-1 text-muted-foreground">Dados</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Icon & Title */}
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">Como Você Vai Receber</h2>
                <p className="text-sm text-muted-foreground">Envie seu link invite e carregamos seus créditos</p>
              </div>

              {/* Option 2: Workspace Próprio */}
              <div 
                className="p-4 rounded-xl border-2 space-y-2 cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}05` }}
                onClick={() => setStep('checkout')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                    <UserCircle className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Workspace Próprio</h3>
                    <p className="text-xs font-medium text-muted-foreground">Para quem já tem projetos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Após pagamento enviaremos um email para você adicionar no link de convite de membros. Ensinaremos via WhatsApp.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>Mantém seus projetos atuais</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </div>

            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="flex flex-col">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-0 pt-6 pb-2 px-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1 text-muted-foreground">Pacote</span>
              </div>
              <div className="w-10 h-0.5 mt-[-12px]" style={{ backgroundColor: primaryColor }} />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1 text-muted-foreground">Entrega</span>
              </div>
              <div className="w-10 h-0.5 mt-[-12px]" style={{ backgroundColor: primaryColor }} />
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  3
                </div>
                <span className="text-xs mt-1 font-semibold" style={{ color: primaryColor }}>Dados</span>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Icon & Title */}
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <UserCircle className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">Dados para Pagamento</h2>
                <p className="text-sm text-muted-foreground">Preencha seus dados para gerar o PIX</p>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={{ backgroundColor: `${primaryColor}10` }}>
                  Resumo do Pedido
                </div>
                <div className="divide-y divide-border/30">
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span className="text-muted-foreground">Créditos Comprados:</span>
                    </div>
                    <span className="font-bold text-foreground">{tier.credits.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span>🎁</span>
                      <span className="text-muted-foreground">Créditos Grátis:</span>
                    </div>
                    <span className="font-bold" style={{ color: accentColor }}>+{(tier.bonus_credits || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 text-sm" style={{ backgroundColor: `${primaryColor}08` }}>
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span className="font-medium text-foreground">Total de Créditos:</span>
                    </div>
                    <span className="font-bold text-foreground">{(tier.credits + (tier.bonus_credits || 0)).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: `linear-gradient(90deg, ${primaryColor}15, ${accentColor}15)` }}>
                    <span className="font-semibold text-foreground">Valor a Pagar:</span>
                    <span className="text-xl font-bold" style={{ color: accentColor }}>
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João"
                      className="bg-background border-2 h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Sobrenome</Label>
                    <Input
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Silva"
                      className="bg-background border-2 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-background border-2 h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">WhatsApp</Label>
                    <Input
                      value={whatsapp}
                      onChange={handleWhatsappChange}
                      placeholder="(11) 99999-9999"
                      className="bg-background border-2 h-11"
                      maxLength={16}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">CPF</Label>
                    <Input
                      value={cpf}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (digits.length <= 3) setCpf(digits);
                        else if (digits.length <= 6) setCpf(`${digits.slice(0, 3)}.${digits.slice(3)}`);
                        else if (digits.length <= 9) setCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`);
                        else setCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`);
                      }}
                      placeholder="000.000.000-00"
                      className="bg-background border-2 h-11"
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* Coupon */}
                {couponEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span className="text-sm font-medium">{couponLabel}</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Digite o cupom"
                        className="bg-background border-2 h-11 flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="h-11 px-4 font-medium"
                        disabled={!couponCode}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep('delivery')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 text-white font-semibold text-base"
                  style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
                  onClick={() => {
                    if (!tier) return;
                    if (!name || !whatsapp || !email) {
                      toast.error('Preencha todos os campos obrigatórios');
                      return;
                    }
                    setStep('warning');
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Gerar PIX'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'warning' && (
          <div className="flex flex-col">
            <div className="flex items-center justify-end p-4">
              <button 
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Warning Icon & Title */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20">
                    <Shield className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">Recomendação Importante</h2>
                <p className="text-sm text-muted-foreground">
                  O uso mais seguro é em <strong className="text-foreground">conta nova</strong>. Contas que abusaram de recargas ou acumularam volumes elevados já foram desativadas pela plataforma.
                </p>
              </div>

              {/* Warning Card */}
              <div className="p-4 rounded-xl border border-border/50 bg-card/50 space-y-2">
                <p className="text-sm font-semibold text-foreground">Se optar por recarregar na conta principal:</p>
                <p className="text-sm text-muted-foreground">
                  Você assume o risco. A alternativa recomendada é usar uma conta nova, dedicada aos projetos.
                </p>
              </div>

              {/* Support Card */}
              <div className="p-4 rounded-xl border-2 space-y-2" style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}08` }}>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="text-sm font-semibold text-foreground">Suporte incluso</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Envio um vídeo passo a passo ensinando como migrar seu projeto para uma conta nova com créditos, para você evoluir sem preocupação.
                </p>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-center text-muted-foreground">
                A Lovable pode alterar regras internas sem aviso prévio. Essas decisões não estão sob nosso controle.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep('checkout')}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-12 text-white font-semibold"
                  style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
                  onClick={() => setStep('pix')}
                  disabled={loading}
                >
                  Entendi e Concordo
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'payment-method' && (
          <div className="flex flex-col">
            <div className="flex items-center justify-end p-4">
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Wallet className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">Escolha o Pagamento</h2>
                <p className="text-sm text-muted-foreground">
                  Valor: <strong style={{ color: accentColor }}>{formatPrice(finalPrice)}</strong>
                </p>
              </div>

              {/* PIX Option */}
              {pixEnabled && pixKey && (
                <div
                  className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}08` }}
                  onClick={() => setStep('pix')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                      <Wallet className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">PIX</h3>
                      <p className="text-xs text-muted-foreground">Pagamento instantâneo • Só Brasil</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              )}


              {/* Support notice */}
              <div className="p-3 rounded-xl border border-border/50 bg-card/50 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Problemas com o pagamento? Fale com nosso suporte
                </p>
                <a
                  href={`https://wa.me/${(whatsappNumber?.replace(/\D/g, '')) || '5548996029392'}?text=${encodeURIComponent('Olá! Estou com um problema no pagamento e preciso de ajuda.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#25D366', color: '#fff' }}
                >
                  <Phone className="w-4 h-4" />
                  Suporte via WhatsApp
                </a>
              </div>

              {/* Back button */}
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => setStep('warning')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        )}

        {step === 'pix' && (() => {
          const pixPayload = pixEnabled && pixKey && pixName
            ? generatePixPayload({
                pixKey,
                merchantName: pixName,
                amount: finalPrice,
                txId: `PED${Date.now().toString(36).toUpperCase()}`,
              })
            : null;
          const qrCodeUrl = pixPayload
            ? generatePixQRCodeUrl(pixPayload, 250)
            : null;

          return (
            <div className="flex flex-col">
              <div className="flex items-center justify-end p-4">
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pb-6 space-y-5">
                {/* Title */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                      <Wallet className="w-6 h-6" style={{ color: accentColor }} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Pagamento via PIX</h2>
                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o código para pagar <strong style={{ color: accentColor }}>{formatPrice(finalPrice)}</strong>
                  </p>
                </div>

                {/* QR Code */}
                {qrCodeUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-3 rounded-xl">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code PIX"
                        className="w-[220px] h-[220px]"
                      />
                    </div>

                    {/* Copia e Cola */}
                    <div className="w-full space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">PIX Copia e Cola</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={pixPayload || ''}
                          className="bg-background border-2 h-11 text-xs font-mono flex-1"
                        />
                        <Button
                          variant="outline"
                          className="h-11 px-4 gap-2"
                          onClick={() => {
                            if (pixPayload) {
                              navigator.clipboard.writeText(pixPayload);
                              toast.success('Código PIX copiado!');
                            }
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </Button>
                      </div>
                    </div>

                    {/* Chave PIX para copiar */}
                    <div className="w-full space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Chave PIX</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={pixKey || ''}
                          className="bg-background border-2 h-11 text-sm font-mono flex-1"
                        />
                        <Button
                          variant="outline"
                          className="h-11 px-4 gap-2"
                          onClick={() => {
                            if (pixKey) {
                              navigator.clipboard.writeText(pixKey);
                              toast.success('Chave PIX copiada!');
                            }
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </Button>
                      </div>
                    </div>

                    {/* Beneficiário */}
                    <div className="w-full p-3 rounded-lg border border-border/50 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Beneficiário:</span>
                        <span className="font-medium text-foreground">{pixName}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Valor:</span>
                        <span className="font-bold" style={{ color: accentColor }}>{formatPrice(finalPrice)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 rounded-xl border border-destructive/30 bg-destructive/5">
                    <p className="text-sm text-destructive">PIX não configurado. Entre em contato com o vendedor.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setStep('warning')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 h-12 text-white font-semibold text-base"
                    style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
                    onClick={handleSubmitOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-1" />
                        Já Paguei
                      </>
                    )}
                  </Button>
                </div>

                {/* WhatsApp support */}
                {whatsappNumber && (
                  <div className="text-center">
                    <button
                      className="text-sm underline text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      onClick={() => {
                        const cleanNumber = whatsappNumber.replace(/\D/g, '');
                        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Olá! Acabei de fazer um pagamento PIX e gostaria de confirmar.')}`, '_blank');
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Enviar comprovante via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()
        }

        {step === 'signup' && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">💎</span>
                </div>
                <span className="font-semibold" style={{ color: primaryColor }}>CreditoPro</span>
              </div>
              <button 
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-center text-muted-foreground">Preencha seus dados para enviar o pedido</p>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nome completo</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                  className="bg-background border-2 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">WhatsApp</Label>
                <Input
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  placeholder="(00) 00000-0000"
                  className="bg-background border-2 h-11"
                  maxLength={16}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-background border-2 h-11"
                />
              </div>


              <div className="space-y-1.5">
                <Label className="text-sm font-medium" style={{ color: primaryColor }}>
                  Link de convite (opcional)
                </Label>
                <Input
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  placeholder="Cole o link de convite aqui"
                  className="bg-background border-2 h-11"
                />
              </div>

              {/* Comprovante PIX */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Comprovante do PIX</Label>
                <div 
                  className="relative border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                >
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Arquivo muito grande. Máximo 5MB.');
                          return;
                        }
                        setReceiptFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {receiptPreview ? (
                    <div className="flex items-center gap-3">
                      <img src={receiptPreview} alt="Comprovante" className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{receiptFile?.name}</p>
                        <p className="text-xs text-muted-foreground">Clique para trocar</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para anexar o comprovante</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full h-12 text-white font-semibold text-base"
                style={{ backgroundColor: '#25D366' }}
                onClick={async () => {
                  if (!name || !whatsapp || !email) {
                    toast.error('Preencha todos os campos obrigatórios');
                    return;
                  }

                  let receiptUrl = '';
                  if (receiptFile) {
                    setUploadingReceipt(true);
                    try {
                      const fileExt = receiptFile.name.split('.').pop();
                      const fileName = `comprovantes/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                      const { data, error } = await supabase.storage
                        .from('landing-pages')
                        .upload(fileName, receiptFile, { contentType: receiptFile.type });
                      if (error) throw error;
                      const { data: urlData } = supabase.storage
                        .from('landing-pages')
                        .getPublicUrl(fileName);
                      receiptUrl = urlData.publicUrl;
                    } catch (err: any) {
                      console.error('Upload error:', err);
                      toast.error('Erro ao enviar comprovante. Tente novamente.');
                      setUploadingReceipt(false);
                      return;
                    }
                    setUploadingReceipt(false);
                  }

                  const formattedPrice = formatPrice(finalPrice);
                  const linkConviteText = inviteLink 
                    ? `🔗 *Link de Convite:* ${inviteLink}` 
                    : '⏳ *Link de Convite:* Será enviado depois';
                  const comprovanteText = receiptUrl 
                    ? `🧾 *Comprovante:* ${receiptUrl}` 
                    : '⚠️ *Comprovante:* Não anexado';
                  
                  const orderMessage = `🛒 *NOVO PEDIDO*

📦 *Pacote:* ${tier.name}
💳 *Créditos:* ${tier.credits.toLocaleString('pt-BR')}
💰 *Valor:* ${formattedPrice}

👤 *Cliente:*
• Nome: ${name} ${surname}
• WhatsApp: ${whatsapp}
• Email: ${email}

${linkConviteText}
${comprovanteText}

📅 *Data:* ${new Date().toLocaleString('pt-BR')}`;

                  const cleanNumber = (whatsappNumber?.replace(/\D/g, '')) || '5548996029392';
                  window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(orderMessage)}`, '_blank');
                }}
                disabled={loading || uploadingReceipt}
              >
                {uploadingReceipt ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando comprovante...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Enviar Pedido via WhatsApp
                  </>
                )}
              </Button>

            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6">
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <CheckCircle className="w-12 h-12" style={{ color: accentColor }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Pedido Enviado!</h3>
              <p className="text-muted-foreground">
                Recebemos seu pedido de <strong>{tier.credits.toLocaleString('pt-BR')}</strong> créditos.<br />
                Você receberá instruções de pagamento em breve.
              </p>
              <Button 
                onClick={handleClose} 
                variant="outline"
                className="h-11 px-6"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
