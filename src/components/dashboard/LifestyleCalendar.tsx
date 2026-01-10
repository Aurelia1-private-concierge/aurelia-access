import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Plus,
  Plane,
  Anchor,
  Star,
  Bell,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_all_day: boolean;
}

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  personal: { icon: Star, color: "text-blue-500", bgColor: "bg-blue-500" },
  travel: { icon: Plane, color: "text-purple-500", bgColor: "bg-purple-500" },
  booking: { icon: Anchor, color: "text-emerald-500", bgColor: "bg-emerald-500" },
  reminder: { icon: Bell, color: "text-amber-500", bgColor: "bg-amber-500" },
  vip_access: { icon: Star, color: "text-primary", bgColor: "bg-primary" },
};

const LifestyleCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "personal",
    start_date: "",
    start_time: "",
    end_date: "",
    location: "",
    is_all_day: false,
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_date", monthStart.toISOString())
        .lte("start_date", monthEnd.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!user || !newEvent.title || !newEvent.start_date) return;

    try {
      const startDateTime = newEvent.is_all_day
        ? new Date(newEvent.start_date).toISOString()
        : new Date(`${newEvent.start_date}T${newEvent.start_time || "09:00"}`).toISOString();

      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description || null,
        event_type: newEvent.event_type,
        start_date: startDateTime,
        end_date: newEvent.end_date ? new Date(newEvent.end_date).toISOString() : null,
        location: newEvent.location || null,
        is_all_day: newEvent.is_all_day,
      });

      if (error) throw error;

      toast({ title: "Event created", description: "Your event has been added to the calendar." });
      setDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "personal",
        start_date: "",
        start_time: "",
        end_date: "",
        location: "",
        is_all_day: false,
      });
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);
      if (error) throw error;
      toast({ title: "Deleted", description: "Event removed from calendar." });
      fetchEvents();
      setSelectedDate(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_date), day));
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const upcomingEvents = events.slice(0, 5);

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Lifestyle Calendar
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-serif text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-1 rounded-lg border transition-colors relative ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : isToday
                        ? "border-primary/50 bg-primary/5"
                        : "border-transparent hover:border-border/50 hover:bg-muted/20"
                    }`}
                  >
                    <span className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[event.event_type]?.bgColor || "bg-primary"}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Date Events */}
            {selectedDate && (
              <div>
                <h4 className="font-medium text-foreground mb-3">
                  {format(selectedDate, "EEEE, MMMM d")}
                </h4>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => {
                      const config = eventTypeConfig[event.event_type] || eventTypeConfig.personal;
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 rounded-lg border border-border/30 bg-muted/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                          {!event.is_all_day && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.start_date), "h:mm a")}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Upcoming Events</h4>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const config = eventTypeConfig[event.event_type] || eventTypeConfig.personal;
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={newEvent.event_type}
                onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="vip_access">VIP Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  className="mt-1"
                  disabled={newEvent.is_all_day}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location (optional)</label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Add location..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Add details..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LifestyleCalendar;
