import React, { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useEventsContext } from '../hooks/useEventsContext'; 
import CalendarNav from '../components/CalendarNav';
import Calendar from '../components/Calendar';
import EventForm from '../components/CalendarForm';

const Home = () => {
  const { user } = useAuthContext();
  const { events, dispatch: eventDispatch } = useEventsContext();
  const currentDate = new Date().toISOString().split('T')[0]; 
  const [startDate, setStartDate] = useState(currentDate);

  // Use useCallback to memoize the fetchEvents function
  const fetchEvents = useCallback(async () => {
    const response = await fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${user.token}` },
    });
    const json = await response.json();

    if (response.ok) {
      const mappedEvents = json.map(event => ({
        id: event._id,
        text: event.text,
        start: event.start,
        end: event.end,
        backColor: event.backColor || "#ffffff",
        participants: event.participants || 0,
      }));
      eventDispatch({ type: 'SET_EVENTS', payload: mappedEvents });
    } else {
      console.error("Error fetching events:", json);
    }
  }, [user, eventDispatch]); // Dependencies for useCallback

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [fetchEvents, user]); // Fetch events when user changes

  // DELETE event handler
  const handleDeleteEvent = async (eventId) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` },
    });

    if (response.ok) {
      eventDispatch({ type: 'DELETE_EVENT', payload: eventId });
    } else {
      console.error("Failed to delete event");
    }
  };

  // EDIT event handler
  const handleEditEvent = async (eventId, updatedEvent) => {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    });

    if (response.ok) {
      const json = await response.json();
      eventDispatch({ type: 'EDIT_EVENT', payload: json });
    } else {
      console.error("Failed to edit event");
    }
  };

  return (
    <div className="home">
      <div>
        <CalendarNav setStartDate={setStartDate} />
      </div>
      <div className='calendar'>
        <Calendar 
          startDate={startDate} 
          events={events} 
          onDeleteEvent={handleDeleteEvent} 
          onEditEvent={handleEditEvent} 
        />
      </div>
      <EventForm fetchEvents={fetchEvents} />
    </div>
  );
}

export default Home;
