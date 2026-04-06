import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type SectionId = 'hero' | 'video' | 'features' | 'about' | 'how-it-works' | 'secure-purchase' | 'testimonials' | 'faq' | 'cta' | 'donation' | 'pacotes' | 'recharge-info' | 'why-choose' | 'checkout';

interface SectionOrderManagerProps {
  sectionOrder: SectionId[];
  onOrderChange: (newOrder: SectionId[]) => void;
  disabledSections?: SectionId[];
  onToggleSection?: (sectionId: SectionId, enabled: boolean) => void;
}

const sectionLabels: Record<SectionId, string> = {
  'hero': '🏠 Hero (Topo)',
  'video': '🎬 Vídeo',
  'pacotes': '💰 Pacotes de Créditos',
  'recharge-info': '⚡ Recarga Rápida',
  'features': '✨ Funcionalidades',
  'why-choose': '✅ Por que Escolher',
  'about': '📝 Sobre',
  'how-it-works': '🔧 Como Funciona',
  'secure-purchase': '🛡️ Compra Segura',
  'testimonials': '💬 Depoimentos',
  'faq': '❓ Perguntas Frequentes',
  'cta': '🎯 CTA Final',
  'donation': '💚 Doação',
  'checkout': '🛒 Checkout',
};

export const defaultSectionOrder: SectionId[] = [
  'hero',
  'video',
  'pacotes',
  'recharge-info',
  'features',
  'why-choose',
  'about',
  'how-it-works',
  'secure-purchase',
  'testimonials',
  'faq',
  'cta',
  'donation',
];

const hiddenFromManager: SectionId[] = ['checkout', 'donation'];

export const SectionOrderManager = forwardRef<HTMLDivElement, SectionOrderManagerProps>(
  ({ sectionOrder, onOrderChange, disabledSections = [], onToggleSection }, ref) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);

    const visibleSections = sectionOrder.filter(id => !hiddenFromManager.includes(id));
    
    // All sections that can be shown (active + disabled, minus hidden)
    const allManagerSections = [
      ...visibleSections,
      ...disabledSections.filter(id => !hiddenFromManager.includes(id) && !visibleSections.includes(id)),
    ];

    const moveSection = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...sectionOrder];
      const visibleId = visibleSections[index];
      const realIndex = newOrder.indexOf(visibleId);
      
      // Find the next/prev visible item's real index
      const targetVisibleIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetVisibleIndex < 0 || targetVisibleIndex >= visibleSections.length) return;
      
      const targetId = visibleSections[targetVisibleIndex];
      const targetRealIndex = newOrder.indexOf(targetId);
      
      [newOrder[realIndex], newOrder[targetRealIndex]] = [newOrder[targetRealIndex], newOrder[realIndex]];
      onOrderChange(newOrder);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDragIndex(index);
      dragNode.current = e.currentTarget;
      e.dataTransfer.effectAllowed = 'move';
      // Make drag image semi-transparent
      setTimeout(() => {
        if (dragNode.current) {
          dragNode.current.style.opacity = '0.4';
        }
      }, 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragIndex === null || dragIndex === index) return;
      setOverIndex(index);
    };

    const handleDragEnd = () => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '1';
      }
      
      if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
        const newVisible = [...visibleSections];
        const [moved] = newVisible.splice(dragIndex, 1);
        newVisible.splice(overIndex, 0, moved);
        
        // Rebuild full order: hidden items stay in place, visible items get new order
        const hiddenItems = sectionOrder.filter(id => hiddenFromManager.includes(id));
        onOrderChange([...newVisible, ...hiddenItems]);
      }
      
      setDragIndex(null);
      setOverIndex(null);
      dragNode.current = null;
    };

    const handleDragLeave = () => {
      setOverIndex(null);
    };

    // Touch drag support
    const touchStartY = useRef<number>(0);
    const touchDragIndex = useRef<number | null>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const overIndexRef = useRef<number | null>(null);

    const handleTouchStart = (index: number, e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchDragIndex.current = index;
      setDragIndex(index);
    };

    const handleTouchMoveCallback = useCallback((e: TouchEvent) => {
      if (touchDragIndex.current === null) return;
      e.preventDefault();
      const touchY = e.touches[0].clientY;

      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (touchY >= rect.top && touchY <= rect.bottom) {
          if (i !== touchDragIndex.current) {
            overIndexRef.current = i;
            setOverIndex(i);
          }
          break;
        }
      }
    }, []);

    const handleTouchEnd = () => {
      const currentOver = overIndexRef.current;
      if (touchDragIndex.current !== null && currentOver !== null && touchDragIndex.current !== currentOver) {
        const newVisible = [...visibleSections];
        const [moved] = newVisible.splice(touchDragIndex.current, 1);
        newVisible.splice(currentOver, 0, moved);
        
        const hiddenItems = sectionOrder.filter(id => hiddenFromManager.includes(id));
        onOrderChange([...newVisible, ...hiddenItems]);
      }
      
      setDragIndex(null);
      setOverIndex(null);
      overIndexRef.current = null;
      touchDragIndex.current = null;
    };

    // Attach non-passive touchmove to container
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      container.addEventListener('touchmove', handleTouchMoveCallback, { passive: false });
      return () => {
        container.removeEventListener('touchmove', handleTouchMoveCallback);
      };
    }, [handleTouchMoveCallback]);

    return (
      <Card ref={ref} className="bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Ordem das Seções</CardTitle>
          <CardDescription>Arraste ou use as setas para reorganizar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2" ref={containerRef}>
          {allManagerSections.map((sectionId, index) => {
            const isEnabled = visibleSections.includes(sectionId);
            const visibleIndex = visibleSections.indexOf(sectionId);
            const isHero = sectionId === 'hero';
            
            return (
            <div
              key={sectionId}
              ref={el => { itemRefs.current[index] = el; }}
              draggable={isEnabled}
              onDragStart={(e) => isEnabled && handleDragStart(e, visibleIndex)}
              onDragOver={(e) => isEnabled && handleDragOver(e, visibleIndex)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              onTouchStart={(e) => isEnabled && handleTouchStart(visibleIndex, e)}
              onTouchEnd={handleTouchEnd}
              className={`flex flex-col gap-1 p-3 bg-background/50 rounded-lg border transition-all select-none ${
                !isEnabled
                  ? 'opacity-50 border-border/30'
                  : overIndex === visibleIndex && dragIndex !== null
                  ? 'border-primary ring-1 ring-primary/30 scale-[1.02] cursor-grab'
                  : dragIndex === visibleIndex
                  ? 'border-primary/50 opacity-50 cursor-grabbing'
                  : 'border-border/50 hover:border-primary/50 cursor-grab active:cursor-grabbing'
              }`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wide ${!isEnabled ? 'text-muted-foreground/50 line-through' : 'text-primary'}`}>
                {sectionLabels[sectionId] || sectionId}
              </span>
              <div className="flex items-center gap-2">
                <GripVertical className={`w-4 h-4 flex-shrink-0 ${isEnabled ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                <span className="flex-1" />
                {!isHero && onToggleSection && (
                  <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => onToggleSection(sectionId, checked)}
                      className="flex-shrink-0"
                    />
                  </div>
                )}
                {isEnabled && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => moveSection(visibleIndex, 'up')}
                    disabled={visibleIndex === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => moveSection(visibleIndex, 'down')}
                    disabled={visibleIndex === visibleSections.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                )}
              </div>
            </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }
);

SectionOrderManager.displayName = 'SectionOrderManager';
