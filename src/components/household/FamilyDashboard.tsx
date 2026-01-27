import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Baby,
  Mail,
  Settings,
  CreditCard,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface Household {
  id: string;
  name: string;
  type: "family" | "enterprise";
  primary_member_id: string;
  credit_pool_enabled: boolean;
  total_pool_credits: number;
}

interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "dependent";
  permissions: Record<string, unknown>;
  spending_limit: number | null;
  invited_email: string | null;
  status: "active" | "pending" | "suspended";
  joined_at: string | null;
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
  dependent: Baby,
};

const ROLE_COLORS = {
  owner: "text-yellow-500",
  admin: "text-blue-500",
  member: "text-foreground",
  dependent: "text-muted-foreground",
};

export function FamilyDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [householdType, setHouseholdType] = useState<"family" | "enterprise">("family");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "dependent">("member");

  const { data: households, isLoading: loadingHouseholds } = useQuery({
    queryKey: ["households", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get households where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (memberError) throw memberError;
      if (!memberData?.length) return [];

      const householdIds = memberData.map(m => m.household_id);
      
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .in("id", householdIds);
      
      if (error) throw error;
      return data as Household[];
    },
    enabled: !!user?.id,
  });

  const { data: members } = useQuery({
    queryKey: ["household-members", households?.[0]?.id],
    queryFn: async () => {
      if (!households?.[0]?.id) return [];
      
      const { data, error } = await supabase
        .from("household_members")
        .select("*")
        .eq("household_id", households[0].id)
        .order("role");
      
      if (error) throw error;
      return data as HouseholdMember[];
    },
    enabled: !!households?.[0]?.id,
  });

  const createHouseholdMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Create household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          type: householdType,
          primary_member_id: user.id,
        })
        .select()
        .single();
      
      if (householdError) throw householdError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("household_members")
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: "owner",
          status: "active",
          joined_at: new Date().toISOString(),
          permissions: {
            can_request_services: true,
            can_accept_bids: true,
            can_view_billing: true,
            can_manage_members: true,
            can_use_pool_credits: true,
            service_categories: "all",
          },
        });
      
      if (memberError) throw memberError;
      
      return household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      toast.success("Household created successfully");
      setIsCreateOpen(false);
      setHouseholdName("");
    },
    onError: (error) => {
      toast.error(`Failed to create household: ${error.message}`);
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async () => {
      if (!households?.[0]?.id || !user?.id) throw new Error("No household");
      
      const { error } = await supabase
        .from("household_members")
        .insert({
          household_id: households[0].id,
          user_id: user.id, // Temporary - will be updated when invite is accepted
          role: inviteRole,
          invited_by: user.id,
          invited_email: inviteEmail,
          status: "pending",
          permissions: {
            can_request_services: true,
            can_accept_bids: inviteRole === "admin",
            can_view_billing: inviteRole === "admin",
            can_manage_members: false,
            can_use_pool_credits: true,
            service_categories: "all",
          },
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setIsInviteOpen(false);
      setInviteEmail("");
    },
    onError: (error) => {
      toast.error(`Failed to invite: ${error.message}`);
    },
  });

  const toggleCreditPoolMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!households?.[0]?.id) throw new Error("No household");
      
      const { error } = await supabase
        .from("households")
        .update({ credit_pool_enabled: enabled })
        .eq("id", households[0].id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      toast.success("Credit pooling updated");
    },
  });

  const currentHousehold = households?.[0];
  const isOwner = currentHousehold?.primary_member_id === user?.id;

  if (loadingHouseholds) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (!currentHousehold) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Household Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create a family or enterprise account to share your membership benefits with loved ones or team members.
          </p>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Household
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Household</DialogTitle>
                <DialogDescription>
                  Set up a family or enterprise household account to share membership benefits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Household Name</Label>
                  <Input
                    id="name"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="The Smith Family"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={householdType} onValueChange={(v) => setHouseholdType(v as "family" | "enterprise")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createHouseholdMutation.mutate()}
                  disabled={!householdName || createHouseholdMutation.isPending}
                >
                  Create Household
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Household Header */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{currentHousehold.name}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {currentHousehold.type}
              </Badge>
            </div>
            <CardDescription>
              {members?.length || 0} member{members?.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {isOwner && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* Credit Pool */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Credit Pool</CardTitle>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Label htmlFor="pool-toggle" className="text-sm">Enable Pooling</Label>
                <Switch
                  id="pool-toggle"
                  checked={currentHousehold.credit_pool_enabled}
                  onCheckedChange={(checked) => toggleCreditPoolMutation.mutate(checked)}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentHousehold.credit_pool_enabled ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-3xl font-bold">
                <CreditCard className="h-8 w-8 text-primary" />
                {currentHousehold.total_pool_credits}
              </div>
              <span className="text-muted-foreground">shared credits available</span>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Credit pooling is disabled. Each member uses their own credits.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Members</CardTitle>
          </div>
          {isOwner && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your household and share membership benefits.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="family@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "member" | "dependent")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="admin">Admin (full access)</SelectItem>
                        <SelectItem value="member">Member (request services)</SelectItem>
                        <SelectItem value="dependent">Dependent (limited)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => inviteMemberMutation.mutate()}
                    disabled={!inviteEmail || inviteMemberMutation.isPending}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members?.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <RoleIcon className={`h-4 w-4 ${ROLE_COLORS[member.role]}`} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.invited_email || `Member ${member.id.slice(0, 8)}`}
                        </span>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      {member.spending_limit && (
                        <span className="text-xs text-muted-foreground">
                          Limit: ${member.spending_limit.toLocaleString()}/month
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.status === "active" ? "default" : "outline"}>
                    {member.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
