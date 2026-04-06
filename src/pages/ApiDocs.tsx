import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Check, ChevronDown, ChevronRight, Key, BookOpen, Send, Search, ListOrdered, Wallet, Clock, Code, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'

const API_KEY = 'sk_reseller_e7d0cc61306a8b170a78525c07de01bf'
const API_URL = 'https://aewesxrdohkoskuycfww.supabase.co/functions/v1/reseller-api'

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(label || 'Copiado!')
        setTimeout(() => setCopied(false), 3000)
      }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function CodeBlock({ children, copyable }: { children: string; copyable?: boolean }) {
  return (
    <div className="relative group">
      <pre className="bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm font-mono text-green-300 leading-relaxed">
        <code>{children}</code>
      </pre>
      {copyable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={children} label="Código copiado!" />
        </div>
      )}
    </div>
  )
}

function Section({ icon: Icon, title, children, defaultOpen = false }: { icon: any; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left">
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <span className="font-bold text-base flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">{children}</div>}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h, i) => <th key={i} className="text-left py-2 px-3 font-bold text-white/70 text-xs uppercase tracking-wider">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              {row.map((cell, j) => <td key={j} className="py-2 px-3 font-mono text-white/80">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ApiDocs = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gerador')} className="text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>

        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-black">
            API de Créditos <span className="text-primary">Lovable</span>
          </h1>
          <p className="text-white/50">Documentação completa para integração</p>
        </div>

        {/* API Key Card */}
        <div className="rounded-xl border-2 border-primary/50 bg-primary/10 backdrop-blur-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Key className="w-5 h-5" />
            Sua API Key
          </div>
          <div className="flex items-center gap-3 bg-black/40 rounded-lg px-4 py-3 border border-white/10">
            <code className="flex-1 font-mono text-sm md:text-base text-amber-300 break-all select-all">{API_KEY}</code>
            <CopyButton text={API_KEY} label="API Key copiada!" />
          </div>
          <div className="flex items-center gap-2 text-xs text-red-400">
            <Shield className="w-3 h-3" />
            NUNCA exponha no frontend. Use apenas no backend/servidor.
          </div>
        </div>

        {/* Auth */}
        <Section icon={BookOpen} title="Autenticação" defaultOpen>
          <p className="text-white/70 text-sm">Todas as chamadas são feitas via <strong>POST</strong> para uma única URL:</p>
          <div className="flex items-center gap-2 bg-black/40 rounded-lg px-4 py-2 border border-white/10">
            <code className="flex-1 font-mono text-xs md:text-sm text-blue-300 break-all">{API_URL}</code>
            <CopyButton text={API_URL} />
          </div>
          <div className="text-sm text-white/60 space-y-1">
            <p><strong>Headers obrigatórios:</strong></p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><code className="text-amber-300">x-api-key</code>: SUA_API_KEY</li>
              <li><code className="text-amber-300">Content-Type</code>: application/json</li>
            </ul>
            <p className="mt-2"><strong>Rate limit:</strong> 30 requisições por minuto.</p>
          </div>
        </Section>

        {/* Create Order */}
        <Section icon={Send} title="Criar Pedido (create_order)">
          <p className="text-white/70 text-sm">Cria um pedido de créditos. O valor é calculado automaticamente e descontado do seu saldo.</p>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-2">Requisição</p>
          <CodeBlock copyable>{`{
  "action": "create_order",
  "credits": 1000
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Resposta de sucesso</p>
          <CodeBlock>{`{
  "ok": true,
  "order_id": 123,
  "price": 37.52,
  "credits": 1000
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Erro (saldo insuficiente)</p>
          <CodeBlock>{`{
  "ok": false,
  "error": "Saldo insuficiente",
  "needed": 37.52,
  "balance": 10.00
}`}</CodeBlock>
          <div className="text-sm text-white/60 space-y-1">
            <p><strong>Regras:</strong> Mínimo 10, máximo 10.000, múltiplo de 10.</p>
          </div>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Tabela de preços</p>
          <Table
            headers={['Créditos', 'Preço', 'Por crédito']}
            rows={[
              ['10', 'R$ 0,50', 'R$ 0,0500'],
              ['100', 'R$ 5,00', 'R$ 0,0500'],
              ['500', 'R$ 19,22', 'R$ 0,0384'],
              ['1.000', 'R$ 37,52', 'R$ 0,0375'],
              ['2.000', 'R$ 68,97', 'R$ 0,0345'],
              ['5.000', 'R$ 160,79', 'R$ 0,0322'],
              ['10.000', 'R$ 300,15', 'R$ 0,0300'],
            ]}
          />
        </Section>

        {/* Check Status */}
        <Section icon={Search} title="Verificar Status (check_status)">
          <p className="text-white/70 text-sm">Consulta o status atual de um pedido e quantos créditos já foram entregues.</p>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-2">Requisição</p>
          <CodeBlock copyable>{`{
  "action": "check_status",
  "order_id": 123
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Resposta</p>
          <CodeBlock>{`{
  "ok": true,
  "order_id": 123,
  "status": "processing",
  "credits_requested": 1000,
  "credits_delivered": 450,
  "master_email": "bot12345@domain.com",
  "error_message": null,
  "created_at": "2026-04-04T12:00:00Z",
  "completed_at": null
}`}</CodeBlock>
          <p className="text-sm text-white/60">O campo <code className="text-amber-300">master_email</code> aparece quando o status é "processing". Esse é o email que o cliente precisa convidar na workspace Lovable e promover para OWNER.</p>
        </Section>

        {/* Get Events */}
        <Section icon={ListOrdered} title="Buscar Eventos (get_events)">
          <p className="text-white/70 text-sm">Retorna a timeline completa de tudo que aconteceu no pedido, em tempo real.</p>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider mt-2">Requisição</p>
          <CodeBlock copyable>{`{
  "action": "get_events",
  "order_id": 123
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Resposta</p>
          <CodeBlock>{`{
  "ok": true,
  "order_id": 123,
  "events": [
    { "id": 1, "event": "info", "message": "Pedido recebido", "created_at": "..." },
    { "id": 2, "event": "action", "message": "Bot acessando workspace", "created_at": "..." },
    { "id": 3, "event": "credit", "message": "+10 créditos depositados", "created_at": "..." },
    { "id": 4, "event": "progress", "message": "450/1000 créditos", "created_at": "..." },
    { "id": 5, "event": "completed", "message": "Pedido concluído", "created_at": "..." }
  ]
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Tipos de evento</p>
          <Table
            headers={['Tipo', 'Significado']}
            rows={[
              ['info', 'Informação geral'],
              ['action', 'Ação do sistema (bot entrando na workspace, etc)'],
              ['credit', '+10 créditos depositados'],
              ['progress', 'Progresso atual (ex: "450/1000 créditos")'],
              ['completed', 'Pedido concluído com sucesso'],
              ['partial', 'Entrega parcial'],
              ['error', 'Erro no processamento'],
            ]}
          />
        </Section>

        {/* List Orders */}
        <Section icon={ListOrdered} title="Listar Pedidos (list_orders)">
          <p className="text-white/70 text-sm">Lista todos os seus pedidos, do mais recente ao mais antigo. Máximo 100 por chamada.</p>
          <CodeBlock copyable>{`{
  "action": "list_orders",
  "limit": 20
}`}</CodeBlock>
        </Section>

        {/* Get Balance */}
        <Section icon={Wallet} title="Ver Saldo (get_balance)">
          <p className="text-white/70 text-sm">Consulta seu saldo atual disponível.</p>
          <CodeBlock copyable>{`{
  "action": "get_balance"
}`}</CodeBlock>
          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Resposta</p>
          <CodeBlock>{`{
  "ok": true,
  "balance": 245.50,
  "email": "seu@email.com"
}`}</CodeBlock>
        </Section>

        {/* Status Reference */}
        <Section icon={Clock} title="Status dos Pedidos">
          <Table
            headers={['Status', 'Significado']}
            rows={[
              ['pending', 'Na fila, aguardando processamento'],
              ['processing', 'Gerando créditos (master_email disponível)'],
              ['completed', 'Todos os créditos entregues com sucesso'],
              ['partial', 'Entrega parcial — saldo reembolsado'],
              ['error', 'Erro — saldo reembolsado automaticamente'],
              ['refunded', 'Reembolsado — saldo devolvido'],
            ]}
          />
        </Section>

        {/* Integration Guide */}
        <Section icon={Zap} title="Como Integrar no Seu Site">
          <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
            <li>Seu cliente escolhe a quantidade de créditos no seu site</li>
            <li>Seu <strong>BACKEND</strong> chama <code className="text-amber-300">create_order</code> (nunca o frontend)</li>
            <li>Faça polling com <code className="text-amber-300">check_status</code> e <code className="text-amber-300">get_events</code> a cada 3-5 segundos</li>
            <li>Quando <code className="text-amber-300">master_email</code> aparecer, mostre ao cliente: "Convide [email] na workspace e promova para OWNER"</li>
            <li className="text-amber-400">⚠ O cliente tem até <strong>1 hora</strong> para convidar o bot. Após isso, o pedido expira.</li>
            <li>Mostre a timeline de eventos em tempo real</li>
            <li>Quando <code className="text-green-400">completed</code> → créditos entregues!</li>
            <li>Se <code className="text-amber-400">partial</code> ou <code className="text-red-400">error</code> → saldo reembolsado automaticamente</li>
          </ol>
        </Section>

        {/* Code Example */}
        <Section icon={Code} title="Exemplo Completo (JavaScript Backend)">
          <CodeBlock copyable>{`const API_URL = "${API_URL}";
const API_KEY = "SUA_API_KEY_AQUI"; // NUNCA no frontend!

async function criarPedido(credits) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create_order", credits })
  });
  return res.json();
}

async function verificarStatus(orderId) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "check_status", order_id: orderId })
  });
  return res.json();
}

