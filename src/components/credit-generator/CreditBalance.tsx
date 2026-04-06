import { useState, useEffect } from 'react'
import { Wallet, RefreshCw } from 'lucide-react'
import { getBalance } from '@/lib/resellerApi'

export const CreditBalance = () => {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBalance = async () => {
    setLoading(true)
    try {
      const res = await getBalance()
      if (res.ok) setBalance(res.balance)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchBalance() }, [])

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2">
      <Wallet className="w-4 h-4 text-primary" />
      <span className="text-sm font-mono font-bold tabular-nums">
        {loading ? '...' : balance !== null ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Erro'}
      </span>
      <button onClick={fetchBalance} className="text-white/40 hover:text-white transition-colors ml-1">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
