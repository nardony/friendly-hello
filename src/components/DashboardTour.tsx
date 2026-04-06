import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/hooks/useAuth';

export const DashboardTour = () => {
  const { user } = useAuth();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Check if this specific user has seen the dashboard tour
    const tourKey = `dashboard-tour-seen-${user.id}`;
    const tourSeen = localStorage.getItem(tourKey);
    
    if (!tourSeen) {
      setHasSeenTour(false);
      // Delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const startTour = () => {
    if (!user) return;
    
    const tourKey = `dashboard-tour-seen-${user.id}`;
    
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'hsl(0 0% 0%)',
      overlayOpacity: 0.35,
      stagePadding: 10,
      popoverClass: 'driver-popover-custom',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: '🚀 Vamos lá!',
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
            title: '🎉 Bem-vindo ao seu Dashboard!',
            description: 'Este é o seu painel de controle onde você gerencia todas as suas landing pages. Vamos fazer um tour rápido!',
            side: 'over',
            align: 'center'
          }
        },
        {
          element: '#tour-dashboard-new-btn',
          popover: {
            title: '➕ Criar Nova Página',
            description: 'Clique aqui para <strong>criar uma nova landing page</strong>. Você será levado ao editor visual onde pode personalizar tudo!',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '#tour-dashboard-pages',
          popover: {
            title: '📄 Suas Landing Pages',
            description: 'Aqui você verá <strong>todas as suas páginas</strong>. Cada card mostra o título, URL e status (Publicada ou Rascunho).',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#tour-dashboard-donate',
          popover: {
            title: '💚 Apoiar o Projeto',
            description: 'Gostou do sistema? Você pode <strong>fazer uma doação via PIX</strong> para ajudar no desenvolvimento de novas funcionalidades!',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#tour-dashboard-site',
          popover: {
            title: '🌐 Ver Site Principal',
            description: 'Clique aqui para <strong>voltar ao site principal</strong> e ver como os visitantes veem sua página.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          popover: {
            title: '🚀 Pronto para começar!',
            description: '<strong>Próximos passos:</strong><br><br>1️⃣ Clique em "Nova Página" para criar sua primeira landing page<br>2️⃣ Personalize com suas cores, textos e imagens<br>3️⃣ Publique e compartilhe com seu público!<br><br>Clique em <strong>"Vamos lá!"</strong> para começar! 🎉',
            side: 'over',
            align: 'center'
          }
        }
      ]
    });

    driverObj.drive();
  };

  if (hasSeenTour) {
    return null;
  }

  return null;
};

// Export restart function for manual triggering
export const triggerDashboardTour = (userId: string) => {
  const tourKey = `dashboard-tour-seen-${userId}`;
  localStorage.removeItem(tourKey);
  window.location.reload();
};

// Add custom styles for driver.js in Dashboard
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
      0 0 0 4px #8B5CF6,
      0 0 0 8px rgba(139, 92, 246, 0.4),
      0 0 60px rgba(139, 92, 246, 0.6),
      0 0 100px rgba(139, 92, 246, 0.4) !important;
    border-radius: 12px !important;
    filter: brightness(1.1) contrast(1.05) !important;
  }
  
  .driver-active-element,
  .driver-active-element * {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .driver-active-element .text-muted-foreground {
    color: #a1a1aa !important;
  }
  
  .driver-active-element h3,
  .driver-active-element h2,
  .driver-active-element h1,
  .driver-active-element p,
  .driver-active-element span {
    color: #ffffff !important;
  }
  
  .driver-active-element button {
    opacity: 1 !important;
    background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
    color: #ffffff !important;
  }
  
  .driver-active-element input,
  .driver-active-element textarea,
  .driver-active-element select {
    background: #2a2a45 !important;
    border-color: #8B5CF6 !important;
    color: #ffffff !important;
  }
`;
document.head.appendChild(style);