async function buscarEventos(orderId) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_events", order_id: orderId })
  });
  return res.json();
}

async function verSaldo() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_balance" })
  });
  return res.json();
}

// Polling a cada 3 segundos
const ORDER_ID = 123;
const polling = setInterval(async () => {
  const [status, events] = await Promise.all([
    verificarStatus(ORDER_ID),
    buscarEventos(ORDER_ID)
  ]);

  const creditEvents = (events.events || []).filter(e => e.event === "credit");
  console.log(\`Créditos: \${creditEvents.length * 10}/\${status.credits_requested}\`);

  if (["completed","partial","error","refunded"].includes(status.status)) {
    clearInterval(polling);
    console.log("Pedido finalizado:", status.status);
  }
}, 3000);`}</CodeBlock>
        </Section>

        {/* Polling Guide */}
        <Section icon={Zap} title="Logs e Progresso em Tempo Real">
          <div className="text-sm text-white/70 space-y-3">
            <p>Para mostrar progresso em tempo real, use polling simultâneo com <code className="text-amber-300">check_status</code> e <code className="text-amber-300">get_events</code> a cada 3 segundos.</p>
            <p><strong>Contagem em tempo real:</strong> Cada evento <code className="text-green-400">"credit"</code> = +10 créditos. Conte os eventos para atualizar a barra de progresso instantaneamente.</p>
            <p><strong>Pare o polling</strong> quando status for: <code className="text-white/80">completed</code>, <code className="text-white/80">partial</code>, <code className="text-white/80">error</code> ou <code className="text-white/80">refunded</code>.</p>
          </div>

          <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Sequência típica (pedido de 100 créditos)</p>
          <CodeBlock>{`[info]      Pedido recebido                         — 00:00
[info]      Bot selecionado, preparando acesso      — 00:02
[action]    Convide bot12345@domain.com              — 00:05
[action]    Promova o novo membro para OWNER         — 00:05
[info]      Permissão detectada! Iniciando depósito  — 02:30
[credit]    +10 créditos depositados (10/100)        — 02:35
[credit]    +10 créditos depositados (20/100)        — 02:38
...
[credit]    +10 créditos depositados (100/100)       — 03:02
[completed] Concluído! 100 créditos entregues        — 03:05`}</CodeBlock>
        </Section>

        {/* Security Warning */}
        <Section icon={Shield} title="Aviso de Segurança">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 space-y-2">
            <p className="font-bold text-red-400">⚠ NUNCA exponha sua API key no frontend!</p>
            <ul className="list-disc list-inside space-y-1 text-red-300/80">
              <li>Use sempre no backend (Edge Function, API route, servidor Node.js, etc)</li>
              <li>Nunca coloque no JavaScript público do seu site</li>
              <li>Se a key for comprometida, revogue imediatamente e gere uma nova</li>
            </ul>
          </div>
        </Section>

        {/* Prompt Section */}
        <Section icon={Code} title="Prompt para Criar Painel no Lovable">
          <p className="text-white/70 text-sm mb-3">Cole este prompt no Lovable para criar seu próprio site de venda de créditos automaticamente:</p>
          <div className="relative group">
            <pre className="bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs font-mono text-white/70 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
{`Crie um painel completo de venda e geração de créditos Lovable para meu site. O sistema usa uma API externa que eu já tenho.

ANTES DE IMPLEMENTAR: me peça a API key. Não invente valores. Eu vou fornecer. A URL da API já está neste prompt.

== API ==

A API key DEVE ficar no backend. Crie uma Edge Function do Supabase ou API route que recebe a chamada do frontend e faz o proxy para a API real com a key. O frontend NUNCA deve ter acesso à API key.

Todos os endpoints são POST para esta URL:
${API_URL}

Header: x-api-key (valor que eu vou fornecer)
Content-Type: application/json

Endpoints:
- create_order: { action: "create_order", credits: NUMERO }
- check_status: { action: "check_status", order_id: NUMERO }
- get_events: { action: "get_events", order_id: NUMERO }
- list_orders: { action: "list_orders", limit: NUMERO }
- get_balance: { action: "get_balance" }`}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton
                text={`Crie um painel completo de venda e geração de créditos Lovable para meu site. O sistema usa uma API externa que eu já tenho.\n\nANTES DE IMPLEMENTAR: me peça a API key. Não invente valores. Eu vou fornecer. A URL da API já está neste prompt.\n\n== API ==\n\nA API key DEVE ficar no backend. Crie uma Edge Function do Supabase ou API route que recebe a chamada do frontend e faz o proxy para a API real com a key. O frontend NUNCA deve ter acesso à API key.\n\nTodos os endpoints são POST para esta URL:\n${API_URL}\n\nHeader: x-api-key (valor que eu vou fornecer)\nContent-Type: application/json\n\nEndpoints:\n- create_order: { action: "create_order", credits: NUMERO }\n- check_status: { action: "check_status", order_id: NUMERO }\n- get_events: { action: "get_events", order_id: NUMERO }\n- list_orders: { action: "list_orders", limit: NUMERO }\n- get_balance: { action: "get_balance" }`}
                label="Prompt copiado!"
              />
            </div>
          </div>
        </Section>

        <div className="pb-12" />
      </div>
    </div>
  )
}

export default ApiDocs
