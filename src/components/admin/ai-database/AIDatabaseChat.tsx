import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Bot, User, Loader2, 
  Database, Lightbulb, History, Sparkles, Copy, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIDatabaseManager, AISpecialist } from '@/hooks/useAIDatabaseManager';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  queryType?: string;
  tokensUsed?: number;
  responseTimeMs?: number;
  timestamp: Date;
}

const QUICK_QUERIES = [
  { label: 'Member Stats', query: 'Show me total members by membership tier' },
  { label: 'Pending Requests', query: 'How many service requests are pending?' },
  { label: 'Top Partners', query: 'Who are the top-rated partners?' },
  { label: 'Revenue Trends', query: 'What are the recent revenue trends?' },
  { label: 'Active Users', query: 'How many users were active this week?' },
];

export function AIDatabaseChat() {
  const { specialists, fetchSpecialists, executeQuery, isLoading } = useAIDatabaseManager();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [queryType, setQueryType] = useState<'database' | 'insights' | 'chat'>('database');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      queryType,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const response = await executeQuery(
      input,
      queryType,
      selectedSpecialist || undefined
    );

    if (response) {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        tokensUsed: response.tokensUsed,
        responseTimeMs: response.responseTimeMs,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuery = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeSpecialists = specialists.filter(s => s.is_active);

  return (
    <div className="h-[calc(100vh-16rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Tabs value={queryType} onValueChange={(v) => setQueryType(v as typeof queryType)} className="flex-1">
          <TabsList>
            <TabsTrigger value="database" className="gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeSpecialists.length > 0 && (
          <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select specialist..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Auto-select</SelectItem>
              {activeSpecialists.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3" />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Database Assistant</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Ask questions about your database in natural language. 
                I can help analyze data, find trends, and generate insights.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_QUERIES.map((q) => (
                  <Button
                    key={q.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuery(q.query)}
                  >
                    {q.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full h-fit ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'user' 
                        ? <User className="h-4 w-4" /> 
                        : <Bot className="h-4 w-4" />
                      }
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`inline-block p-4 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          {message.tokensUsed && (
                            <span>{message.tokensUsed} tokens</span>
                          )}
                          {message.responseTimeMs && (
                            <span>• {(message.responseTimeMs / 1000).toFixed(1)}s</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="p-2 rounded-full bg-muted h-fit">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                queryType === 'database'
                  ? 'Ask about your data... (e.g., "How many members joined this month?")'
                  : queryType === 'insights'
                  ? 'Request analysis... (e.g., "What patterns do you see in request trends?")'
                  : 'Chat with Orla about anything...'
              }
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
