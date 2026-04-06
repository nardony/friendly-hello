import { useEffect, useState } from 'react';

const PanelAccess = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        <p className="text-white/70 text-sm">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0f1a] overflow-hidden">
      <style>{`
        .panel-iframe {
          width: 100%;
          height: calc(100% + 140px);
          margin-top: -60px;
          margin-left: 0;
        }
        @media (min-width: 768px) {
          .panel-iframe {
            width: calc(100% + 44px);
            height: calc(100% + 150px);
            margin-top: -70px;
            margin-left: -44px;
          }
        }
      `}</style>
      <div className="absolute top-0 left-0 right-0 h-[60px] md:h-[70px] bg-[#0a0f1a] z-10" />
      <div className="absolute top-0 left-0 bottom-0 w-0 md:w-[44px] bg-[#0a0f1a] z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-[#0a0f1a] z-10" />
      <div className="w-full h-full overflow-hidden">
        <iframe
          src="https://www.painelcreditoslovable.com/auth"
          className="panel-iframe border-0"
          title="Painel Gerador de Créditos"
          allow="clipboard-read; clipboard-write; payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
          referrerPolicy="no-referrer"
          scrolling="yes"
        />
      </div>
    </div>
  );
};

export default PanelAccess;
