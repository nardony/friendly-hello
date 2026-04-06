import { useState, useCallback } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import EmptyChat from "@/components/EmptyChat";
import { mockChats, Chat, Message } from "@/data/mockChats";

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const currentChat = chats.find((c) => c.id === activeChat) ?? null;

  const handleSendMessage = useCallback(
    (chatId: string, text: string) => {
      const newMsg: Message = {
        id: `m${Date.now()}`,
        text,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        sent: true,
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: newMsg.time }
            : c
        )
      );
    },
    []
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-[360px] flex-shrink-0">
        <ChatSidebar chats={chats} activeChat={activeChat} onSelectChat={setActiveChat} />
      </div>

      {/* Main area */}
      <div className="flex-1">
        {currentChat ? (
          <ChatArea chat={currentChat} onSendMessage={handleSendMessage} />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Index;
