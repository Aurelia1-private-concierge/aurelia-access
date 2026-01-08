import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Send, 
  Paperclip, 
  Crown, 
  Clock, 
  CheckCheck,
  Lock,
  Search
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "liaison";
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

const conversations: Conversation[] = [
  { id: "1", name: "Victoria Laurent", role: "Private Liaison", lastMessage: "Your Monaco reservation is confirmed.", time: "9:41 AM", unread: 2 },
  { id: "2", name: "Marcus Chen", role: "Investment Advisor", lastMessage: "The property valuation report is ready.", time: "Yesterday", unread: 0 },
  { id: "3", name: "Aurelia Concierge", role: "24/7 Support", lastMessage: "How may we assist you today?", time: "Jan 6", unread: 0 },
];

const initialMessages: Message[] = [
  { id: "1", sender: "liaison", content: "Good morning, Mr. Anderson. I have confirmed your acquisition of the Patek Philippe reference. The item is being moved to the vault.", timestamp: "9:30 AM", read: true },
  { id: "2", sender: "liaison", content: "Shall I arrange transport to the terminal for your 14:00 departure?", timestamp: "9:35 AM", read: true },
  { id: "3", sender: "user", content: "Yes, please. Have the car ready in 20 minutes.", timestamp: "9:41 AM", read: true },
  { id: "4", sender: "liaison", content: "Of course. Your Maybach will arrive at the main entrance at 10:05 AM. The driver has been briefed on your preferred route.", timestamp: "9:42 AM", read: true },
  { id: "5", sender: "liaison", content: "Additionally, I've taken the liberty of confirming your Monaco reservation for the 15th. Suite Princesse Grace is prepared as requested.", timestamp: "9:43 AM", read: false },
];

const SecureMessaging = () => {
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 flex flex-col bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg overflow-hidden"
      >
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/50 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={`w-full p-4 flex items-start gap-3 border-b border-border/20 transition-colors ${
                activeConversation.id === conv.id 
                  ? "bg-primary/5 border-l-2 border-l-primary" 
                  : "hover:bg-muted/30"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{conv.name}</p>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <p className="text-xs text-primary tracking-wider uppercase">{conv.role}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{activeConversation.name}</p>
              <p className="text-xs text-primary tracking-wider uppercase">{activeConversation.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">E2E Encrypted</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center">
            <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Today</span>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-primary/10 border border-primary/20 rounded-tr-none"
                    : "bg-muted/30 border border-border/30 rounded-tl-none"
                }`}
              >
                <p className={`text-sm font-light leading-relaxed ${
                  message.sender === "user" ? "text-primary" : "text-foreground"
                }`}>
                  {message.content}
                </p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  {message.sender === "user" && (
                    <CheckCheck className={`w-3 h-3 ${message.read ? "text-primary" : "text-muted-foreground"}`} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message securely..."
                className="w-full bg-muted/30 border border-border/50 rounded-lg py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-colors"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span className="text-xs">End-to-end encrypted</span>
            </div>
            <span className="text-xs text-muted-foreground">Press Enter to send</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecureMessaging;
