import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { calculateCreditPrice } from '@/lib/resellerApi';
import { CreditCard } from 'lucide-react';

const POPULAR_PACKAGES = [50, 100, 500, 1000, 2000, 5000, 10000];

interface ResellerValuesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResellerValuesModal = ({ open, onOpenChange }: ResellerValuesModalProps) => {
  const getDiscount = (credits: number) => {
    const baseRate = 0.05;
    const price = calculateCreditPrice(credits);
    const fullPrice = credits * baseRate;
    if (price >= fullPrice) return 0;
    return Math.round(((fullPrice - price) / fullPrice) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold tracking-wider text-muted-foreground uppercase">
            Pacotes Populares — Valores Reais
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {POPULAR_PACKAGES.map((credits) => {
            const price = calculateCreditPrice(credits);
            const discount = getDiscount(credits);
            return (
              <div
                key={credits}
                className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-accent/20 bg-background/50 p-3 text-center"
              >
                {discount > 0 && (
                  <span className="absolute -top-2 -right-1 text-[10px] font-bold bg-accent text-accent-foreground rounded-full px-1.5 py-0.5">
                    {discount}% off
                  </span>
                )}
                <div className="flex items-center gap-1 text-accent">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="font-bold text-lg">{credits.toLocaleString('pt-BR')}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
