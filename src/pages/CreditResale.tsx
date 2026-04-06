import { useState, useMemo, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Wallet, X, Copy, Check, AlertTriangle, Clock, Loader2, Send, Upload, User, Phone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePixQRCode } from '@/lib/pix';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import backgroundHero from '@/assets/background-hero.png';
import { APP_VERSION, LAST_UPDATE } from '@/config/version';

const POPULAR_PACKAGES = [
  { credits: 100, price: 3.5, discount: null },
  { credits: 500, price: 15.17, discount: '10% off' },
  { credits: 1000, price: 24.5, discount: '20% off' },
  { credits: 2000, price: 47.25, discount: '30% off' },
  { credits: 5000, price: 105.0, discount: '40% off' },
  { credits: 10000, price: 196.0, discount: '44% off' },
];

const PIX_KEY = '+5548996029392';
const PIX_NAME = 'Marcondes Jorge Machado';

const BASE_RATE = 3.5 / 100;

function calculatePrice(credits: number): number {
  if (credits >= 10000) return credits * (196 / 10000);
  if (credits >= 5000) return credits * (105 / 5000);
  if (credits >= 2000) return credits * (47.25 / 2000);
  if (credits >= 1000) return credits * (24.5 / 1000);
  if (credits >= 500) return credits * (15.17 / 500);
  return credits * BASE_RATE;
}

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

