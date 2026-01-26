import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Target, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Building2,
  Globe,
  Send
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  MARKETING_PACKAGES, 
  UHNW_NETWORKS, 
  SOCIAL_STRATEGY,
  calculateMarketingBudget 
} from "@/lib/marketing-packages";

const MarketingPackagesPanel = () => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<typeof UHNW_NETWORKS[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    notes: "",
    targetLaunchDate: ""
  });

  const handleLearnMore = (network: typeof UHNW_NETWORKS[0]) => {
    setSelectedNetwork(network);
    setIsNetworkDialogOpen(true);
  };

  const handleRequestNetworkAccess = () => {
    if (selectedNetwork) {
      toast.success(`Access request for ${selectedNetwork.name} submitted. Our team will contact you shortly.`);
      setIsNetworkDialogOpen(false);
    }
  };
  
  const togglePackage = (id: string) => {
    setSelectedPackages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const budget = calculateMarketingBudget(selectedPackages);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmitProposal = async () => {
    if (!proposalForm.email || !proposalForm.contactName) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get selected package details
      const selectedPackageDetails = MARKETING_PACKAGES.filter(pkg => 
        selectedPackages.includes(pkg.id)
      ).map(pkg => pkg.name);

      // Submit to concierge_requests table
      const { error } = await supabase
        .from("concierge_requests")
        .insert({
          title: `Marketing Proposal Request - ${selectedPackageDetails.join(", ")}`,
          description: `Budget Range: ${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}\n\nPackages: ${selectedPackageDetails.join(", ")}\n\nAdditional Notes: ${proposalForm.notes || "None"}`,
          category: "marketing",
          priority: "high",
          guest_name: proposalForm.contactName,
          guest_email: proposalForm.email,
          budget_range: `${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}`,
          preferred_date: proposalForm.targetLaunchDate || null,
          location: proposalForm.companyName || null,
          status: "new"
        });

      if (error) throw error;

      toast.success("Proposal request submitted successfully! Our team will contact you shortly.");
      setIsProposalDialogOpen(false);
      setProposalForm({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        notes: "",
        targetLaunchDate: ""
      });
      setSelectedPackages([]);
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit proposal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      {selectedPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Packages Budget</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{selectedPackages.length} packages selected</p>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => setIsProposalDialogOpen(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Request Proposal
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Proposal Request Dialog */}
      <Dialog open={isProposalDialogOpen} onOpenChange={setIsProposalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Marketing Proposal</DialogTitle>
            <DialogDescription>
              Our team will prepare a detailed proposal for your selected marketing packages.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Selected Packages Summary */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Selected Packages:</p>
              <div className="flex flex-wrap gap-1">
                {MARKETING_PACKAGES.filter(pkg => selectedPackages.includes(pkg.id)).map(pkg => (
                  <Badge key={pkg.id} variant="secondary" className="text-xs">
                    {pkg.name}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Budget: {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Your name"
                  value={proposalForm.contactName}
                  onChange={(e) => setProposalForm({ ...proposalForm, contactName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={proposalForm.email}
                  onChange={(e) => setProposalForm({ ...proposalForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Company name"
                  value={proposalForm.companyName}
                  onChange={(e) => setProposalForm({ ...proposalForm, companyName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={proposalForm.phone}
                  onChange={(e) => setProposalForm({ ...proposalForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetLaunchDate">Target Launch Date</Label>
              <Input
                id="targetLaunchDate"
                type="date"
                value={proposalForm.targetLaunchDate}
                onChange={(e) => setProposalForm({ ...proposalForm, targetLaunchDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or questions..."
                rows={3}
                value={proposalForm.notes}
                onChange={(e) => setProposalForm({ ...proposalForm, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProposalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitProposal} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Network Details Dialog */}
      <Dialog open={isNetworkDialogOpen} onOpenChange={setIsNetworkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {selectedNetwork?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedNetwork?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Requirement</p>
                <p className="text-sm">{selectedNetwork?.memberRequirement}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Access Method</p>
                <Badge variant="secondary">{selectedNetwork?.accessMethod}</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Benefits of Access:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Direct access to ultra-high-net-worth individuals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Curated networking opportunities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Exclusive event invitations
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNetworkDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleRequestNetworkAccess}>
              <Send className="w-4 h-4 mr-2" />
              Request Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Marketing Packages</TabsTrigger>
          <TabsTrigger value="networks">UHNW Networks</TabsTrigger>
          <TabsTrigger value="social">Social Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MARKETING_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedPackages.includes(pkg.id) 
                      ? 'border-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => togglePackage(pkg.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {pkg.description}
                        </CardDescription>
                      </div>
                      {selectedPackages.includes(pkg.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {pkg.channels.slice(0, 3).map(channel => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                      {pkg.channels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pkg.channels.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatCurrency(pkg.budget.min)} - {formatCurrency(pkg.budget.max)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{pkg.expectedReach}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{pkg.roi}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {UHNW_NETWORKS.map((network, index) => (
              <motion.div
                key={network.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      {network.name}
                    </CardTitle>
                    <CardDescription>{network.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Member Requirement</p>
                      <p className="text-sm font-medium">{network.memberRequirement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Access Method</p>
                      <Badge variant="secondary">{network.accessMethod}</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLearnMore(network);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          {Object.entries(SOCIAL_STRATEGY).map(([platform, strategy]) => (
            <Card key={platform}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Globe className="w-5 h-5 text-primary" />
                  {platform} Strategy
                </CardTitle>
                <CardDescription>
                  Posting: {strategy.postingFrequency} | Budget: {strategy.budget}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Targeting
                    </p>
                    <ul className="space-y-1">
                      {strategy.targeting.map(target => (
                        <li key={target} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {target}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Content Types</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.contentTypes.map(content => (
                        <Badge key={content} variant="outline" className="text-xs">
                          {content}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingPackagesPanel;
