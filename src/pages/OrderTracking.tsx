import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Clock, Loader2, CheckCircle, AlertTriangle, XCircle, Copy, Check,
  Mail, Info, Zap, CreditCard, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { checkStatus, getEvents } from '@/lib/resellerApi'
import { CreditBalance } from '@/components/credit-generator/CreditBalance'

interface OrderStatus {
  ok: boolean
  order_id: number
  status: string
  credits_requested: number
  credits_delivered: number
  master_email: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

interface OrderEvent {
  id: number
  event: string
  message: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; border: string; bg: string; animate?: string }> = {
  pending: { icon: Clock, label: 'Na fila — aguardando processamento', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10', animate: 'animate-pulse' },
  processing: { icon: Loader2, label: 'Processando — depositando créditos', color: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/10', animate: 'animate-spin' },
  completed: { icon: CheckCircle, label: 'Concluído — créditos depositados!', color: 'text-green-400', border: 'border-green-400/30', bg: 'bg-green-400/10' },
  partial: { icon: AlertTriangle, label: 'Parcial — reembolso creditado', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  error: { icon: XCircle, label: 'Erro — saldo reembolsado', color: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/10' },
  refunded: { icon: CheckCircle, label: 'Reembolsado — saldo devolvido', color: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10' },
}

const EVENT_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string; border?: string; bold?: boolean; animate?: string }> = {
  info: { icon: Info, color: 'text-blue-300', bg: 'bg-transparent' },
  action: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', bold: true },
  credit: { icon: CreditCard, color: 'text-green-400', bg: 'bg-green-400/10' },
  progress: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', animate: 'animate-spin' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', bold: true },
  partial: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

function relativeTime(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 10) return 'agora'
  if (diff < 60) return `há ${Math.floor(diff)}s`
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  return `há ${Math.floor(diff / 3600)}h`
}

const TERMINAL = ['completed', 'partial', 'error', 'refunded']

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const creditsRequested = Number(searchParams.get('credits') || 0)

  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [copied, setCopied] = useState(false)
  const [prevDelivered, setPrevDelivered] = useState(0)
  const [popAnim, setPopAnim] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [inviteTimer, setInviteTimer] = useState(3600) // 1 hour
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isTerminal = status ? TERMINAL.includes(status.status) : false
  const creditEvents = events.filter(e => e.event === 'credit')
  const liveCredits = isTerminal ? (status?.credits_delivered ?? 0) : creditEvents.length * 10
  const totalCredits = status?.credits_requested || creditsRequested
  const progress = totalCredits > 0 ? Math.min(100, (liveCredits / totalCredits) * 100) : 0
  const showInviteCard = status?.status === 'processing' && status.master_email && creditEvents.length === 0

  // Pop animation on credit change
  useEffect(() => {
    if (liveCredits > prevDelivered && prevDelivered > 0) {
      setPopAnim(true)
      setTimeout(() => setPopAnim(false), 400)
    }
    setPrevDelivered(liveCredits)
  }, [liveCredits])

  // Invite timer countdown
  useEffect(() => {
    if (showInviteCard) {
      timerRef.current = setInterval(() => {
        setInviteTimer(p => Math.max(0, p - 1))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [showInviteCard])

  const poll = useCallback(async () => {
    if (!orderId) return
    const id = Number(orderId)
    if (isNaN(id) || id <= 0) return
    const [statusRes, eventsRes] = await Promise.all([
      checkStatus(id),
      getEvents(id),
    ])
    if (statusRes.ok) setStatus(statusRes as OrderStatus)
    if (eventsRes.ok) setEvents(eventsRes.events || [])

    if (statusRes.ok && TERMINAL.includes(statusRes.status)) {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [orderId])

  useEffect(() => {
    poll()
    pollRef.current = setInterval(poll, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [poll])

  const handleCopyEmail = async () => {
    if (!status?.master_email) return
    await navigator.clipboard.writeText(status.master_email)
    setCopied(true)
    toast.success('Email copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  const cfg = STATUS_CONFIG[status?.status || 'pending'] || STATUS_CONFIG.pending
  const StatusIcon = cfg.icon

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gerador')} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <CreditBalance />
        </div>

        {/* Status card */}
        <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-xl p-5 flex items-center gap-4`}>
          <StatusIcon className={`w-8 h-8 ${cfg.color} ${cfg.animate || ''} shrink-0`} />
          <div>
            <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
            <p className="text-xs text-white/40">Pedido #{orderId}</p>
          </div>
        </div>

        {/* Credit counter */}
        <div className="text-center space-y-2">
          <p className={`text-6xl md:text-7xl font-black tabular-nums font-mono transition-all duration-300 ${
            popAnim ? 'scale-125 text-green-400' : 'scale-100 text-white'
          }`}>
            {liveCredits.toLocaleString('pt-BR')}
          </p>
          <p className="text-white/40 text-sm">de {totalCredits.toLocaleString('pt-BR')} créditos</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {!isTerminal && (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-sm text-white/40">{Math.round(progress)}% concluído</p>
        </div>

        {/* Invite card */}
        {showInviteCard && status?.master_email && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 backdrop-blur-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <p className="font-bold text-amber-400 text-lg">AÇÃO NECESSÁRIA</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-black/40 px-3 py-2 font-mono text-sm text-white truncate">
                {status.master_email}
              </div>
              <Button size="sm" variant="outline" className="border-amber-400/30 text-amber-400 hover:bg-amber-400/20" onClick={handleCopyEmail}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
              <li>Vá na sua workspace no Lovable</li>
              <li>Acesse <span className="text-white font-semibold">Settings → People</span></li>
              <li>Convide o email acima como <span className="text-white font-semibold">EDITOR</span></li>
              <li>Promova o bot para <span className="text-green-400 font-black uppercase animate-pulse">OWNER</span></li>
            </ol>

            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-400/80">
                Tempo restante: <span className="font-mono font-bold">
                  {String(Math.floor(inviteTimer / 60)).padStart(2, '0')}:{String(inviteTimer % 60).padStart(2, '0')}
                </span>
              </span>
              <span className="flex items-center gap-1 text-white/40">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Aguardando permissão...
              </span>
            </div>
          </div>
        )}

        {/* Terminal messages */}
        {isTerminal && (
          <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} backdrop-blur-xl p-6 text-center space-y-4`}>
            {status?.status === 'completed' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <p className="text-lg font-bold text-green-400">Todos os créditos foram entregues com sucesso!</p>
              </>
            )}
            {status?.status === 'partial' && (
              <p className="text-amber-400">
                Entrega parcial. {status.credits_delivered} créditos de {status.credits_requested} entregues. O saldo do restante será reembolsado automaticamente.
              </p>
            )}
            {status?.status === 'error' && (
              <>
                <p className="text-red-400">Ocorreu um erro. Seu saldo será reembolsado automaticamente.</p>
                {status.error_message && <p className="text-xs text-red-300/60">{status.error_message}</p>}
              </>
            )}
            {status?.status === 'refunded' && (
              <p className="text-purple-400">Pedido reembolsado. Saldo devolvido para sua conta.</p>
            )}
            <Button onClick={() => navigate('/gerador')} className="mt-2">
              <Zap className="w-4 h-4 mr-1" /> Nova Geração
            </Button>
          </div>
        )}

        {/* Event timeline */}
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-widest text-white/30 uppercase">Log em tempo real</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl max-h-[300px] overflow-y-auto p-4">
            {events.length === 0 ? (
              <p className="text-center text-white/20 text-sm py-4">Aguardando eventos...</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
                <div className="space-y-3">
                  {[...events].reverse().map((ev, i) => {
                    const style = EVENT_STYLES[ev.event] || EVENT_STYLES.info
                    const EvIcon = style.icon
                    const hasOwnerHighlight = ev.message.includes('Promova') || ev.message.includes('OWNER')
                    return (
                      <div
                        key={ev.id}
                        className={`flex items-start gap-3 pl-0 rounded-xl p-2 transition-all animate-fade-in ${
                          style.border ? `border ${style.border}` : ''
                        } ${style.bg}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.border ? `border ${style.border}` : ''}`}>
                          <EvIcon className={`w-3.5 h-3.5 ${style.color} ${style.animate || ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${style.bold ? 'font-bold' : ''} ${
                            hasOwnerHighlight ? 'text-green-400 animate-pulse' : 'text-white/80'
                          }`}>
                            {ev.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-white/30 shrink-0 tabular-nums font-mono">
                          {relativeTime(ev.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
