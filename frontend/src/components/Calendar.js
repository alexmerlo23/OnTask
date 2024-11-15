import React from 'react';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";

const Calendar = ({ startDate, events, onDeleteEvent, onEditEvent }) => {

  const formattedEvents = events.map(event => ({
    id: event.id,
    text: event.text,
    start: new Date(event.start).toISOString(),
    end: new Date(event.end).toISOString(),
    backColor: event.backColor,
    participants: event.participants || 0,
  }));

  const config = {
    viewType: "Week",
    durationBarVisible: false,
    startDate: startDate,
    events: formattedEvents,
    
    onBeforeEventRender: args => {
      args.data.backColor = args.data.backColor || "#ffffff"; // Fallback to white if no color
      args.data.html = `
        <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>${args.data.text}</div>
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 5px;">
            ${onEditEvent ? '<span class="edit-icon" style="cursor: pointer;">✏️</span>' : ''}
            ${onDeleteEvent ? '<span class="delete-icon" style="cursor: pointer;">🗑️</span>' : ''}
          </div>
        </div>`;
    },

    // Conditionally handle event clicks only if edit/delete is allowed
    onEventClick: args => {
      if (onDeleteEvent || onEditEvent) {
        const eventId = args.e.id();
        const target = args.originalEvent.target;

        if (onDeleteEvent && target.classList.contains("delete-icon")) {
          onDeleteEvent(eventId);
        } else if (onEditEvent && target.classList.contains("edit-icon")) {
          const event = formattedEvents.find(event => event.id === eventId);
          onEditEvent(eventId, event);
        }
      }
    }
  };

  return (
    <div>
      <DayPilotCalendar {...config} />
    </div>
  );
};

export default Calendar;
