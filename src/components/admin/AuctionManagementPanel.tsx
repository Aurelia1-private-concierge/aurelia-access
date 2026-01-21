import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Gavel,
  Star,
  DollarSign,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ImageIcon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
  current_bid: number | null;
  reserve_price: number | null;
  buy_now_price: number | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
  images: string[];
  submitted_by: string | null;
  submitted_by_type: string;
  approval_status: string;
  featured: boolean;
  authenticity_verified: boolean;
  created_at: string;
  bid_count?: number;
}

interface AuctionCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

interface Consignment {
  id: string;
  submitter_id: string;
  submitter_type: string;
  title: string;
  description: string;
  category_id: string | null;
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  reserve_price_request: number | null;
  images: string[];
  status: string;
  created_at: string;
}

const AuctionManagementPanel = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<AuctionCategory[]>([]);
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialog states
  const [auctionDialogOpen, setAuctionDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    starting_price: "",
    reserve_price: "",
    buy_now_price: "",
    start_time: "",
    end_time: "",
    featured: false,
    authenticity_verified: false,
    provenance: "",
    condition_report: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auctionsRes, categoriesRes, consignmentsRes] = await Promise.all([
        supabase.from("auctions").select("*").order("created_at", { ascending: false }),
        supabase.from("auction_categories").select("*").order("display_order"),
        supabase.from("auction_consignments").select("*").order("created_at", { ascending: false }),
      ]);

      if (auctionsRes.error) throw auctionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      
      // Get bid counts
      const auctionIds = auctionsRes.data?.map(a => a.id) || [];
      const { data: bidCounts } = await supabase
        .from("auction_bids")
        .select("auction_id")
        .in("auction_id", auctionIds);

      const bidCountMap: Record<string, number> = {};
      bidCounts?.forEach(bid => {
        bidCountMap[bid.auction_id] = (bidCountMap[bid.auction_id] || 0) + 1;
      });

      setAuctions((auctionsRes.data || []).map(a => ({
        ...a,
        bid_count: bidCountMap[a.id] || 0,
      })));
      setCategories(categoriesRes.data || []);
      setConsignments(consignmentsRes.data || []);
    } catch (error) {
      console.error("Error fetching auction data:", error);
      toast.error("Failed to load auction data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || auction.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || auction.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openCreateDialog = () => {
    setEditingAuction(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      starting_price: "",
      reserve_price: "",
      buy_now_price: "",
      start_time: "",
      end_time: "",
      featured: false,
      authenticity_verified: false,
      provenance: "",
      condition_report: "",
    });
    setAuctionDialogOpen(true);
  };

  const openEditDialog = (auction: Auction) => {
    setEditingAuction(auction);
    setFormData({
      title: auction.title,
      description: auction.description,
      category: auction.category,
      starting_price: auction.starting_price.toString(),
      reserve_price: auction.reserve_price?.toString() || "",
      buy_now_price: auction.buy_now_price?.toString() || "",
      start_time: auction.starts_at ? format(new Date(auction.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
      end_time: auction.ends_at ? format(new Date(auction.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
      featured: auction.featured,
      authenticity_verified: auction.authenticity_verified,
      provenance: "",
      condition_report: "",
    });
    setAuctionDialogOpen(true);
  };

  const handleSaveAuction = async () => {
    if (!formData.title || !formData.category || !formData.starting_price) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        starting_price: parseFloat(formData.starting_price),
        reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
        buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
        starts_at: formData.start_time || null,
        ends_at: formData.end_time || null,
        featured: formData.featured,
        authenticity_verified: formData.authenticity_verified,
        submitted_by_type: "admin",
        approval_status: "approved",
        status: formData.start_time && new Date(formData.start_time) <= new Date() ? "active" : "upcoming",
      };

      if (editingAuction) {
        const { error } = await supabase
          .from("auctions")
          .update(payload)
          .eq("id", editingAuction.id);
        if (error) throw error;
        toast.success("Auction updated successfully");
      } else {
        const { error } = await supabase.from("auctions").insert([payload]);
        if (error) throw error;
        toast.success("Auction created successfully");
      }

      setAuctionDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving auction:", error);
      toast.error("Failed to save auction");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAuction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    
    try {
      const { error } = await supabase.from("auctions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Auction deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting auction:", error);
      toast.error("Failed to delete auction");
    }
  };

  const handleApprovalChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("auctions")
        .update({ approval_status: status })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Auction ${status}`);
      fetchData();
    } catch (error) {
      console.error("Error updating approval:", error);
      toast.error("Failed to update status");
    }
  };

  const handleConsignmentReview = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from("auction_consignments")
        .update({ 
          status, 
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Consignment ${status}`);
      fetchData();
    } catch (error) {
      console.error("Error updating consignment:", error);
      toast.error("Failed to update consignment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-500/20 text-green-500 border-green-500/30",
      upcoming: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      ended: "bg-muted text-muted-foreground border-border",
      sold: "bg-primary/20 text-primary border-primary/30",
      cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return (
      <Badge variant="outline" className={variants[status] || ""}>
        {status}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: auctions.length,
    active: auctions.filter(a => a.status === "active").length,
    totalValue: auctions.reduce((sum, a) => sum + (a.current_bid || a.starting_price), 0),
    pendingConsignments: consignments.filter(c => c.status === "pending").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-serif text-3xl text-foreground">Auction Management</h1>
          <p className="text-muted-foreground">Manage auctions, categories, and consignments</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create Auction
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Auctions", value: stats.total, icon: Gavel },
          { label: "Active Now", value: stats.active, icon: Clock },
          { label: "Total Value", value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign },
          { label: "Pending Consignments", value: stats.pendingConsignments, icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <stat.icon className="w-8 h-8 text-primary/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="auctions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auctions">Auctions</TabsTrigger>
          <TabsTrigger value="consignments">
            Consignments
            {stats.pendingConsignments > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.pendingConsignments}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search auctions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Auctions Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No auctions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAuctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {auction.images?.[0] ? (
                              <img src={auction.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{auction.title}</p>
                            <div className="flex items-center gap-2">
                              {auction.featured && (
                                <Star className="w-3 h-3 text-primary fill-primary" />
                              )}
                              {auction.authenticity_verified && (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{auction.category?.replace(/-/g, " ")}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${(auction.current_bid || auction.starting_price).toLocaleString()}</p>
                          {auction.reserve_price && !auction.current_bid && (
                            <p className="text-xs text-muted-foreground">Reserve: ${auction.reserve_price.toLocaleString()}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{auction.bid_count || 0}</TableCell>
                      <TableCell>{getStatusBadge(auction.status)}</TableCell>
                      <TableCell>
                        {auction.ends_at ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(auction.ends_at), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No end date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(auction)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteAuction(auction.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Consignments Tab */}
        <TabsContent value="consignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner & Member Consignments</CardTitle>
              <CardDescription>Review items submitted for auction consideration</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No consignments submitted yet
                    </TableCell>
                  </TableRow>
                ) : (
                  consignments.map((consignment) => (
                    <TableRow key={consignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {consignment.images?.[0] ? (
                              <img src={consignment.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{consignment.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{consignment.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {consignment.submitter_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {consignment.estimated_value_min && consignment.estimated_value_max ? (
                          <span>${consignment.estimated_value_min.toLocaleString()} - ${consignment.estimated_value_max.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            consignment.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                            consignment.status === "approved" ? "bg-green-500/20 text-green-500" :
                            consignment.status === "rejected" ? "bg-destructive/20 text-destructive" :
                            ""
                          }
                        >
                          {consignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(consignment.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {consignment.status === "pending" && (
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8 text-green-500"
                              onClick={() => handleConsignmentReview(consignment.id, "approved")}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleConsignmentReview(consignment.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auction Categories</CardTitle>
              <CardDescription>Manage category taxonomy</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{category.description}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Auction Dialog */}
      <Dialog open={auctionDialogOpen} onOpenChange={setAuctionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuction ? "Edit Auction" : "Create Auction"}</DialogTitle>
            <DialogDescription>
              {editingAuction ? "Update auction details" : "Add a new auction listing"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Patek Philippe Nautilus 5711"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the item..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="starting_price">Starting Price *</Label>
                <Input
                  id="starting_price"
                  type="number"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reserve_price">Reserve Price</Label>
                <Input
                  id="reserve_price"
                  type="number"
                  value={formData.reserve_price}
                  onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="buy_now_price">Buy Now Price</Label>
                <Input
                  id="buy_now_price"
                  type="number"
                  value={formData.buy_now_price}
                  onChange={(e) => setFormData({ ...formData, buy_now_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured Auction</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="authenticity"
                  checked={formData.authenticity_verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, authenticity_verified: checked })}
                />
                <Label htmlFor="authenticity">Authenticity Verified</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAuctionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAuction} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAuction ? "Update" : "Create"} Auction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuctionManagementPanel;
