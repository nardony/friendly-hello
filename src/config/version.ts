// Arquivo de versão do aplicativo
// A versão é manual, mas a data de build é gerada automaticamente pelo Vite

// Versão semântica: MAJOR.MINOR.PATCH
// MAJOR: Mudanças incompatíveis
// MINOR: Novas funcionalidades compatíveis
// PATCH: Correções de bugs
export const APP_VERSION = "1.0.1";

// Data de build gerada automaticamente pelo Vite
declare const __BUILD_DATE__: string;
declare const __BUILD_TIMESTAMP__: string;

export const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString().split('T')[0];
export const LAST_UPDATE = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : new Date().toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

// Para incrementar a versão, altere APP_VERSION acima
// A data de build será atualizada automaticamente a cada build/deploy

// Histórico de versões
export const VERSION_HISTORY = [
  {
    version: "1.0.1",
    date: BUILD_DATE,
    changes: [
      "Sistema de versionamento automático",
      "Botão de limpar cache",
      "Data de build automática"
    ]
  },
  {
    version: "1.0.0",
    date: "2026-01-23",
    changes: [
      "Lançamento inicial",
      "Sistema de landing pages",
      "Editor visual completo",
      "Integração com autenticação"
    ]
  }
];
