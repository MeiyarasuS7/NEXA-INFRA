import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Minimize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { groqService } from "@/services/groq";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock function to get user-specific stats (replace with real API call)
const getUserStats = (role: string | null) => {
  if (!role) return null;
  
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        totalContractors: 2547,
        activeProjects: 342,
        pendingApprovals: 12,
        monthlyRevenue: 'Rs 12L',
        disputes: 7,
        completionRate: '94%',
      };
    case 'CONTRACTOR':
      return {
        activeProjects: 3,
        completedProjects: 89,
        rating: 4.8,
        totalEarnings: 'Rs 2.45L',
        pendingReviews: 2,
      };
    case 'USER':
      return {
        activeProjects: 2,
        totalProjects: 5,
        completedProjects: 3,
        pendingPayments: 1,
      };
    default:
      return null;
  }
};

const getGreeting = (userName: string | null, userRole: string | null) => {
  if (!userName) {
    return "Hello! I'm NEXA AI. I'm always here to help. How can I assist you today?";
  }
  
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  
  switch (userRole) {
    case 'SUPER_ADMIN':
      return `Good ${timeOfDay}, ${userName}! I'm NEXA AI, your admin assistant. I can help you with platform statistics, contractor approvals, project monitoring, and more. What would you like to know?`;
    case 'CONTRACTOR':
      return `Good ${timeOfDay}, ${userName}! I'm NEXA AI, here to help you manage your projects and grow your business. How can I assist you today?`;
    case 'USER':
      return `Good ${timeOfDay}, ${userName}! I'm NEXA AI, your project assistant. I can help you find contractors, manage projects, and answer any questions. What can I help you with?`;
    default:
      return `Hello, ${userName}! I'm NEXA AI. How can I assist you today?`;
  }
};

export const Chatbot = () => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats] = useState(() => getUserStats(role));
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: '1',
    text: getGreeting(user?.full_name || null, role),
    sender: 'bot',
    timestamp: new Date(),
  }]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare conversation history for Groq API
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Prepare user context with role-specific data
      const userContext = {
        user: user || null,
        stats: userStats,
      };

      // Get response from Groq API with user context
      const botResponse = await groqService.getResponse(
        currentInput, 
        conversationHistory,
        userContext
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get role-specific suggestions
  const getSuggestions = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return "Show stats, Pending approvals, Active disputes";
      case 'CONTRACTOR':
        return "My projects, Earnings, Client reviews";
      case 'USER':
        return "Find contractors, Track projects, Payment help";
      default:
        return "Find contractors, Track projects, Payment help";
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all",
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
          "hover:scale-110"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex h-[600px] w-[380px] flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-[500px] opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-secondary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-foreground/20">
              <MessageSquare className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground">NEXA AI</h3>
              <div className="flex items-center gap-1.5 text-xs text-secondary-foreground/80">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Online • Always here to help</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Suggestions */}
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>💡</span>
            <span>Popular: {getSuggestions()}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  message.sender === 'user'
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                <p className="mt-1 text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-muted text-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 border-muted"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Powered by NEXA AI • Press Enter to send
          </p>
        </div>
      </div>
    </>
  );
};
