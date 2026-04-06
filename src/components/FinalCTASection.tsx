import { Button } from '@/components/ui/button';
import { Zap, Play } from 'lucide-react';

export const FinalCTASection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <span className="inline-block text-2xl sm:text-3xl font-black tracking-widest uppercase text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
          🎁 BÔNUS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          Organize seus clientes, feche mais projetos e controle seu dinheiro{' '}
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-none">
            em um único lugar
          </span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          O CRM completo para profissionais de serviços que querem organizar clientes, projetos e finanças sem depender de planilhas ou múltiplas ferramentas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="https://central-opus-flow.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl gap-2"
            >
              <Zap className="w-4 h-4" />
              Começar Grátis
              <span className="ml-1">→</span>
            </Button>
          </a>
          <a
            href="https://central-opus-flow.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base font-semibold rounded-xl gap-2 border-2"
            >
              <Play className="w-4 h-4" />
              Ver Demonstração
            </Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          🎁 <strong className="text-primary">Bônus Central Opus Flow</strong> — Acesso exclusivo para clientes
        </p>
      </div>
    </section>
  );
};
