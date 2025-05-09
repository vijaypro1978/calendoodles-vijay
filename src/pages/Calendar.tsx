import { useState, useEffect } from "react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import CreateEventModal from "@/components/calendar/CreateEventModal";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateInput, parseFormattedDate } from "@/utils/DateFormatter";

// Mock events data
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Strategy Meeting",
    date: "2025-04-08",  // Today
    time: "10:00",
    duration: 60,
    status: "confirmed",
    color: "#3498db",
    location: "Conference Room A",
    attendees: 4,
    notes: "Quarterly strategy planning session with the executive team."
  },
  {
    id: "2",
    title: "Doctor Appointment",
    date: "2025-04-08", // Today
    time: "14:00",
    duration: 30,
    status: "confirmed",
    color: "#e74c3c",
    location: "Medical Center",
    attendees: 1
  },
  {
    id: "3",
    title: "Team Lunch",
    date: "2025-04-09", // Tomorrow
    time: "12:00",
    duration: 90,
    status: "pending",
    color: "#2ecc71",
    location: "Downtown Bistro",
    attendees: 6,
    notes: "Monthly team lunch to discuss progress and celebrate achievements."
  },
  {
    id: "4",
    title: "Project Review",
    date: "2025-04-10",
    time: "15:00",
    duration: 45,
    status: "confirmed",
    color: "#9b59b6",
    location: "Online Meeting"
  },
  {
    id: "5",
    title: "Client Call",
    date: "2025-04-11",
    time: "11:00",
    duration: 30,
    status: "cancelled",
    color: "#f39c12",
    location: "Phone Conference"
  },
];

const Calendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isQuickEventModalOpen, setIsQuickEventModalOpen] = useState(false);
  const [isJumpToDateOpen, setIsJumpToDateOpen] = useState(false);
  const [jumpToDate, setJumpToDate] = useState<Date>(new Date());
  const [jumpToDateInput, setJumpToDateInput] = useState<string>("");
  const [quickEvent, setQuickEvent] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailModalOpen(true);
  };

  const handleCreateEvent = (newEvent: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent, id: String(Date.now()) }]);
    setIsCreateEventModalOpen(false);
    toast({
      title: "Event created",
      description: "Your event has been successfully created.",
    });
  };
  
  const handleQuickEventCreate = () => {
    if (quickEvent.title.trim()) {
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        title: quickEvent.title,
        date: quickEvent.date,
        time: "09:00",
        duration: 60,
        status: "confirmed",
        color: "#3498db"
      };
      setEvents(prev => [...prev, newEvent]);
      setIsQuickEventModalOpen(false);
      setQuickEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd') });
      toast({
        title: "Event created",
        description: "Your quick event has been successfully created.",
      });
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    setSelectedTimeSlot(date);
    setIsCreateEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
    setIsEventDetailModalOpen(false);
    toast({
      title: "Event deleted",
      description: "Your event has been successfully deleted.",
    });
  };

  const handleEditEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setIsEventDetailModalOpen(false);
    toast({
      title: "Event updated",
      description: "Your event has been successfully updated.",
    });
  };

  const handleEventDrop = (eventId: string, newDate: Date, newTime: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === eventId) {
          const updatedEvent = {
            ...event,
            date: format(newDate, "yyyy-MM-dd"),
            time: newTime
          };
          
          toast({
            title: "Event moved",
            description: `${event.title} moved to ${format(newDate, "MMM d")} at ${newTime}`,
          });
          
          return updatedEvent;
        }
        return event;
      })
    );
  };

  const handleJumpToDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateInput(e.target.value);
    setJumpToDateInput(formattedValue);
  };

  const handleJumpToDate = () => {
    const parsedDate = parseFormattedDate(jumpToDateInput);
    
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      setCurrentDate(parsedDate);
      setJumpToDate(parsedDate);
      setIsJumpToDateOpen(false);
      toast({
        title: "Date changed",
        description: `Calendar view changed to ${format(parsedDate, "MMMM d, yyyy")}`,
      });
    } else {
      toast({
        title: "Invalid date format",
        description: "Please enter date in DD-MM-YYYY format",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Calendar</h1>
        <div className="flex gap-2">
          <Popover open={isJumpToDateOpen} onOpenChange={setIsJumpToDateOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="border-calendoodle-blue/50 text-calendoodle-blue hover:bg-calendoodle-blue/10 dark:border-calendoodle-blue/30 dark:hover:bg-calendoodle-blue/20"
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Jump to Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jump-date">Enter Date (DD-MM-YYYY)</Label>
                  <Input 
                    id="jump-date" 
                    placeholder="DD-MM-YYYY" 
                    value={jumpToDateInput}
                    onChange={handleJumpToDateInputChange}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsJumpToDateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleJumpToDate}>Jump to Date</Button>
                </div>
                <div className="pt-2 pb-1">
                  <Label className="text-sm text-muted-foreground">Or select a date:</Label>
                </div>
                <CalendarPicker
                  mode="single"
                  selected={jumpToDate}
                  onSelect={(date) => {
                    if (date) {
                      setJumpToDate(date);
                      setCurrentDate(date);
                      setIsJumpToDateOpen(false);
                      toast({
                        title: "Date changed",
                        description: `Calendar view changed to ${format(date, "MMMM d, yyyy")}`,
                      });
                    }
                  }}
                  className="p-0 pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={() => setIsQuickEventModalOpen(true)}
            variant="outline"
            className="border-calendoodle-purple/50 text-calendoodle-purple hover:bg-calendoodle-purple/10 dark:border-calendoodle-purple/30 dark:hover:bg-calendoodle-purple/20"
          >
            Quick Add
          </Button>
          <Button 
            onClick={() => {
              setSelectedTimeSlot(new Date());
              setIsCreateEventModalOpen(true);
            }}
            className="calendoodle-btn calendoodle-btn-primary"
          >
            <Plus className="h-4 w-4 mr-1" /> New Event
          </Button>
        </div>
      </div>

      <div>
        <CalendarHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />

        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
          />
        )}

        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
          />
        )}

        {view === "day" && (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          isOpen={isEventDetailModalOpen}
          onClose={() => setIsEventDetailModalOpen(false)}
          event={selectedEvent}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
        />
      )}

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        initialDate={selectedTimeSlot}
        onCreate={handleCreateEvent}
      />
      
      <Dialog open={isQuickEventModalOpen} onOpenChange={setIsQuickEventModalOpen}>
        <DialogContent className="sm:max-w-[425px] my-8">
          <DialogHeader>
            <DialogTitle>Quick Add Event</DialogTitle>
            <DialogDescription>
              Quickly add a new event to your calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={quickEvent.title}
                onChange={(e) => setQuickEvent({ ...quickEvent, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={quickEvent.date}
                onChange={(e) => setQuickEvent({ ...quickEvent, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuickEventModalOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickEventCreate}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