function formatCurrency(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CreditResale = () => {
  const [credits, setCredits] = useState(5000);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(5);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [pixQrUrl, setPixQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [insufficientInfo, setInsufficientInfo] = useState<{ needed: number; credits: number } | null>(null);
  const [pixTimer, setPixTimer] = useState(600);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmCpf, setConfirmCpf] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');
  const [confirmReceipt, setConfirmReceipt] = useState<File | null>(null);
  const [adminWhatsapp, setAdminWhatsapp] = useState('5548996029392');
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Timer for PIX expiration
  useEffect(() => {
    if (pixGenerated) {
      setPixTimer(600);
      timerRef.current = setInterval(() => {
        setPixTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pixGenerated]);

  // Fetch user balance
  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      setUserBalance(data?.balance ?? 0);
    };
    fetchBalance();
  }, [user]);

  // Fetch admin whatsapp and refresh button setting
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'show_refresh_button']);
      data?.forEach((item) => {
        if (item.key === 'whatsapp_number' && item.value) setAdminWhatsapp(item.value);
        if (item.key === 'show_refresh_button') setShowRefreshButton(item.value === 'true');
      });
    };
    fetchSettings();
  }, []);

  const price = useMemo(() => calculatePrice(credits), [credits]);
  const ratePer100 = useMemo(() => (price / credits) * 100, [price, credits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSendConfirmation = () => {
    if (!confirmName.trim() || !confirmCpf.trim() || !confirmPhone.trim()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const message = `✅ *CONFIRMAÇÃO DE PAGAMENTO PIX*

💰 *Valor:* R$ ${formatCurrency(balanceAmount)}

👤 *Dados do pagador:*
• Nome: ${confirmName.trim()}
• CPF: ${confirmCpf.trim()}
• Celular: ${confirmPhone.trim()}

${confirmReceipt ? '📎 *Comprovante:* Será enviado em seguida' : '📎 *Comprovante:* Não anexado'}

📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecionando para o WhatsApp...');
    setShowConfirmForm(false);
    setConfirmName('');
    setConfirmCpf('');
    setConfirmPhone('');
    setConfirmReceipt(null);
    closeBalanceModal();
  };

  const handlePackageClick = (pkg: typeof POPULAR_PACKAGES[0]) => {
    setCredits(pkg.credits);
  };

  const handleGeneratePix = () => {
    const amount = Math.max(5, balanceAmount);
    const { payload, qrCodeUrl } = generatePixQRCode({
      pixKey: PIX_KEY,
      merchantName: PIX_NAME,
      amount,
      txId: 'SALDO',
      description: 'Adicionar Saldo',
    }, 250);
    setPixPayload(payload);
    setPixQrUrl(qrCodeUrl);
    setPixGenerated(true);
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const closeBalanceModal = () => {
    setShowBalanceModal(false);
    setPixGenerated(false);
    setPixPayload('');
    setPixQrUrl('');
    setCopied(false);
    setInsufficientInfo(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.06] bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundHero})` }}
      />
      <div className="absolute inset-0 bg-background/95" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Gerador de Créditos{' '}
            <span className="text-primary">Compra Curso</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Escolha a quantidade, pague via PIX e seus créditos são gerados automaticamente.
          </p>
        </div>

        {/* Main card */}
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 md:p-10 space-y-8">
          {/* Credits selector */}
          <div className="space-y-5">
            <h2 className="text-xs font-bold tracking-widest text-center text-muted-foreground uppercase">
              Quantidade de Créditos
            </h2>

            <div className="flex items-center justify-center">
              <div className="rounded-xl border border-border bg-secondary/60 px-8 py-4 min-w-[160px] text-center">
                <span className="text-4xl font-black text-foreground">
                  {formatNumber(credits)}
                </span>
              </div>
            </div>

            <Slider
              value={[credits]}
              onValueChange={(v) => setCredits(v[0])}
              min={5}
              max={10000}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>10.000</span>
            </div>
          </div>

          {/* Price display */}
          <div className="rounded-xl border border-border bg-secondary/40 p-6 text-center space-y-1">
            <p className="text-4xl md:text-5xl font-black text-foreground">
              R$ {formatCurrency(price)}
            </p>
            <p className="text-sm text-muted-foreground">
              R$ {formatCurrency(ratePer100)} por cada 100 créditos
            </p>
          </div>

          {/* Popular packages */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-center text-muted-foreground uppercase">
              Pacotes Populares
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {POPULAR_PACKAGES.map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => handlePackageClick(pkg)}
                  className={`relative rounded-xl border p-3 text-center transition-all hover:scale-105 cursor-pointer ${
                    credits === pkg.credits
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-secondary/40 hover:border-muted-foreground/40'
                  }`}
                >
                  {pkg.discount && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {pkg.discount}
                    </span>
                  )}
                  <p className="font-bold text-sm text-foreground">
                    {formatNumber(pkg.credits)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    R$ {formatCurrency(pkg.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="hero"
            size="xl"
            className="w-full text-lg font-bold py-6 bg-primary hover:bg-primary/90"
            onClick={() => {
              if (!user) {
                toast.error('Faça login para gerar créditos');
                navigate('/authrevenda');
                return;
              }
              const needed = price - userBalance;
              if (needed > 0) {
                setInsufficientInfo({ needed, credits });
                setBalanceAmount(Math.max(5, Math.ceil(needed)));
                setShowBalanceModal(true);
              } else {
                navigate(`/checkout?credits=${credits}&price=${price.toFixed(2)}`);
              }
            }}
          >
            <Zap className="w-5 h-5" />
            Gerar {formatNumber(credits)} Créditos
          </Button>

          {/* Add Balance Button */}
          <Button
            variant="outline"
            size="xl"
            className="w-full text-base font-bold py-6 border-border bg-secondary/60 hover:bg-secondary"
            onClick={() => {
              if (!user) {
                toast.error('Faça login para adicionar saldo');
                navigate('/authrevenda');
                return;
              }
              setShowBalanceModal(true);
            }}
          >
            <Wallet className="w-5 h-5" />
            Adicionar Saldo
          </Button>
        </div>

        {/* Login link */}
        <p className="mt-6 text-sm text-muted-foreground">
          Já tem conta?{' '}
          <a href="/authrevenda" className="text-primary hover:underline font-medium">
            Entrar
          </a>
        </p>
      </div>

      {/* Add Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 space-y-5 relative">
            <button
              onClick={closeBalanceModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Adicionar Saldo
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escaneie o QR Code ou copie o código PIX.
              </p>
            </div>

            {!pixGenerated ? (
              <div className="space-y-4">
                {insufficientInfo && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Saldo insuficiente</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Você precisa de mais R$ {formatCurrency(insufficientInfo.needed)} para gerar {formatNumber(insufficientInfo.credits)} créditos
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Valor (R$) — mínimo R$ 5,00
                  </label>
                  <Input
                    type="number"
                    min={5}
                    step={1}
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(Math.max(5, Number(e.target.value)))}
                    className="text-base"
                  />
                </div>

                <Button
                  className="w-full font-bold"
                  size="lg"
                  onClick={handleGeneratePix}
                >
                  <Zap className="w-4 h-4" />
                  Gerar PIX de R$ {formatCurrency(Math.max(5, balanceAmount))}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                {/* Countdown timer */}
                <div className="flex items-center justify-center gap-2 bg-secondary/60 rounded-lg py-2 px-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono font-bold text-foreground">
                    {String(Math.floor(pixTimer / 60)).padStart(2, '0')}:{String(pixTimer % 60).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-muted-foreground">para pagar</span>
                </div>

                {/* Amount */}
                <p className="text-2xl font-black text-primary">
                  R$ {formatCurrency(Math.max(5, balanceAmount))}
                </p>

                {/* QR Code */}
                <div className="bg-secondary/40 rounded-xl p-4 inline-block mx-auto">
                  <img
                    src={pixQrUrl}
                    alt="QR Code PIX"
                    className="rounded-lg w-[200px] h-[200px]"
                  />
                </div>

                {/* Copy button */}
                <Button
                  className="w-full font-bold"
                  size="lg"
                  onClick={handleCopyPix}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Código PIX'}
                </Button>

                {/* Payload preview */}
                <div className="bg-secondary/40 rounded-lg px-3 py-2 overflow-hidden">
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {pixPayload}
                  </p>
                </div>

                {/* Confirm payment button / form */}
                {!showConfirmForm ? (
                  <Button
                    variant="outline"
                    className="w-full font-bold border-accent text-accent hover:bg-accent/10"
                    size="lg"
                    onClick={() => setShowConfirmForm(true)}
                  >
                    <Check className="w-4 h-4" />
                    Já fiz o pagamento
                  </Button>
                ) : (
                  <div className="space-y-3 bg-background/50 rounded-xl border border-border/50 p-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Send className="w-4 h-4 text-primary" />
                      Confirmar Pagamento
                    </h4>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-name" className="text-xs flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Nome completo *
                      </Label>
                      <Input
                        id="confirm-name"
                        placeholder="Seu nome completo"
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        className="bg-background/50 h-9 text-sm"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-cpf" className="text-xs flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" /> CPF *
                      </Label>
                      <Input
                        id="confirm-cpf"
                        placeholder="000.000.000-00"
                        value={confirmCpf}
                        onChange={(e) => setConfirmCpf(formatCpf(e.target.value))}
                        className="bg-background/50 h-9 text-sm"
                        maxLength={14}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-phone" className="text-xs flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Celular *
                      </Label>
                      <Input
                        id="confirm-phone"
                        placeholder="(00) 00000-0000"
                        value={confirmPhone}
                        onChange={(e) => setConfirmPhone(formatPhoneInput(e.target.value))}
                        className="bg-background/50 h-9 text-sm"
                        maxLength={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-receipt" className="text-xs flex items-center gap-1.5">
                        <Upload className="w-3 h-3" /> Comprovante (opcional)
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="confirm-receipt"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setConfirmReceipt(file);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                        {confirmReceipt ? confirmReceipt.name : 'Anexar comprovante'}
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-9 text-xs"
                        onClick={() => setShowConfirmForm(false)}
                      >
                        Voltar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-9 text-xs font-bold gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={handleSendConfirmation}
                      >
                        <Send className="w-3 h-3" />
                        Enviar via WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Após confirmar, o saldo será adicionado pelo administrador.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border py-6 text-center text-muted-foreground text-sm mt-auto space-y-3">
        {showRefreshButton && (
          <Button
            variant="outline"
            size="sm"
            className="mx-auto"
            onClick={() => window.location.reload()}
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Atualizar Página
          </Button>
        )}
        <p>© 2026 Curso Lovable. Todos os direitos reservados.</p>
        <p className="text-xs flex items-center justify-center gap-2 mb-16">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Versão {APP_VERSION}
          </span>
          <span>•</span>
          <span>Atualizado em {LAST_UPDATE}</span>
        </p>
      </footer>
    </div>
  );
};

export default CreditResale;
