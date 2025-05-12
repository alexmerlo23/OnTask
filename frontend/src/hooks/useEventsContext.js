import { useContext } from 'react';
import { eventsContext } from '../context/EventContext';
import { useAuthContext } from './useAuthContext';
import API_URL from '../config/api';

export const useEventsContext = () => {
  const context = useContext(eventsContext);
  const { user } = useAuthContext();

  if (!context) {
    throw Error('useEventsContext must be used inside an EventsContextProvider');
  }

  // Add API URL to all event-related fetch operations
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      const json = await response.json();

      if (response.ok) {
        const mappedEvents = json.map(event => ({
          id: event._id,
          text: event.text,
          start: event.start,
          end: event.end,
          backColor: event.color || "#ffffff",
          participants: event.participants || 0,
          type: event.type,
          classroom: event.classroom
        }));
        context.dispatch({ type: 'SET_EVENTS', payload: mappedEvents });
        return mappedEvents;
      } else {
        console.error("Error fetching events:", json);
        return [];
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(eventData)
      });
      
      const json = await response.json();
      
      if (response.ok) {
        context.dispatch({ type: 'CREATE_EVENT', payload: json });
        return json;
      } else {
        console.error("Failed to create event:", json);
        return null;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      return null;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });

      if (response.ok) {
        context.dispatch({ type: 'DELETE_EVENT', payload: eventId });
        return true;
      } else {
        console.error("Failed to delete event");
        return false;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  };

  const updateEvent = async (eventId, updatedEvent) => {
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (response.ok) {
        const json = await response.json();
        context.dispatch({ type: 'EDIT_EVENT', payload: json });
        return json;
      } else {
        console.error("Failed to edit event");
        return null;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  };

  return { 
    ...context, 
    fetchEvents,
    createEvent,
    deleteEvent,
    updateEvent
  };
};