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
  const isInitialMount = useRef(true);
  
  // Fetch events only once when component mounts or when user changes
  useEffect(() => {
    // Skip the first render's console log to avoid duplicate messages
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      if (user) {
        console.log('Initial fetch of events');
        fetchEvents();
      }
    } else if (user) {
      // This will only run when user changes after initial mount
      console.log('User changed, fetching events again');
      fetchEvents();
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