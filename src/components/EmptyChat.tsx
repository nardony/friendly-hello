import { MessageCircle } from "lucide-react";

const EmptyChat = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
      <MessageCircle className="h-10 w-10 text-primary" />
    </div>
    <div className="text-center">
      <h2 className="text-lg font-semibold text-foreground">Suas mensagens</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione uma conversa para começar
      </p>
    </div>
  </div>
);

export default EmptyChat;
