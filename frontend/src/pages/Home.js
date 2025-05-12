import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const renderCountRef = useRef(0);
  
  // For debugging - track renders
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`Home component rendered ${renderCountRef.current} times`);
    
    // Debug dependencies
    console.log('fetchEvents reference:', fetchEvents);
    console.log('user reference:', user);
  }, [fetchEvents, user]);

  // Only fetch events once when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('FETCHING EVENTS - this should only happen once per user change');
      fetchEvents();
      console.log('User in Home:', user);
    }
  }, [user, fetchEvents]);

  // DELETE event handler using useCallback with stable reference
  const handleDeleteEvent = useCallback(async (eventId) => {
    await deleteEvent(eventId);
  }, [deleteEvent]);

  // EDIT event handler using useCallback with stable reference
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