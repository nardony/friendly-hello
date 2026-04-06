import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Package, Zap } from 'lucide-react'
import { listOrders } from '@/lib/resellerApi'
import { CreditBalance } from '@/components/credit-generator/CreditBalance'

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-400/20 text-amber-400 border-amber-400/30' },
  processing: { label: 'Processando', className: 'bg-blue-400/20 text-blue-400 border-blue-400/30' },
  completed: { label: 'Concluído', className: 'bg-green-400/20 text-green-400 border-green-400/30' },
  partial: { label: 'Parcial', className: 'bg-amber-400/20 text-amber-400 border-amber-400/30' },
  error: { label: 'Erro', className: 'bg-red-400/20 text-red-400 border-red-400/30' },
  refunded: { label: 'Reembolsado', className: 'bg-purple-400/20 text-purple-400 border-purple-400/30' },
}

function relativeDate(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return `há ${Math.floor(diff / 86400)}d`
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const res = await listOrders(50)
        if (res.ok) setOrders(res.orders || [])
      } catch {}
      setLoading(false)
    })()
  }, [])

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

        <h1 className="text-2xl font-black">Histórico de Pedidos</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package className="w-12 h-12 text-white/20 mx-auto" />
            <p className="text-white/40">Nenhum pedido encontrado</p>
            <Button onClick={() => navigate('/gerador')}>
              <Zap className="w-4 h-4 mr-1" /> Novo Pedido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending
              return (
                <button
                  key={order.order_id}
                  onClick={() => navigate(`/gerador/acompanhar/${order.order_id}?credits=${order.credits_requested || order.credits}`)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">#{order.order_id}</span>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/50">
                      {order.credits_delivered ?? 0}/{order.credits_requested ?? order.credits} créditos
                    </p>
                  </div>
                  <span className="text-xs text-white/30 shrink-0">
                    {relativeDate(order.created_at)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
