import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Brain, ArrowLeft, Plus, Calendar, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PrescienceDashboard } from '@/components/prescience/PrescienceDashboard';

export default function Prescience() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [dateForm, setDateForm] = useState({
    title: '',
    date_type: 'anniversary',
    date_value: '',
    associated_person: 'self',
    reminder_days: 14,
  });

  const handleAddDate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('member_important_dates')
        .insert({
          user_id: user.id,
          ...dateForm,
          recurring: ['birthday', 'anniversary'].includes(dateForm.date_type),
        });

      if (error) throw error;

      toast({
        title: "Date Added",
        description: "Prescience will now anticipate opportunities around this date.",
      });
      
      setIsAddingDate(false);
      setDateForm({
        title: '',
        date_type: 'anniversary',
        date_value: '',
        associated_person: 'self',
        reminder_days: 14,
      });
    } catch (error) {
      console.error('Failed to add date:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add date. Please try again.",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-gold animate-pulse" />
          <span className="text-lg">Loading Prescience...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <Brain className="w-12 h-12 text-gold" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Aurelia Prescience</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to access your personalized predictive lifestyle intelligence.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gold hover:bg-gold/90 text-black"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Prescience | Aurelia Private Concierge</title>
        <meta name="description" content="Predictive lifestyle intelligence that anticipates your desires before you know them." />
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
                <div className="p-2 rounded-xl bg-gradient-to-br from-gold/20 to-purple-500/20 border border-gold/30">
                  <Brain className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h1 className="font-semibold">Prescience</h1>
                  <p className="text-xs text-muted-foreground">Predictive Intelligence</p>
                </div>
              </div>
            </div>

            <Dialog open={isAddingDate} onOpenChange={setIsAddingDate}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gold/30 hover:bg-gold/10 gap-2">
                  <Calendar className="w-4 h-4" />
                  Add Important Date
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold" />
                    Add Important Date
                  </DialogTitle>
                  <DialogDescription>
                    Help Prescience anticipate perfect opportunities around your special dates.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g., Wedding Anniversary, Partner's Birthday"
                      value={dateForm.title}
                      onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date Type</Label>
                      <Select
                        value={dateForm.date_type}
                        onValueChange={(v) => setDateForm({ ...dateForm, date_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anniversary">Anniversary</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>For</Label>
                      <Select
                        value={dateForm.associated_person}
                        onValueChange={(v) => setDateForm({ ...dateForm, associated_person: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="spouse">Spouse/Partner</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={dateForm.date_value}
                      onChange={(e) => setDateForm({ ...dateForm, date_value: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Remind me</Label>
                    <Select
                      value={String(dateForm.reminder_days)}
                      onValueChange={(v) => setDateForm({ ...dateForm, reminder_days: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 week before</SelectItem>
                        <SelectItem value="14">2 weeks before</SelectItem>
                        <SelectItem value="30">1 month before</SelectItem>
                        <SelectItem value="60">2 months before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddingDate(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddDate}
                    disabled={!dateForm.title || !dateForm.date_value}
                    className="bg-gold hover:bg-gold/90 text-black gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Date
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PrescienceDashboard />
          </motion.div>
        </main>
      </div>
    </>
  );
}
