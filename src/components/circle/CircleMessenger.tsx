import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Send, 
  ArrowLeft, 
  Shield, 
  CheckCheck, 
  Search,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCircleMessaging, type Conversation, type CircleMessage } from '@/hooks/useCircleMessaging';
import { useAuth } from '@/contexts/AuthContext';

const CircleMessenger = () => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    sendMessage,
    openConversation,
    setActiveConversation,
  } = useCircleMessaging();

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const content = newMessage;
    setNewMessage('');
    await sendMessage(activeConversation, content);
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.member?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = conversations.find(c => c.memberId === activeConversation);

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden">
      {/* Conversations sidebar */}
      <div className={`w-80 border-r border-border/30 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-4 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-border/50"
            />
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Connect with members to start messaging</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.memberId}
                onClick={() => openConversation(conv.memberId)}
                className={`w-full p-4 flex items-start gap-3 border-b border-border/20 hover:bg-muted/30 transition-colors text-left ${
                  activeConversation === conv.memberId ? 'bg-gold/5 border-l-2 border-l-gold' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conv.member?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gold/10 text-gold text-sm">
                      {getInitials(conv.member?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {conv.member?.display_name || 'Member'}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conv.lastMessage.created_at), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>

                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold text-black text-xs flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation && activeConv ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-border/30 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setActiveConversation(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <Avatar className="w-10 h-10">
                <AvatarImage src={activeConv.member?.avatar_url || undefined} />
                <AvatarFallback className="bg-gold/10 text-gold">
                  {getInitials(activeConv.member?.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-medium">{activeConv.member?.display_name}</p>
                {activeConv.member?.title && (
                  <p className="text-xs text-muted-foreground">{activeConv.member.title}</p>
                )}
              </div>

              <div className="flex items-center gap-1 text-emerald-500">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Encrypted</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            isOwn
                              ? 'bg-gold/20 border border-gold/30 rounded-br-none'
                              : 'bg-muted/50 border border-border/30 rounded-bl-none'
                          }`}
                        >
                          <p className={`text-sm ${isOwn ? 'text-gold' : 'text-foreground'}`}>
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), 'HH:mm')}
                            </span>
                            {isOwn && (
                              <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-gold' : 'text-muted-foreground'}`} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-muted/30 border-border/50"
                  disabled={isSending}
                />
                <Button
                  size="icon"
                  className="bg-gold hover:bg-gold/90 text-black"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                🔒 End-to-end encrypted messaging
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="p-6 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <MessageCircle className="w-12 h-12 text-gold" />
            </div>
            <h3 className="text-xl font-semibold mb-2">The Circle Messenger</h3>
            <p className="text-muted-foreground max-w-sm">
              Select a conversation or connect with members to start secure, encrypted messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircleMessenger;
