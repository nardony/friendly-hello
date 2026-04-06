import { useEffect } from 'react';

export const useSecurityProtection = () => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for dev tools and source view
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+K (Firefox Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+M (Responsive Design Mode)
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection on sensitive areas
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return true;
      }
      if (target.closest('[data-allow-select]')) {
        return true;
      }
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable copy on sensitive elements
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return true;
      }
      if (target.closest('[data-allow-select]')) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // DevTools detection via debugger timing
    let devtoolsCheckInterval: ReturnType<typeof setInterval>;
    if (import.meta.env.PROD) {
      devtoolsCheckInterval = setInterval(() => {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = performance.now();
        if (end - start > 100) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#ff4444;font-size:24px;font-family:sans-serif;text-align:center;padding:20px;">⚠️ Acesso não autorizado detectado.<br/>Ferramentas de desenvolvedor não são permitidas.</div>';
        }
      }, 3000);
    }

    // Prevent page visibility tricks
    const handleVisibilityChange = () => {
      // Refresh auth token on tab return to prevent stale sessions
      if (!document.hidden) {
        // Session will auto-refresh via Supabase client
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Console warning
    if (import.meta.env.PROD) {
      const warningStyle = 'color: red; font-size: 24px; font-weight: bold;';
      console.log('%c⚠️ ATENÇÃO!', warningStyle);
      console.log('%cEste é um recurso do navegador destinado a desenvolvedores. Se alguém disse para você copiar e colar algo aqui, isso é uma fraude.', 'font-size: 14px;');
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (devtoolsCheckInterval) clearInterval(devtoolsCheckInterval);
    };
  }, []);
};
