import React, { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useEventsContext } from '../hooks/useEventsContext'; 
import { useClassContext } from '../hooks/useClassContext';
import CalendarNav from '../components/CalendarNav';
import Calendar from '../components/Calendar';

const Home = () => {
  const { user } = useAuthContext();
  const { events = [], fetchEvents, deleteEvent, updateEvent } = useEventsContext();
  const { classroom } = useClassContext();
  const currentDate = new Date().toISOString().split('T')[0]; 
  const [startDate, setStartDate] = useState(currentDate);

  // Memoize fetchEvents call with useCallback
  const handleFetchEvents = useCallback(() => {
    if (user) {
      fetchEvents();
      console.log('User in Home:', user);
    }
  }, [user, fetchEvents]);
  
  useEffect(() => {
    handleFetchEvents();
  }, [handleFetchEvents]);

  // DELETE event handler using useCallback
  const handleDeleteEvent = useCallback(async (eventId) => {
    await deleteEvent(eventId);
  }, [deleteEvent]);

  // EDIT event handler using useCallback
  const handleEditEvent = useCallback(async (eventId, updatedEvent) => {
    await updateEvent(eventId, updatedEvent);
    window.location.reload();
  }, [updateEvent]);

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