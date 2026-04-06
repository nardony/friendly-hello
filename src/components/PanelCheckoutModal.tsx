import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Check, CreditCard, User, Clock, Copy, Zap, Tag, Send, Upload, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { generatePixQRCode } from '@/lib/pix'
import { supabase } from '@/integrations/supabase/client'

const DEFAULT_PIX_KEY = '+5548996029392'
const DEFAULT_PIX_NAME = 'Marcondes Jorge Machado'
const PANEL_PRICE = 199
const ORIGINAL_PRICE = 680

const RESALE_PACKAGES = [
  { credits: 50, price: 2.50 },
  { credits: 100, price: 5.00 },
  { credits: 500, price: 22.23, discount: '10%' },
  { credits: 1000, price: 37.52, discount: '20%' },
  { credits: 2000, price: 72.36, discount: '30%' },
  { credits: 5000, price: 160.79, discount: '40%' },
  { credits: 10000, price: 300.15, discount: '44%' },
]

function fmtR(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface PanelCheckoutModalProps {
  open: boolean
  onClose: () => void
  customPrice?: number
  customOriginalPrice?: number
}

export const PanelCheckoutModal = ({ open, onClose, customPrice, customOriginalPrice }: PanelCheckoutModalProps) => {
  const activePrice = customPrice ?? PANEL_PRICE
  const activeOriginalPrice = customOriginalPrice ?? ORIGINAL_PRICE
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showResaleValues, setShowResaleValues] = useState(false)
  // Step 3 form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cpf, setCpf] = useState('')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  // PIX state
  const [pixGenerated, setPixGenerated] = useState(false)
  const [pixPayload, setPixPayload] = useState('')
  const [pixQrUrl, setPixQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [pixTimer, setPixTimer] = useState(600)
  const [adminWhatsapp, setAdminWhatsapp] = useState('5548996029392')
  const [pixKey, setPixKey] = useState(DEFAULT_PIX_KEY)
  const [pixName, setPixName] = useState(DEFAULT_PIX_NAME)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'pix_key', 'pix_name'])
      if (data) {
        for (const item of data) {
          if (item.key === 'whatsapp_number' && item.value) setAdminWhatsapp(item.value)
          if (item.key === 'pix_key' && item.value) setPixKey(item.value)
          if (item.key === 'pix_name' && item.value) setPixName(item.value)
        }
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (pixGenerated) {
      setPixTimer(600)
      timerRef.current = setInterval(() => {
        setPixTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [pixGenerated])

  useEffect(() => {
    if (!open) return

    const originalBodyOverflow = document.body.style.overflow
    const originalBodyTouchAction = document.body.style.touchAction
    const originalBodyOverscroll = document.body.style.overscrollBehavior
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.touchAction = originalBodyTouchAction
      document.body.style.overscrollBehavior = originalBodyOverscroll
      document.documentElement.style.overflow = originalHtmlOverflow
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll
    }
  }, [open])

  if (!open) return null

  const finalPrice = couponApplied ? activePrice * 0.9 : activePrice

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'DESCONTO10') {
      setCouponApplied(true)
      toast.success('Cupom aplicado! 10% de desconto')
    } else {
      toast.error('Cupom inválido')
    }
  }

  const handleGeneratePix = () => {
    if (!firstName.trim() || !email.trim() || !whatsapp.trim() || !cpf.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const { payload, qrCodeUrl } = generatePixQRCode({
      pixKey: pixKey,
      merchantName: pixName,
      amount: finalPrice,
      txId: 'PAINEL',
      description: 'Painel Gerador',
    }, 250)
    setPixPayload(payload)
    setPixQrUrl(qrCodeUrl)
    setPixGenerated(true)
  }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload)
      setCopied(true)
      toast.success('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erro ao copiar')
    }
  }

  const handleConfirmPayment = () => {
    const message = `✅ *PAGAMENTO PAINEL GERADOR DE CRÉDITOS*

💰 *Valor:* R$ ${fmtR(finalPrice)}
📦 *Produto:* Painel Gerador de Créditos Lovable

👤 *Dados do comprador:*
• Nome: ${firstName.trim()} ${lastName.trim()}
• Email: ${email.trim()}
• WhatsApp: ${whatsapp.trim()}
• CPF: ${cpf.trim()}
${couponApplied ? `• Cupom: ${coupon.trim().toUpperCase()}` : ''}

📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

    const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Redirecionando para o WhatsApp...')
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setFirstName('')
    setLastName('')
    setEmail('')
    setWhatsapp('')
    setCpf('')
    setCoupon('')
    setCouponApplied(false)
    setPixGenerated(false)
    setPixPayload('')
    setPixQrUrl('')
    setCopied(false)
    setShowResaleValues(false)
    onClose()
  }

  const stepLabels = ['Pacote', 'Entrega', 'Dados']

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4" style={{ isolation: 'isolate' }}>
      <div className="absolute inset-0 bg-black" aria-hidden="true" />
      <div className="relative z-10 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md overflow-y-auto rounded-none sm:rounded-2xl border-0 sm:border border-border bg-card text-card-foreground shadow-2xl">
        {/* Header with tabs */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-muted-foreground">Entrar na conta</span>
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-0.5 rounded-full">Compra de Créditos</span>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0">
            {stepLabels.map((label, idx) => {
              const stepNum = idx + 1
              const isActive = step >= stepNum
              const isCurrentOrPast = step >= stepNum
              return (
                <div key={idx} className="flex items-center">
                  {idx > 0 && (
                    <div className={`w-12 h-0.5 ${isCurrentOrPast ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCurrentOrPast && step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {step === 1 && (
            <>
              {/* Package info */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Painel Gerador de Créditos</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Acesso completo ao gerador de créditos Lovable</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-4 space-y-3">
                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Resumo do Pedido</h3>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /> Painel Completo:</span>
                  <span className="font-bold">✓ Incluído</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Gerador Ilimitado:</span>
                  <span className="font-bold">✓ Incluído</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">🎁 Landing Page de Brinde:</span>
                  <span className="font-bold">✓ Incluído</span>
                </div>
                <p className="text-[10px] text-muted-foreground pl-6">
                  Página pronta para você revender seus créditos
                </p>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold text-sm">Valor a Pagar:</span>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm text-muted-foreground line-through mr-2">R$ {fmtR(activeOriginalPrice)}</span>
                    <span className="text-lg sm:text-xl font-black text-accent">R$ {fmtR(activePrice)}</span>
                  </div>
                </div>
              </div>

              {/* Resale values highlight */}
              <button
                onClick={() => setShowResaleValues(!showResaleValues)}
                className="w-full rounded-xl border-2 border-accent/50 bg-accent/5 p-3 text-center transition-all hover:bg-accent/10 hover:border-accent"
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4 text-accent" />
                  <span className="text-sm sm:text-base font-bold text-accent">
                    👀 Veja os valores de revenda aqui
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {showResaleValues ? 'Clique para fechar' : 'Clique para ver quanto você pode lucrar'}
                </p>
              </button>

              {showResaleValues && (
                <div className="rounded-xl border border-border bg-secondary/30 p-3 sm:p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-center text-muted-foreground">
                    Pacotes Populares — Valores Reais
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {RESALE_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.credits}
                        className="relative rounded-lg border border-border bg-card p-2 text-center hover:border-primary/50 transition-colors"
                      >
                        {pkg.discount && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {pkg.discount} off
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-bold mt-1">
                          🎫 {pkg.credits.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-accent font-bold">
                          R$ {fmtR(pkg.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full font-bold bg-primary hover:bg-primary/90 text-sm sm:text-base" size="lg" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Entrega Automática</h2>
                <p className="text-sm text-muted-foreground">Seu acesso será liberado assim que o pagamento for confirmado</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Acesso imediato ao Painel</p>
                    <p className="text-xs text-muted-foreground">Após confirmação do PIX</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Suporte via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Atendimento humanizado 24/7</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="lg" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1 font-bold bg-primary hover:bg-primary/90" size="lg" onClick={() => setStep(3)}>Continuar</Button>
              </div>
            </>
          )}

          {step === 3 && !pixGenerated && (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Dados para Pagamento</h2>
                <p className="text-sm text-muted-foreground">Preencha seus dados para gerar o PIX</p>
              </div>

              {/* Order summary compact */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Resumo do Pedido</h3>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-accent" /> Painel Completo:</span>
                  <span className="font-bold">✓ Incluído</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="font-bold">Valor a Pagar:</span>
                  <span className="text-lg font-black text-accent">R$ {fmtR(finalPrice)}</span>
                </div>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  📲 Após o pagamento, envie o <span className="font-bold text-foreground">comprovante para o suporte</span> via WhatsApp para que possamos criar o seu painel de revenda e sua conta.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Nome</Label>
                    <Input
                      placeholder="João"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-secondary/50 border-border h-10"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Sobrenome</Label>
                    <Input
                      placeholder="Silva"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-secondary/50 border-border h-10"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Email</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border h-10"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">WhatsApp</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      className="bg-secondary/50 border-border h-10"
                      maxLength={15}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      className="bg-secondary/50 border-border h-10"
                      maxLength={14}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="lg" onClick={() => setStep(2)}>Voltar</Button>
                <Button
                  className="flex-1 font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                  onClick={handleGeneratePix}
                >
                  Gerar PIX — R$ {fmtR(finalPrice)}
                </Button>
              </div>
            </>
          )}

          {step === 3 && pixGenerated && (
            <div className="space-y-4 text-center">
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 bg-secondary/50 rounded-lg py-2 px-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-bold">
                  {String(Math.floor(pixTimer / 60)).padStart(2, '0')}:{String(pixTimer % 60).padStart(2, '0')}
                </span>
                <span className="text-sm text-muted-foreground">para pagar</span>
              </div>

              <p className="text-2xl font-black text-accent">R$ {fmtR(finalPrice)}</p>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-4 inline-block mx-auto">
                <img src={pixQrUrl} alt="QR Code PIX" className="rounded-lg w-[200px] h-[200px]" />
              </div>

              {/* Copy */}
              <Button className="w-full font-bold" size="lg" onClick={handleCopyPix}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Código PIX'}
              </Button>

              <div className="bg-secondary/30 rounded-lg px-3 py-2 overflow-hidden">
                <p className="text-xs text-muted-foreground font-mono truncate">{pixPayload}</p>
              </div>

              {/* Confirm */}
              <Button
                variant="outline"
                className="w-full font-bold border-accent/50 text-accent hover:bg-accent/10"
                size="lg"
                onClick={handleConfirmPayment}
              >
                <Send className="w-4 h-4" />
                Já fiz o pagamento
              </Button>

              <p className="text-xs text-muted-foreground">
                Após confirmar, o acesso será liberado pelo administrador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
