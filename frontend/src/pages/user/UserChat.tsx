import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/types";

const MOCK_MESSAGES: ChatMessage[] = [
  { id: "1", senderId: "2", senderName: "James Wilson", senderRole: "CONTRACTOR", content: "Hi Sarah, just wanted to give you an update on the kitchen. Cabinets are in!", timestamp: "2026-02-14T09:00:00" },
  { id: "2", senderId: "3", senderName: "Sarah Chen", senderRole: "USER", content: "That's wonderful! Can't wait to see them. Any issues with the measurements?", timestamp: "2026-02-14T09:15:00" },
  { id: "3", senderId: "2", senderName: "James Wilson", senderRole: "CONTRACTOR", content: "Everything fits perfectly. We'll start on the countertops next week.", timestamp: "2026-02-14T09:30:00" },
];

const CONVERSATIONS = [
  { id: "1", name: "James Wilson", company: "Wilson & Sons Construction", project: "Kitchen Remodel", lastMessage: "Everything fits perfectly...", unread: 1 },
  { id: "2", name: "Metro Build Corp", company: "Metro Build Corp", project: "Office Build-Out", lastMessage: "We'll send the plans...", unread: 0 },
];

const UserChat = () => {
  const [selectedConvo, setSelectedConvo] = useState("1");
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with your contractors</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        <div className="w-72 shrink-0 rounded-lg border border-border bg-card shadow-card overflow-auto hidden md:block">
          {CONVERSATIONS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConvo(c.id)}
              className={`w-full text-left p-4 border-b border-border transition-colors ${selectedConvo === c.id ? "bg-secondary/10" : "hover:bg-muted"}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground text-sm">{c.name}</p>
                {c.unread > 0 && <span className="h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">{c.unread}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{c.project}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{c.lastMessage}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col rounded-lg border border-border bg-card shadow-card">
          <div className="border-b border-border p-4">
            <p className="font-medium text-foreground">James Wilson</p>
            <p className="text-xs text-muted-foreground">Wilson & Sons Construction · Kitchen Remodel</p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {MOCK_MESSAGES.map(m => (
              <div key={m.id} className={`flex ${m.senderRole === "USER" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2.5 ${m.senderRole === "USER" ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
                  <p className="text-sm">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${m.senderRole === "USER" ? "text-secondary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && setNewMessage("")} />
              <Button size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
