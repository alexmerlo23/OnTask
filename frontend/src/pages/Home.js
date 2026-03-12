import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";
import { useEventsContext } from '../hooks/useEventsContext';
import { useClassContext } from '../hooks/useClassContext';
import CalendarNav from '../components/CalendarNav';
import Calendar from '../components/Calendar';
import './Home.css';

// ─── Upcoming Events sidebar (students only) ──────────────────────────────────

const typeColors = {
  Homework: '#1aac83',
  Test:     '#e7195a',
  Document: '#1a6eac',
  Other:    '#888',
};

const UpcomingEvents = ({ events }) => {
  const now = new Date();

  const upcoming = [...events]
    .filter(e => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <aside className="upcoming">
      <h2 className="upcoming__title">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="upcoming__empty">No upcoming events.</p>
      ) : (
        <ul className="upcoming__list">
          {upcoming.map(event => (
            <li key={event._id || event.id} className="upcoming__item">
              <div
                className="upcoming__accent"
                style={{ backgroundColor: event.color || event.backColor || '#888' }}
              />
              <div className="upcoming__body">
                <span className="upcoming__name">{event.text}</span>
                <span className="upcoming__date">{formatDate(event.start)}</span>
                <span className="upcoming__time">
                  {formatTime(event.start)} – {formatTime(event.end)}
                </span>
                <span
                  className="upcoming__type"
                  style={{ color: typeColors[event.type] || typeColors.Other }}
                >
                  {event.type}
                </span>
                {event.classroom && (
                  <span className="upcoming__class">📚 {event.classroom}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

// ─── Home page ────────────────────────────────────────────────────────────────

const Home = () => {
  const { user } = useAuthContext();
  const { events = [], fetchEvents, deleteEvent, updateEvent } = useEventsContext();
  const { classroom } = useClassContext();
  const currentDate = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(currentDate);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (user) fetchEvents();
    } else if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  const handleDeleteEvent = useCallback(async (eventId) => {
    await deleteEvent(eventId);
  }, [deleteEvent]);

  const handleEditEvent = useCallback(async (eventId, updatedEvent) => {
    await updateEvent(eventId, updatedEvent);
    window.location.reload();
  }, [updateEvent]);


  return (
    <div className="home">
      {/* Home.js */}
      <div className="navigator-wrap">
        <CalendarNav setStartDate={setStartDate} />
      </div>
      <div className="calendar">
        <Calendar
          startDate={startDate}
          events={events}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
        />
      </div>
      <UpcomingEvents events={events} />
    </div>
  );
};

export default Home;