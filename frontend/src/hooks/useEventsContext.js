import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import { useAuthContext } from './useAuthContext';

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
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_EVENTS', payload: json });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [user?.token]);

  const createEvent = useCallback(async (event) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'CREATE_EVENT', payload: json });
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  }, [user?.token]);

  const deleteEvent = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'DELETE_EVENT', payload: json });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [user?.token]);

  const updateEvent = useCallback(async (id, updatedEvent) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedEvent),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'UPDATE_EVENT', payload: json });
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, [user?.token]);

  // Memoize the context value to prevent recreating the object on each render
  const contextValue = useMemo(() => ({
    ...state,
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