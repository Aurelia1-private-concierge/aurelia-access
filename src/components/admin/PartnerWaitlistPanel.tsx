import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, User, Mail, Calendar, Tag, Search, 
  Download, Trash2, RefreshCw, Loader2, Filter,
  ChevronDown, Check, X, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  email: string;
  company_name: string | null;
  interest_type: string;
  category_preferences: string[] | null;
  message: string | null;
  created_at: string;
}

const PartnerWaitlistPanel = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("partner_waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("interest_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      toast.error("Failed to load waitlist entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filterType]);

  const filteredEntries = entries.filter(entry =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category_preferences?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("partner_waitlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Entry deleted");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("partner_waitlist")
        .delete()
        .in("id", selectedEntries);

      if (error) throw error;
      
      setEntries(prev => prev.filter(e => !selectedEntries.includes(e.id)));
      setSelectedEntries([]);
      toast.success(`${selectedEntries.length} entries deleted`);
    } catch (error) {
      console.error("Error deleting entries:", error);
      toast.error("Failed to delete entries");
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Company", "Type", "Categories", "Message", "Date"];
    const rows = filteredEntries.map(entry => [
      entry.email,
      entry.company_name || "",
      entry.interest_type,
      entry.category_preferences?.join("; ") || "",
      entry.message || "",
      format(new Date(entry.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully");
  };

  const toggleSelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map(e => e.id));
    }
  };

  const partnerCount = entries.filter(e => e.interest_type === "partner").length;
  const memberCount = entries.filter(e => e.interest_type === "member").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Total Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{partnerCount}</p>
                <p className="text-sm text-muted-foreground">Partner Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{memberCount}</p>
                <p className="text-sm text-muted-foreground">Member Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Panel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Partner Network Waitlist
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEntries}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredEntries.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              {selectedEntries.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedEntries.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Entries?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {selectedEntries.length} waitlist entries.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, company, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-background/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="partner">Partners Only</SelectItem>
                <SelectItem value="member">Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Waitlist Entries</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "No entries match your search criteria." : "No one has joined the waitlist yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 rounded hover:bg-muted/50 transition-colors"
                      >
                        {selectedEntries.length === filteredEntries.length ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 border border-border rounded" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="group">
                      <TableCell>
                        <button
                          onClick={() => toggleSelection(entry.id)}
                          className="p-1 rounded hover:bg-muted/50 transition-colors"
                        >
                          {selectedEntries.includes(entry.id) ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <div className="h-4 w-4 border border-border rounded group-hover:border-primary/50" />
                          )}
                        </button>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{entry.email}</p>
                          {entry.company_name && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {entry.company_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={entry.interest_type === "partner" 
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                            : "bg-green-500/10 text-green-500 border-green-500/30"
                          }
                        >
                          {entry.interest_type === "partner" ? (
                            <Building2 className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {entry.interest_type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {entry.category_preferences?.slice(0, 3).map((cat, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                          {(entry.category_preferences?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entry.category_preferences!.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {entry.message && (
                          <p className="text-sm text-muted-foreground max-w-xs truncate" title={entry.message}>
                            {entry.message}
                          </p>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), "HH:mm")}
                        </p>
                      </TableCell>
                      
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the waitlist entry for {entry.email}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartnerWaitlistPanel;
