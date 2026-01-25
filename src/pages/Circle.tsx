import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  MessageCircle, 
  Briefcase, 
  Sparkles, 
  ArrowLeft,
  UserPlus,
  Settings,
  Bell,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCircle } from '@/hooks/useCircle';
import CircleMemberCard from '@/components/circle/CircleMemberCard';
import CircleOpportunityCard from '@/components/circle/CircleOpportunityCard';
import CircleMessenger from '@/components/circle/CircleMessenger';
import { useToast } from '@/hooks/use-toast';

const Circle = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    profile,
    members,
    connections,
    opportunities,
    introductions,
    isLoading,
    sendConnectionRequest,
    respondToConnection,
    expressInterest,
  } = useCircle();

  const [activeTab, setActiveTab] = useState('members');

  // Get connection status for a member
  const getConnectionStatus = (memberId: string) => {
    const conn = connections.find(
      c => (c.requester_id === memberId || c.recipient_id === memberId)
    );
    if (!conn) return 'none';
    if (conn.status === 'accepted') return 'connected';
    if (conn.status === 'pending') return 'pending';
    return 'none';
  };

  // Pending connection requests for current user
  const pendingRequests = connections.filter(
    c => c.recipient_id === user?.id && c.status === 'pending'
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-gold animate-pulse" />
          <span className="text-lg">Entering The Circle...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <Crown className="w-12 h-12 text-gold" />
          </div>
          <h1 className="text-2xl font-bold mb-4">The Circle</h1>
          <p className="text-muted-foreground mb-6">
            An exclusive community for UHNWI members. Sign in to access networking, 
            co-investment opportunities, and secure messaging.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gold hover:bg-gold/90 text-black"
          >
            Sign In to Join
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>The Circle | Aurelia Private Concierge</title>
        <meta name="description" content="Exclusive UHNWI community for networking, co-investment, and secure private messaging." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-gold/10 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-gold/20 to-amber-500/20 border border-gold/30">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h1 className="font-semibold">The Circle</h1>
                  <p className="text-xs text-muted-foreground">Exclusive UHNWI Community</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pendingRequests.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold/30 hover:bg-gold/10 gap-2"
                  onClick={() => setActiveTab('requests')}
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-5 h-5 rounded-full bg-gold text-black text-xs flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/profile')}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/30 border border-border/30 mb-8">
              <TabsTrigger value="members" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <Briefcase className="w-4 h-4" />
                Opportunities
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <MessageCircle className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="introductions" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <Sparkles className="w-4 h-4" />
                AI Matches
              </TabsTrigger>
              {pendingRequests.length > 0 && (
                <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <UserPlus className="w-4 h-4" />
                  Requests
                  <span className="w-5 h-5 rounded-full bg-gold text-black text-xs flex items-center justify-center ml-1">
                    {pendingRequests.length}
                  </span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Circle Members</h2>
                    <p className="text-muted-foreground">Connect with verified UHNWI members</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{members.length} members</span>
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No members yet</h3>
                    <p className="text-muted-foreground">Be the first to complete your Circle profile</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((member) => {
                      const status = getConnectionStatus(member.user_id);
                      return (
                        <CircleMemberCard
                          key={member.id}
                          member={member}
                          isConnected={status === 'connected'}
                          isPending={status === 'pending'}
                          onConnect={() => sendConnectionRequest(member.user_id)}
                          onMessage={() => {
                            setActiveTab('messages');
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Opportunities Tab */}
            <TabsContent value="opportunities">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Co-Investment Opportunities</h2>
                    <p className="text-muted-foreground">Exclusive deals and experiences shared by members</p>
                  </div>
                  <Button className="bg-gold hover:bg-gold/90 text-black gap-2">
                    <Briefcase className="w-4 h-4" />
                    Post Opportunity
                  </Button>
                </div>

                {opportunities.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                    <p className="text-muted-foreground">Be the first to share an exclusive opportunity</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                      <CircleOpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        onExpressInterest={() => {
                          expressInterest(opp.id);
                          toast({ title: 'Interest Registered', description: 'The host will be notified.' });
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CircleMessenger />
              </motion.div>
            </TabsContent>

            {/* AI Introductions Tab */}
            <TabsContent value="introductions">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">AI-Curated Introductions</h2>
                  <p className="text-muted-foreground">Members matched to your interests and profile</p>
                </div>

                {introductions.length === 0 ? (
                  <div className="text-center py-16">
                    <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Building Your Matches</h3>
                    <p className="text-muted-foreground">
                      Complete your profile to receive AI-curated introduction suggestions
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-gold/30"
                      onClick={() => navigate('/profile')}
                    >
                      Complete Profile
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {introductions.map((intro) => (
                      <div
                        key={intro.id}
                        className="p-6 bg-card/50 backdrop-blur-xl border border-gold/20 rounded-2xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {intro.match_score}% Match
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2">Suggested Connection</h3>
                        {intro.common_interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {intro.common_interests.map((interest, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-muted/50 text-xs rounded">
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                        <Button
                          className="w-full bg-gold hover:bg-gold/90 text-black"
                          onClick={() => sendConnectionRequest(intro.suggested_member_id)}
                        >
                          Send Introduction Request
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Connection Requests Tab */}
            {pendingRequests.length > 0 && (
              <TabsContent value="requests">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">Connection Requests</h2>
                    <p className="text-muted-foreground">{pendingRequests.length} pending requests</p>
                  </div>

                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-6 bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium">New Connection Request</h3>
                          {req.introduction_note && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{req.introduction_note}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => respondToConnection(req.id, false)}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gold hover:bg-gold/90 text-black"
                            onClick={() => respondToConnection(req.id, true)}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Circle;
