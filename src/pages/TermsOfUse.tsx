import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: 23 de Janeiro de 2026</p>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar o Painel Gerador de Créditos ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Descrição do Serviço</h2>
              <p>
                O Painel Gerador de Créditos é uma plataforma que oferece ferramentas para gerenciamento e criação de landing pages. O acesso ao serviço é fornecido mediante pagamento único, garantindo acesso vitalício às funcionalidades disponíveis no momento da compra.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Cadastro e Conta</h2>
              <p>
                Para utilizar o serviço, você deverá criar uma conta fornecendo informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Uso Aceitável</h2>
              <p>Você concorda em não utilizar o serviço para:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Atividades ilegais ou que violem leis aplicáveis</li>
                <li>Distribuir conteúdo malicioso, spam ou phishing</li>
                <li>Tentar acessar sistemas ou dados não autorizados</li>
                <li>Revender ou redistribuir o acesso ao serviço sem autorização</li>
                <li>Violar direitos de propriedade intelectual de terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Pagamento e Reembolso</h2>
              <p>
                O pagamento é realizado uma única vez para acesso vitalício. Após a confirmação do pagamento, o acesso é liberado automaticamente. Solicitações de reembolso serão analisadas caso a caso, dentro de um prazo de 7 dias após a compra, conforme o Código de Defesa do Consumidor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do serviço, incluindo design, código, textos e imagens, é protegido por direitos autorais. Você recebe uma licença limitada para uso pessoal ou comercial das landing pages criadas, mas não pode copiar, modificar ou distribuir o código-fonte do painel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitação de Responsabilidade</h2>
              <p>
                O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Em nenhum caso seremos responsáveis por danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Modificações dos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato através do nosso suporte via WhatsApp ou email.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Veja também nossa{' '}
              <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;
