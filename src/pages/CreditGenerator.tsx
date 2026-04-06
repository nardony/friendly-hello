import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Zap, Loader2, History, LogOut, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createOrder, calculateCreditPrice, getBalance } from '@/lib/resellerApi'
import { CreditBalance } from '@/components/credit-generator/CreditBalance'

function fmt(n: number) { return n.toLocaleString('pt-BR') }
function fmtR(n: number) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const CreditGenerator = () => {
  const [credits, setCredits] = useState(100)
  const [loading, setLoading] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, signOut } = useAuth()

  const price = useMemo(() => calculateCreditPrice(credits), [credits])
  const ratePer100 = useMemo(() => (price / credits) * 100, [price, credits])

  // Handle logout param
  useEffect(() => {
    if (searchParams.get('logout') === '1') {
      signOut()
    }
  }, [searchParams, signOut])

  const handleGenerate = async () => {
    if (!user) {
      toast.error('Faça login primeiro')
      navigate('/authrevenda')
      return
    }
    setLoading(true)
    try {
      // Check balance first
      const balRes = await getBalance()
      if (balRes.ok && balRes.balance < price) {
        toast.error(`Saldo insuficiente. Tem R$ ${fmtR(balRes.balance)}, precisa de R$ ${fmtR(price)}`)
        setLoading(false)
        return
      }

      const res = await createOrder(credits)
      if (res.ok) {
        toast.success('Pedido criado!')
        navigate(`/gerador/acompanhar/${res.order_id}?credits=${credits}`)
      } else {
        const msg = res.error || res.message || ''
        if (msg.toLowerCase().includes('saldo') || msg.toLowerCase().includes('balance') || msg.toLowerCase().includes('insufficient')) {
          toast.error(`Saldo insuficiente. ${msg}`)
        } else {
          toast.error(msg || 'Erro ao criar pedido')
        }
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-8">
        {/* Top bar */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-8">
          <CreditBalance />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/gerador/historico')} className="text-white/70 hover:text-white">
              <History className="w-4 h-4 mr-1" /> Histórico
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate('/authrevenda?logout=1'); }} className="text-white/70 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Gerador de Créditos <span className="text-primary">Lovable</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base">
            Selecione a quantidade e gere seus créditos instantaneamente.
          </p>
        </div>

        {/* Main card */}
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10 space-y-8">
          {/* Credits display */}
          <div className="space-y-5">
            <p className="text-xs font-bold tracking-widest text-center text-white/40 uppercase">
              Quantidade de Créditos
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 min-w-[180px] text-center">
                <span className="text-4xl font-black tabular-nums font-mono">{fmt(credits)}</span>
              </div>
            </div>

            <Slider
              value={[credits]}
              onValueChange={(v) => setCredits(Math.round(v[0] / 10) * 10)}
              min={10}
              max={10000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>10</span>
              <span>10.000</span>
            </div>

            {/* Direct input */}
            <div className="flex items-center justify-center gap-2">
              <Input
                type="number"
                min={10}
                max={10000}
                step={10}
                value={credits}
                onChange={(e) => {
                  let v = Math.round(Number(e.target.value) / 10) * 10
                  v = Math.max(10, Math.min(10000, v))
                  setCredits(v)
                }}
                className="w-32 text-center bg-white/5 border-white/10 text-white font-mono"
              />
            </div>
          </div>

          {/* Price */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center space-y-1">
            <p className="text-4xl md:text-5xl font-black tabular-nums font-mono">
              R$ {fmtR(price)}
            </p>
            <p className="text-sm text-white/40">
              R$ {fmtR(ratePer100)} por 100 créditos
            </p>
          </div>

          {/* Quick packages */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map(v => (
              <button
                key={v}
                onClick={() => setCredits(v)}
                className={`rounded-xl border p-3 text-center transition-all hover:scale-105 ${
                  credits === v
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="font-bold text-sm">{fmt(v)}</p>
                <p className="text-[10px] text-white/40">R$ {fmtR(calculateCreditPrice(v))}</p>
              </button>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="xl"
            className="w-full text-lg font-bold py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(270_100%_65%_/_0.4)] hover:shadow-[0_0_50px_hsl(270_100%_65%_/_0.6)] transition-all"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? 'Criando pedido...' : `Gerar ${fmt(credits)} Créditos`}
          </Button>

          {/* Adicionar Saldo */}
          <Button
            size="xl"
            variant="outline"
            className="w-full text-lg font-bold py-6 border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all"
            onClick={() => setShowBalanceModal(true)}
          >
            <Wallet className="w-5 h-5" />
            Adicionar Saldo
          </Button>
        </div>

        <div className="pb-8" />
      </div>

      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-[95vw] md:max-w-[900px] h-[92vh] mt-[4vh] rounded-xl overflow-hidden border border-white/10 bg-[#0a0a1a] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <h3 className="text-white font-bold text-sm">Adicionar Saldo</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src="https://www.painelcreditoslovable.com/"
              className="w-full flex-1 border-0 bg-[#0a0f1a]"
              title="Adicionar Saldo"
              allow="clipboard-read; clipboard-write; payment"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CreditGenerator
