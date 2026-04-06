import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: 23 de Janeiro de 2026</p>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Introdução</h2>
              <p>
                Esta Política de Privacidade descreve como o Painel Gerador de Créditos ("nós", "nosso") coleta, usa e protege suas informações pessoais. Ao utilizar nosso serviço, você concorda com a coleta e uso de informações conforme descrito nesta política.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Informações Coletadas</h2>
              <p>Coletamos os seguintes tipos de informações:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Dados de cadastro:</strong> nome, email, senha (criptografada)</li>
                <li><strong>Dados de pagamento:</strong> processados por terceiros (gateways de pagamento)</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, recursos utilizados, data e hora de acesso</li>
                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Uso das Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Fornecer e manter o serviço</li>
                <li>Processar transações e enviar confirmações</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Melhorar e personalizar a experiência do usuário</li>
                <li>Detectar e prevenir fraudes e abusos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartilhamento de Dados</h2>
              <p>
                Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Processadores de pagamento para completar transações</li>
                <li>Provedores de serviços que nos auxiliam na operação</li>
                <li>Autoridades legais, quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia de senhas, conexões seguras (HTTPS) e controle de acesso restrito aos dados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
              <p>
                Utilizamos cookies para manter sua sessão ativa, lembrar preferências e analisar o uso do serviço. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Retenção de Dados</h2>
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer o serviço. Dados podem ser retidos por períodos maiores para cumprir obrigações legais ou resolver disputas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Menores de Idade</h2>
              <p>
                Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se tomarmos conhecimento de tal coleta, excluiremos os dados imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do email cadastrado ou aviso no serviço. Recomendamos revisar esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Contato</h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato através do nosso suporte via WhatsApp ou pelo email disponível em nosso site.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Veja também nossos{' '}
              <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
