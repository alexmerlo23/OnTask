import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import API_URL from '../config/api';

export const EventsContext = createContext();

export const eventsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EVENTS':
      return {
        events: action.payload
      };
    case 'CREATE_EVENT':
      return {
        events: [action.payload, ...state.events]
      };
    case 'DELETE_EVENT':
      return {
        events: state.events.filter((e) => e._id !== action.payload._id)
      };
    case 'UPDATE_EVENT':
      return {
        events: state.events.map((e) => e._id === action.payload._id ? action.payload : e)
      };
    default:
      return state;
  }
};

export const EventsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, { events: [] });
  const { user } = useAuthContext();

  // Memoize all functions with useCallback to prevent recreating them on each render
  const fetchEvents = useCallback(async () => {
    try {
      if (!user) return;
      
      const response = await fetch(`${API_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const json = await response.json();
      dispatch({ type: 'SET_EVENTS', payload: json });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [user]);

  const createEvent = useCallback(async (event) => {
    try {
      if (!user) return null;
      
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`Failed to create event: ${response.status}`);
      }
      
      const json = await response.json();
      dispatch({ type: 'CREATE_EVENT', payload: json });
      return json;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }, [user]);

  const deleteEvent = useCallback(async (id) => {
    try {
      if (!user) return null;
      
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }
      
      const json = await response.json();
      dispatch({ type: 'DELETE_EVENT', payload: json });
      return json;
    } catch (error) {
      console.error('Error deleting event:', error);
      return null;
    }
  }, [user]);

  const updateEvent = useCallback(async (id, updatedEvent) => {
    try {
      if (!user) return null;
      
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedEvent),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.status}`);
      }
      
      const json = await response.json();
      dispatch({ type: 'UPDATE_EVENT', payload: json });
      return json;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  }, [user]);

  // Memoize the context value to prevent recreating the object on each render
  const contextValue = useMemo(() => ({
    events: state.events || [],
    fetchEvents,
    createEvent,
    deleteEvent,
    updateEvent
  }), [state, fetchEvents, createEvent, deleteEvent, updateEvent]);

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
};