import React, { useEffect, useState } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useEventsContext } from '../hooks/useEventsContext'; 
import { useClassContext } from '../hooks/useClassContext';
import CalendarNav from '../components/CalendarNav';
import Calendar from '../components/Calendar';

const Home = () => {
  const { user } = useAuthContext();
  const { events = [], fetchEvents, deleteEvent, updateEvent } = useEventsContext(); // Use the enhanced context
  const { classroom } = useClassContext();
  const currentDate = new Date().toISOString().split('T')[0]; 
  const [startDate, setStartDate] = useState(currentDate);

  useEffect(() => {
    if (user) {
      fetchEvents(); // Using the enhanced context function
      console.log('User in Home:', user);
    }
  }, [user, fetchEvents]);

  // DELETE event handler using the enhanced context
  const handleDeleteEvent = async (eventId) => {
    await deleteEvent(eventId);
  };

  // EDIT event handler using the enhanced context
  const handleEditEvent = async (eventId, updatedEvent) => {
    await updateEvent(eventId, updatedEvent);
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