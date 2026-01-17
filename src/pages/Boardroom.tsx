import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Copy,
  Check,
  Play,
  X,
  Settings,
  Shield,
  Crown,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, addHours, isBefore, isAfter, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardroom, BoardroomSession, CreateSessionInput } from "@/hooks/useBoardroom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Boardroom: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    upcomingSessions,
    activeSessions,
    pastSessions,
    isLoading,
    createSession,
    cancelSession,
    startSession,
  } = useBoardroom();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSessionInput>({
    title: "",
    description: "",
    scheduled_at: addHours(new Date(), 1),
    duration_minutes: 60,
    max_participants: 10,
    is_waiting_room_enabled: true,
    is_recording_enabled: false,
    participant_emails: [],
  });
  const [emailInput, setEmailInput] = useState("");

  const handleCreateSession = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    setIsCreating(true);
    const session = await createSession(formData);
    setIsCreating(false);

    if (session) {
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        scheduled_at: addHours(new Date(), 1),
        duration_minutes: 60,
        max_participants: 10,
        is_waiting_room_enabled: true,
        is_recording_enabled: false,
        participant_emails: [],
      });
    }
  };

  const handleAddEmail = () => {
    if (emailInput && !formData.participant_emails?.includes(emailInput)) {
      setFormData((prev) => ({
        ...prev,
        participant_emails: [...(prev.participant_emails || []), emailInput],
      }));
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      participant_emails: prev.participant_emails?.filter((e) => e !== email) || [],
    }));
  };

  const copyRoomLink = (roomCode: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/boardroom/${roomCode}`);
    setCopiedId(roomCode);
    toast.success("Room link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinSession = async (session: BoardroomSession) => {
    if (session.status === "scheduled" && session.host_id === user?.id) {
      // Host starting the session
      const canStart = isAfter(new Date(), addMinutes(new Date(session.scheduled_at), -15));
      if (!canStart) {
        toast.info("You can start the session 15 minutes before the scheduled time");
        return;
      }
      await startSession(session.id);
    }
    navigate(`/boardroom/${session.room_code}`);
  };

  const getStatusBadge = (session: BoardroomSession) => {
    const now = new Date();
    const scheduledAt = new Date(session.scheduled_at);
    const endTime = addMinutes(scheduledAt, session.duration_minutes);

    if (session.status === "active") {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Live</Badge>;
    }
    if (session.status === "cancelled") {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (session.status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (isBefore(now, scheduledAt)) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Upcoming</Badge>;
    }
    return <Badge variant="secondary">Scheduled</Badge>;
  };

  if (!user) {
    return (
      <>
        <SEOHead title="Boardroom | Aurelia" description="Private video conferencing for executives" />
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Executive Boardroom</h1>
            <p className="text-muted-foreground mb-8">Sign in to access private video conferencing with your advisors and team.</p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign In to Continue
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Boardroom | Aurelia" description="Private video conferencing for executives" />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-serif text-xl">Boardroom</h1>
                  <p className="text-xs text-muted-foreground">Executive Video Conferencing</p>
                </div>
              </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule Boardroom Meeting</DialogTitle>
                  <DialogDescription>Create a private video conference for your team or advisors.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      placeholder="Q4 Strategy Review"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Meeting agenda and notes..."
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date & Time</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={format(formData.scheduled_at, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scheduled_at: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min={15}
                        max={480}
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            duration_minutes: parseInt(e.target.value) || 60,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Invite Participants</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="email@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      />
                      <Button type="button" variant="outline" onClick={handleAddEmail}>
                        Add
                      </Button>
                    </div>
                    {formData.participant_emails && formData.participant_emails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.participant_emails.map((email) => (
                          <Badge key={email} variant="secondary" className="gap-1">
                            {email}
                            <button onClick={() => handleRemoveEmail(email)} className="ml-1 hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Waiting Room</Label>
                        <p className="text-xs text-muted-foreground">Approve participants before they join</p>
                      </div>
                      <Switch
                        checked={formData.is_waiting_room_enabled}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, is_waiting_room_enabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Meeting"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Active Sessions Banner */}
          <AnimatePresence>
            {activeSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Video className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-emerald-400">Active Meeting</h3>
                          <p className="text-sm text-muted-foreground">{activeSessions[0].title}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleJoinSession(activeSessions[0])} className="bg-emerald-500 hover:bg-emerald-600">
                        <Play className="w-4 h-4 mr-2" />
                        Join Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2">
                <Clock className="w-4 h-4" />
                Past ({pastSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingSessions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Upcoming Meetings</h3>
                    <p className="text-sm text-muted-foreground mb-6">Schedule a boardroom meeting to get started.</p>
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isHost={session.host_id === user?.id}
                      onJoin={() => handleJoinSession(session)}
                      onCancel={() => cancelSession(session.id)}
                      onCopyLink={() => copyRoomLink(session.room_code)}
                      isCopied={copiedId === session.room_code}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastSessions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Past Meetings</h3>
                    <p className="text-sm text-muted-foreground">Completed meetings will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pastSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isHost={session.host_id === user?.id}
                      isPast
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

// Session Card Component
interface SessionCardProps {
  session: BoardroomSession;
  isHost: boolean;
  isPast?: boolean;
  onJoin?: () => void;
  onCancel?: () => void;
  onCopyLink?: () => void;
  isCopied?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isHost,
  isPast = false,
  onJoin,
  onCancel,
  onCopyLink,
  isCopied = false,
}) => {
  const scheduledAt = new Date(session.scheduled_at);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("transition-colors", !isPast && "hover:border-primary/30")}>
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center",
                  isPast ? "bg-muted" : "bg-primary/10"
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">{format(scheduledAt, "MMM")}</span>
                <span className={cn("text-lg font-bold", isPast ? "text-muted-foreground" : "text-primary")}>
                  {format(scheduledAt, "d")}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-semibold", isPast && "text-muted-foreground")}>{session.title}</h3>
                  {session.status === "active" && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">Live</Badge>
                  )}
                  {session.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                  {isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(scheduledAt, "h:mm a")} ({session.duration_minutes}min)
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session.participant_emails?.length || 0} invited
                  </span>
                  {session.is_waiting_room_enabled && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Waiting Room
                    </span>
                  )}
                </div>
                {session.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
                )}
              </div>
            </div>

            {!isPast && (
              <div className="flex items-center gap-2">
                {onCopyLink && (
                  <Button variant="ghost" size="icon" onClick={onCopyLink}>
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
                {isHost && onCancel && session.status !== "cancelled" && (
                  <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {onJoin && session.status !== "cancelled" && (
                  <Button onClick={onJoin} className={session.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                    {session.status === "active" ? "Join" : isHost ? "Start" : "Join"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Boardroom;
