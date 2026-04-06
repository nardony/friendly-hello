import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/hooks/useAuth';

interface EditorTourProps {
  isNewPage?: boolean;
}

export const EditorTour = ({ isNewPage }: EditorTourProps) => {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Check if this specific user has seen the tour
    const tourKey = `editor-tour-seen-${user.id}`;
    const tourSeen = localStorage.getItem(tourKey);
    
    if (!tourSeen) {
      setHasSeenTour(false);
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const startTour = () => {
    if (!user) return;
    
    const tourKey = `editor-tour-seen-${user.id}`;
    
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'hsl(0 0% 0%)',
      overlayOpacity: 0.35,
      stagePadding: 10,
      popoverClass: 'driver-popover-custom',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: '🚀 Começar!',
      progressText: 'Passo {{current}} de {{total}}',
      allowClose: true,
      onDestroyStarted: () => {
        localStorage.setItem(tourKey, 'true');
        setHasSeenTour(true);
        driverObj.destroy();
      },
      steps: [
        {
          popover: {
            title: '🎉 Bem-vindo ao Editor de Landing Pages!',
            description: 'Este é seu painel para criar páginas de vendas incríveis. Vamos fazer um tour rápido por todas as funcionalidades?',
            side: 'over',
            align: 'center'
          }
        },
        {
          element: '#tour-tabs',
          popover: {
            title: '📑 Abas de Configuração',
            description: '<strong>Aqui você encontra todas as seções:</strong><br><br>• <strong>Básico:</strong> URL, título e publicação<br>• <strong>Layout:</strong> Ordem das seções<br>• <strong>Imagens:</strong> Logo, hero e background<br>• <strong>Preços:</strong> Valores e parcelamento<br>• <strong>Sobre:</strong> Informações do produto<br>• <strong>Doação:</strong> Configurar PIX<br>• <strong>Conteúdo:</strong> Features e passos<br>• <strong>Depoimentos:</strong> Avaliações de clientes<br>• <strong>FAQ:</strong> Perguntas frequentes<br>• <strong>SEO:</strong> Meta tags para Google',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#tour-slug',
          popover: {
            title: '🔗 URL Amigável',
            description: 'Defina o endereço da sua página. Use o botão <strong>"Gerar"</strong> para criar automaticamente a partir do título. Exemplo: seusite.com/<strong>nome-do-produto</strong>',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-title',
          popover: {
            title: '📝 Título da Página',
            description: 'Este título identifica sua página no dashboard. Escolha um nome que você lembre facilmente.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-publish',
          popover: {
            title: '✨ Publicar sua Página',
            description: 'Quando sua página estiver pronta, <strong>ative esta opção</strong> para torná-la visível para o público. Páginas não publicadas ficam em rascunho.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-colors',
          popover: {
            title: '🎨 Paleta de Cores',
            description: 'Escolha uma das <strong>paletas prontas</strong> ou personalize cada cor individualmente. As cores são aplicadas automaticamente em toda a página.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#tour-preview-toggle',
          popover: {
            title: '👁️ Mostrar/Ocultar Preview',
            description: 'Use este botão para <strong>mostrar ou esconder</strong> o preview em tempo real. Útil quando quiser focar apenas na edição.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-save',
          popover: {
            title: '💾 Salvar Alterações',
            description: 'O sistema <strong>salva automaticamente</strong> suas alterações, mas você pode clicar aqui para salvar manualmente e voltar ao dashboard.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-preview-area',
          popover: {
            title: '📱 Preview em Tempo Real',
            description: 'Aqui você vê exatamente como sua página ficará para os visitantes. As alterações aparecem <strong>instantaneamente</strong> enquanto você edita!',
            side: 'left',
            align: 'center'
          }
        },
        {
          popover: {
            title: '🚀 Pronto para começar!',
            description: '<strong>Dicas importantes:</strong><br><br>✅ Comece preenchendo as informações básicas<br>✅ Adicione imagens de alta qualidade<br>✅ Configure os preços corretamente<br>✅ Adicione depoimentos reais<br>✅ Publique quando estiver satisfeito<br><br>Clique em <strong>"Começar!"</strong> para criar sua primeira página incrível! 🎉',
            side: 'over',
            align: 'center'
          }
        }
      ]
    });

    driverObj.drive();
  };

  // Function to manually trigger the tour
  const restartTour = () => {
    startTour();
  };

  if (hasSeenTour) {
    return null;
  }

  return null;
};

// Export restart function for manual triggering
export const triggerEditorTour = (userId: string) => {
  const tourKey = `editor-tour-seen-${userId}`;
  localStorage.removeItem(tourKey);
  window.location.reload();
};

// Add custom styles for driver.js
const style = document.createElement('style');
style.textContent = `
  .driver-popover-custom {
    background: linear-gradient(145deg, #1a1a2e, #16162a) !important;
    border: 2px solid hsl(var(--primary)) !important;
    color: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      0 0 40px hsl(var(--primary) / 0.4),
      0 0 80px hsl(var(--primary) / 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    max-width: 400px !important;
    backdrop-filter: blur(20px) !important;
  }
  
  .driver-popover-custom .driver-popover-title {
    color: #ffffff !important;
    font-size: 1.3rem !important;
    font-weight: 700 !important;
    margin-bottom: 14px !important;
    text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3) !important;
  }
  
  .driver-popover-custom .driver-popover-description {
    color: #e2e8f0 !important;
    font-size: 1rem !important;
    line-height: 1.7 !important;
  }
  
  .driver-popover-custom .driver-popover-description strong {
    color: #a78bfa !important;
    font-weight: 700 !important;
    text-shadow: 0 0 10px rgba(167, 139, 250, 0.5) !important;
  }
  
  .driver-popover-custom .driver-popover-progress-text {
    color: #94a3b8 !important;
    font-size: 0.85rem !important;
    font-weight: 600 !important;
  }
  
  .driver-popover-custom .driver-popover-prev-btn,
  .driver-popover-custom .driver-popover-next-btn {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 12px 24px !important;
    font-weight: 700 !important;
    transition: all 0.3s ease !important;
    font-size: 0.95rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4) !important;
  }
  
  .driver-popover-custom .driver-popover-prev-btn:hover,
  .driver-popover-custom .driver-popover-next-btn:hover {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6) !important;
  }
  
  .driver-popover-custom .driver-popover-prev-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #e2e8f0 !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: none !important;
  }
  
  .driver-popover-custom .driver-popover-prev-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }
  
  .driver-popover-custom .driver-popover-close-btn {
    color: #94a3b8 !important;
    font-size: 1.4rem !important;
    transition: all 0.2s !important;
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
  }
  
  .driver-popover-custom .driver-popover-close-btn:hover {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }
  
  .driver-popover-custom .driver-popover-arrow-side-bottom {
    border-bottom-color: #1a1a2e !important;
  }
  
  .driver-popover-custom .driver-popover-arrow-side-top {
    border-top-color: #1a1a2e !important;
  }
  
  .driver-popover-custom .driver-popover-arrow-side-left {
    border-left-color: #1a1a2e !important;
  }
  
  .driver-popover-custom .driver-popover-arrow-side-right {
    border-right-color: #1a1a2e !important;
  }

  /* driver.js overlay is an SVG. Background on the SVG would darken EVERYTHING (including the cut-out). */
  .driver-overlay {
    background: transparent !important;
  }

  .driver-overlay path {
    fill: hsl(0 0% 0%) !important;
    opacity: 0.35 !important;
  }
  
  .driver-active-element {
    position: relative !important;
    z-index: 10001 !important;
    box-shadow: 
      0 0 0 4px hsl(var(--primary)),
      0 0 0 8px rgba(139, 92, 246, 0.4),
      0 0 50px hsl(var(--primary) / 0.7),
      0 0 100px hsl(var(--primary) / 0.4) !important;
    border-radius: 12px !important;
    filter: brightness(1.1) contrast(1.05) !important;
  }
  
  .driver-active-element,
  .driver-active-element * {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .driver-active-element input,
  .driver-active-element textarea,
  .driver-active-element select {
    background: #2a2a45 !important;
    border-color: hsl(var(--primary)) !important;
    color: #ffffff !important;
  }
  
  .driver-active-element label,
  .driver-active-element p,
  .driver-active-element span,
  .driver-active-element h1,
  .driver-active-element h2,
  .driver-active-element h3,
  .driver-active-element h4 {
    color: #ffffff !important;
  }
  
  .driver-active-element button {
    opacity: 1 !important;
  }
`;
document.head.appendChild(style);
