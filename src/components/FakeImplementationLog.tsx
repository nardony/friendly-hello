import { useState, useEffect } from 'react';

const messages = [
  '🔧 Compilando módulos de créditos...',
  '⚙️ Configurando API de geração...',
  '📦 Instalando dependências do painel...',
  '🔐 Criptografando chaves de acesso...',
  '🚀 Otimizando velocidade do servidor...',
  '🧠 Treinando modelo de automação...',
  '📊 Sincronizando banco de dados...',
  '🔄 Atualizando sistema de renovação...',
  '✅ Validando integridade dos módulos...',
  '🛡️ Aplicando camadas de segurança...',
  '💾 Salvando configurações do painel...',
  '🌐 Conectando servidores globais...',
];

const getBrasiliaTime = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
  };
};

export const FakeImplementationLog = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [clock, setClock] = useState(getBrasiliaTime);

  useEffect(() => {
    const clockInterval = setInterval(() => setClock(getBrasiliaTime()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center gap-1">
      <p
        className={`text-xs sm:text-sm font-mono text-primary/80 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {messages[currentIndex]}
      </p>
      <span className="text-[10px] sm:text-xs font-mono text-muted-foreground/60">
        📅 {clock.date} — 🕐 {clock.time} (Brasília)
      </span>
    </div>
  );
};
