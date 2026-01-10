import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Pin,
  MessageSquare,
  Calendar,
  Star,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ClientNote {
  id: string;
  client_id: string;
  created_by: string;
  note_type: string;
  title: string;
  content: string;
  is_pinned: boolean;
  follow_up_date: string | null;
  created_at: string;
}

interface Client {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
  notes: ClientNote[];
  requestCount: number;
}

const noteTypeColors: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-500",
  preference: "bg-purple-500/10 text-purple-500",
  complaint: "bg-rose-500/10 text-rose-500",
  vip: "bg-amber-500/10 text-amber-500",
  follow_up: "bg-emerald-500/10 text-emerald-500",
};

const noteTypeIcons: Record<string, React.ElementType> = {
  general: MessageSquare,
  preference: Star,
  complaint: AlertTriangle,
  vip: Star,
  follow_up: Calendar,
};

const CRMPanel = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    note_type: "general",
    follow_up_date: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Fetch profiles as clients
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch service requests to count per client
      const { data: requests } = await supabase
        .from("service_requests")
        .select("client_id");

      // Fetch client notes
      const { data: notes } = await supabase
        .from("client_notes")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      const requestCounts = (requests || []).reduce((acc: Record<string, number>, req) => {
        acc[req.client_id] = (acc[req.client_id] || 0) + 1;
        return acc;
      }, {});

      const clientsWithData: Client[] = (profiles || []).map((profile) => ({
        id: profile.user_id,
        email: profile.display_name || "Unknown",
        display_name: profile.display_name,
        phone: profile.phone,
        created_at: profile.created_at,
        notes: (notes || []).filter((n) => n.client_id === profile.user_id),
        requestCount: requestCounts[profile.user_id] || 0,
      }));

      setClients(clientsWithData);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNote.title || !newNote.content) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("client_notes").insert({
        client_id: selectedClient.id,
        created_by: user.id,
        title: newNote.title,
        content: newNote.content,
        note_type: newNote.note_type,
        follow_up_date: newNote.follow_up_date || null,
      });

      if (error) throw error;

      toast({ title: "Note added", description: "Client note saved successfully." });
      setNoteDialogOpen(false);
      setNewNote({ title: "", content: "", note_type: "general", follow_up_date: "" });
      fetchClients();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    }
  };

  const togglePinNote = async (noteId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("client_notes")
        .update({ is_pinned: !currentPinned })
        .eq("id", noteId);

      if (error) throw error;
      fetchClients();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Client List */}
      <Card className="bg-card/50 border-border/30 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Clients ({clients.length})
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No clients found</div>
          ) : (
            filteredClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedClient?.id === client.id
                    ? "border-primary bg-primary/5"
                    : "border-border/30 hover:border-border/50 hover:bg-muted/20"
                }`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {client.display_name || client.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{client.requestCount} requests</span>
                  <span>{client.notes.length} notes</span>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card className="bg-card/50 border-border/30 lg:col-span-2">
        {selectedClient ? (
          <>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedClient.display_name || selectedClient.email}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedClient.email}
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedClient.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Member since {format(new Date(selectedClient.created_at), "MMM yyyy")}
                    </div>
                  </div>
                </div>
                <Button onClick={() => setNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {selectedClient.notes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notes yet for this client</p>
                    <Button variant="outline" className="mt-4" onClick={() => setNoteDialogOpen(true)}>
                      Add First Note
                    </Button>
                  </div>
                ) : (
                  selectedClient.notes.map((note) => {
                    const Icon = noteTypeIcons[note.note_type] || MessageSquare;
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          note.is_pinned ? "border-primary bg-primary/5" : "border-border/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={noteTypeColors[note.note_type]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {note.note_type}
                            </Badge>
                            <h4 className="font-medium text-foreground">{note.title}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePinNote(note.id, note.is_pinned)}
                          >
                            <Pin className={`h-4 w-4 ${note.is_pinned ? "text-primary fill-primary" : ""}`} />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{note.content}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>{format(new Date(note.created_at), "MMM d, yyyy h:mm a")}</span>
                          {note.follow_up_date && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Follow-up: {format(new Date(note.follow_up_date), "MMM d, yyyy")}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
            Select a client to view details
          </CardContent>
        )}
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Note Type</label>
              <Select
                value={newNote.note_type}
                onValueChange={(v) => setNewNote({ ...newNote, note_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="vip">VIP Note</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Brief note title..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Detailed note content..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Follow-up Date (optional)</label>
              <Input
                type="date"
                value={newNote.follow_up_date}
                onChange={(e) => setNewNote({ ...newNote, follow_up_date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMPanel;
