import React, { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useEventsContext } from '../hooks/useEventsContext'; 
import { useClassContext } from '../hooks/useClassContext'
import CalendarNav from '../components/CalendarNav';
import Calendar from '../components/Calendar';

const Home = () => {
  const { user } = useAuthContext();
  const { events = [], dispatch: eventDispatch } = useEventsContext(); // Default to an empty array
  const { classroom } = useClassContext();
  const currentDate = new Date().toISOString().split('T')[0]; 
  const [startDate, setStartDate] = useState(currentDate);

  // fetch the events from the database
  const fetchEvents = useCallback(async () => {
    const response = await fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${user.token}` },
    });
    const json = await response.json();

    if (response.ok) {
      // map the events
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
      eventDispatch({ type: 'SET_EVENTS', payload: mappedEvents });
    } else {
      console.error("Error fetching events:", json);
    }
  }, [user, eventDispatch]);

  useEffect(() => {
    if (user) {
      fetchEvents();
      console.log('User in Home:', user);
    }
  }, [fetchEvents, user]);

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
    window.location.reload();
  };

  // home page
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
    </div>
  );
}

export default Home;
