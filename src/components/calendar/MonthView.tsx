
import { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import EventModal from "./EventModal";
import { CalendarEvent } from "@/types/calendar";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const MonthView = ({ currentDate, events, onEventClick }: MonthViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const renderEvents = (date: Date) => {
    const dayEvents = events.filter(
      (event) => isSameDay(parseISO(event.date), date)
    );

    // Limit the number of events to show
    const maxDisplayEvents = 2;
    const displayEvents = dayEvents.slice(0, maxDisplayEvents);
    const moreEventsCount = dayEvents.length - maxDisplayEvents;

    return (
      <>
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="text-xs truncate mb-1 p-1 rounded cursor-pointer transition-transform hover:translate-y-[-1px]"
            style={{ 
              backgroundColor: event.color + "33", // Adding transparency
              borderLeft: `3px solid ${event.color}`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }}></div>
              <span>{event.time} {event.title}</span>
            </div>
          </div>
        ))}
        {moreEventsCount > 0 && (
          <div 
            className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDateClick(date);
            }}
          >
            +{moreEventsCount} more
          </div>
        )}
      </>
    );
  };

  const dateRows = [];
  let day = startDate;
  let rows = [];

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const isToday = isSameDay(day, new Date());
      const isCurrentMonth = isSameMonth(day, monthStart);

      rows.push(
        <div
          key={day.toString()}
          className={`border border-gray-200 dark:border-gray-700 h-28 overflow-hidden 
                    ${!isCurrentMonth ? "bg-gray-50 dark:bg-gray-900/60" : ""} 
                    ${isToday ? "ring-2 ring-calendoodle-blue ring-inset" : ""}`}
        >
          <div
            className={`h-full p-1 cursor-pointer hover:bg-calendoodle-blue/5 dark:hover:bg-calendoodle-blue/5 flex flex-col`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div
              className={`text-right p-1 ${
                !isCurrentMonth
                  ? "text-gray-400 dark:text-gray-600"
                  : isToday
                  ? "text-calendoodle-blue font-bold"
                  : ""
              }`}
            >
              {format(day, "d")}
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 p-1">
              {renderEvents(cloneDay)}
            </div>
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    dateRows.push(
      <div key={day.toString()} className="grid grid-cols-7">
        {rows}
      </div>
    );
    rows = [];
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-slide-up">
      <div className="grid grid-cols-7 text-center font-medium text-sm py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      <div className="mt-2">{dateRows}</div>

      {selectedDate && (
        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          date={selectedDate}
          events={events.filter((event) =>
            isSameDay(parseISO(event.date), selectedDate)
          )}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
};

export default MonthView;
