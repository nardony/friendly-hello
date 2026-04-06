import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from "lucide-react";
import { Chat, Message } from "@/data/mockChats";
import { useState } from "react";

interface ChatAreaProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
}

const MessageBubble = ({ message }: { message: Message }) => (
  <div
    className={`flex animate-message-in ${message.sent ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
        message.sent
          ? "rounded-br-md bg-chat-sent text-chat-sent-foreground"
          : "rounded-bl-md bg-chat-received text-chat-received-foreground"
      }`}
    >
      <p className="text-sm leading-relaxed">{message.text}</p>
      <p
        className={`mt-1 text-[10px] ${
          message.sent ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {message.time}
      </p>
    </div>
  </div>
);

const ChatArea = ({ chat, onSendMessage }: ChatAreaProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(chat.id, input.trim());
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-chat-header px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {chat.avatar}
            </div>
            {chat.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-chat-header bg-online" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
            <Phone className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
            <Video className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-chat-input-bg px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
            <Smile className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
