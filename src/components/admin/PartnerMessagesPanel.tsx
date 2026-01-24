import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Send,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PartnerMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  request_id: string | null;
  message: string;
  read: boolean;
  attachments: string[] | null;
  created_at: string;
  request?: {
    title: string;
  } | null;
}

interface PartnerInfo {
  id: string;
  company_name: string;
}

const PartnerMessagesPanel: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [partners, setPartners] = useState<Map<string, PartnerInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<PartnerMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("partner_messages")
        .select(`
          *,
          request:service_requests(title)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterStatus === "unread") {
        query = query.eq("read", false);
      } else if (filterStatus === "read") {
        query = query.eq("read", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const messageData = (data || []) as PartnerMessage[];
      setMessages(messageData);

      // Fetch partner info for senders
      const senderIds = [...new Set(messageData.map(m => m.sender_id))];
      if (senderIds.length > 0) {
        const { data: partnerData } = await supabase
          .from("partners")
          .select("id, company_name")
          .in("user_id", senderIds);

        if (partnerData) {
          const partnerMap = new Map<string, PartnerInfo>();
          partnerData.forEach(p => {
            partnerMap.set(p.id, { id: p.id, company_name: p.company_name });
          });
          setPartners(partnerMap);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
    toast.success("Messages refreshed");
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("partner_messages")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, read: true } : m))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim() || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from("partner_messages").insert({
        sender_id: user.id,
        recipient_id: selectedMessage.sender_id,
        request_id: selectedMessage.request_id,
        message: replyText.trim(),
        read: false,
      });

      if (error) throw error;

      toast.success("Reply sent successfully");
      setReplyText("");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const getPartnerName = (senderId: string): string => {
    for (const [, partner] of partners) {
      return partner.company_name;
    }
    return "Partner";
  };

  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.message.toLowerCase().includes(query) ||
      m.request?.title?.toLowerCase().includes(query)
    );
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Partner Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            View and respond to messages from partners
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredMessages.length} Message{filteredMessages.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages found</p>
                <p className="text-sm mt-1">Partner messages will appear here when received</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      !message.read ? "bg-primary/5 border-primary/30" : "bg-card"
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.read) {
                        markAsRead(message.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {message.read ? (
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Circle className="w-4 h-4 text-primary fill-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {getPartnerName(message.sender_id)}
                            </span>
                          </div>
                          {message.request && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Re: {message.request.title}
                            </p>
                          )}
                          <p className="text-sm text-foreground/80 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {format(new Date(message.created_at), "MMM d, HH:mm")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {selectedMessage && getPartnerName(selectedMessage.sender_id)}
            </DialogTitle>
            {selectedMessage?.request && (
              <DialogDescription>
                Regarding: {selectedMessage.request.title}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span>From Partner</span>
                <span>
                  {selectedMessage &&
                    format(new Date(selectedMessage.created_at), "MMM d, yyyy 'at' HH:mm")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reply</label>
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyText.trim() || isSending}
              className="gap-2"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerMessagesPanel;
