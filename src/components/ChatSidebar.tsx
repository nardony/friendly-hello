import { Search } from "lucide-react";
import { Chat } from "@/data/mockChats";
import { useState } from "react";

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (id: string) => void;
}

const ChatSidebar = ({ chats, activeChat, onSelectChat }: ChatSidebarProps) => {
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-chat-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">Mensagens</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-chat-sidebar-active ${
              activeChat === chat.id ? "bg-chat-sidebar-active" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {chat.avatar}
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-chat-sidebar bg-online" />
              )}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <div className="flex w-full items-center justify-between">
                <span className="truncate text-sm font-semibold text-foreground">
                  {chat.name}
                </span>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {chat.time}
                </span>
              </div>
              <div className="flex w-full items-center justify-between">
                <p className="truncate text-xs text-muted-foreground">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar;
