import { React, useState, useEffect, useCallback } from 'react';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { useAuthContext } from '../hooks/useAuthContext';
import API_URL from '../config/api';
import './Calendar.css';

const Calendar = ({ startDate, events = [], onDeleteEvent, onEditEvent }) => {
  const { user } = useAuthContext();

  const [isModalOpen,                    setIsModalOpen]                    = useState(false);
  const [isParentVerificationModalOpen,  setIsParentVerificationModalOpen]  = useState(false);
  const [selectedEvent,                  setSelectedEvent]                  = useState(null);
  const [pendingCompletionEventId,       setPendingCompletionEventId]       = useState(null);
  const [completedEventIds,              setCompletedEventIds]              = useState(new Set());
  const [enteredCode,                    setEnteredCode]                    = useState('');
  const [verifyError,                    setVerifyError]                    = useState('');
  const [isVerifying,                    setIsVerifying]                    = useState(false);
  const [calendarError,                  setCalendarError]                  = useState(null);
  const [isEditModalOpen,                setIsEditModalOpen]                = useState(false);

  // form state for edit modal
  const [text,       setText]       = useState('');
  const [date,       setDate]       = useState('');
  const [startTime,  setStartTime]  = useState('');
  const [endTime,    setEndTime]    = useState('');
  const [color,      setColor]      = useState('');
  const [type,       setType]       = useState('');
  const [classroom,  setClassroom]  = useState('');
  const [editError,  setEditError]  = useState(null);
  const [emptyFields,setEmptyFields]= useState([]);

  const typeOptions  = ['Homework', 'Test', 'Document', 'Other'];
  const colorOptions = [
    'Black', 'Grey', 'Red', 'OrangeRed', 'MediumVioletRed',
    'Purple', 'BlueViolet', 'RoyalBlue', 'DarkBlue', 'ForestGreen'
  ];

  // ── Load already-completed event IDs for this student ──────────────────────
  useEffect(() => {
    if (!user || user.role !== 'student') return;
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/completions/my-events`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) return;
        const ids  = await res.json(); // string[]
        setCompletedEventIds(new Set(ids));
      } catch (err) {
        console.error('Could not load completions:', err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(events)) {
      setCalendarError("Error loading events");
    } else {
      setCalendarError(null);
    }
  }, [events]);

  const openModal     = (event) => { setSelectedEvent(event); setIsModalOpen(true); };
  const closeModal    = ()      => setIsModalOpen(false);
  const openEditModal = (event) => { setSelectedEvent(event); setIsEditModalOpen(true); };
  const closeEditModal= ()      => setIsEditModalOpen(false);
  const closeParentVerificationModal = () => {
    setIsParentVerificationModalOpen(false);
    setEnteredCode('');
    setVerifyError('');
    setPendingCompletionEventId(null);
  };

  function separateDateTime(dateTime) {
    try {
      const [date, time] = dateTime.split('T');
      return { date, time };
    } catch {
      return { date: '', time: '' };
    }
  }

  const formattedEvents = Array.isArray(events) ? events.map(event => {
    try {
      return {
        id:          event._id || event.id,
        text:        event.text || 'Untitled Event',
        start:       new Date(event.start).toISOString(),
        end:         new Date(event.end).toISOString(),
        backColor:   event.backColor || event.color || 'Grey',
        type:        event.type || 'Other',
        classroom:   event.classroom || 'default'
      };
    } catch {
      return null;
    }
  }).filter(Boolean) : [];

  const config = {
    viewType: "Week",
    durationBarVisible: false,
    startDate,
    events: formattedEvents,

    onBeforeEventRender: args => {
      try {
        args.data.backColor = args.data.backColor || "#ffffff";

        if (user && user.role === 'student') {
          const done = completedEventIds.has(args.data.id);
          args.data.html = `
            <div style="display:flex;flex-direction:column;justify-content:space-between;height:100%">
              <div>${args.data.text}</div>
              <div class="verify-parent-code" style="cursor:${done ? 'default' : 'pointer'};color:${done ? 'green' : 'red'}">
                ${done ? '✅' : '☑️'}
              </div>
            </div>`;
        } else if (user && user.role !== 'student') {
          args.data.html = `
            <div style="display:flex;flex-direction:column;justify-content:space-between;height:100%">
              <div>${args.data.text}</div>
              <div style="display:flex;justify-content:center;gap:10px;margin-top:5px">
                ${onEditEvent   ? '<span class="edit-icon"   style="cursor:pointer">✏️</span>' : ''}
                ${onDeleteEvent ? '<span class="delete-icon" style="cursor:pointer">🗑️</span>' : ''}
              </div>
            </div>`;
        } else {
          args.data.html = `<div>${args.data.text}</div>`;
        }
      } catch (err) {
        console.error("Error rendering event:", err);
      }
    },

    onEventClick: args => {
      try {
        const target  = args.originalEvent.target;
        const eventId = args.e.id();

        if (user?.role === 'student') {
          if (target.classList.contains('verify-parent-code') && !completedEventIds.has(eventId)) {
            const event = formattedEvents.find(e => e.id === eventId);
            setPendingCompletionEventId(eventId);
            // Store classCode on the pending event so the controller can receive it
            setPendingCompletionEventId({ id: eventId, classCode: event?.classroom });
            setIsParentVerificationModalOpen(true);
            return;
          }
          // Click anywhere else → show info modal
          const event = formattedEvents.find(e => e.id === eventId);
          if (event) openModal(event);
          return;
        }

        if (onDeleteEvent && target.classList.contains("delete-icon")) {
          onDeleteEvent(eventId);
        } else if (onEditEvent && target.classList.contains("edit-icon")) {
          const event = formattedEvents.find(e => e.id === eventId);
          if (!event) return;
          const { date: d, time: st } = separateDateTime(event.start.toString());
          const { time: et }          = separateDateTime(event.end.toString());
          setText(event.text); setType(event.type); setColor(event.backColor);
          setDate(d); setStartTime(st); setEndTime(et); setClassroom(event.classroom);
          openEditModal(event);
        } else {
          const event = formattedEvents.find(e => e.id === eventId);
          if (event) openModal(event);
        }
      } catch (err) {
        console.error("Error handling event click:", err);
      }
    }
  };

  // ── Parent code verification (now hits the API) ────────────────────────────
  const verifyParentCode = async (e) => {
    e.preventDefault();
    if (!pendingCompletionEventId) return;
    setVerifyError('');
    setIsVerifying(true);

    try {
      const res = await fetch(`${API_URL}/api/completions`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${user.token}`
        },
        body: JSON.stringify({
          eventId:    pendingCompletionEventId.id,
          classCode:  pendingCompletionEventId.classCode,
          parentCode: enteredCode
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setVerifyError(json.error || 'Verification failed');
        return;
      }

      // Mark locally so the calendar re-renders without a page reload
      setCompletedEventIds(prev => new Set([...prev, pendingCompletionEventId.id]));
      closeParentVerificationModal();
    } catch (err) {
      console.error('Verification error:', err);
      setVerifyError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !date || !startTime || !endTime || !type) {
      setEditError('Please fill in all required fields');
      return;
    }
    try {
      const start = new Date(`${date}T${startTime}Z`);
      const end   = new Date(`${date}T${endTime}Z`);
      if (isNaN(start) || isNaN(end)) { setEditError('Invalid date or time'); return; }
      onEditEvent(selectedEvent.id, { text, backColor: color || 'Grey', type, start: start.toISOString(), end: end.toISOString(), classroom });
    } catch (err) {
      setEditError('An error occurred. Please try again.');
    }
  };

  if (calendarError) return <div className="calendar-error">Error loading calendar: {calendarError}</div>;

  return (
    <div>
      <DayPilotCalendar {...config} />

      {/* ── Event info modal ── */}
      {isModalOpen && selectedEvent && (
        <div className="emodal-overlay">
          <div className="emodal-content">
            <h1 className="emodal-title">Event Info</h1>
            <div className="emodal-section">
              <h3 className="emodal-label">Event Title:</h3>
              <p className="emodal-info">{selectedEvent.text}</p>
            </div>
            <div className="emodal-section">
              <h3 className="emodal-label">Event Type:</h3>
              <p className="emodal-info">{selectedEvent.type}</p>
            </div>
            <div className="emodal-section">
              <h3 className="emodal-label">Event Color:</h3>
              <div className="emodal-color-preview" style={{ backgroundColor: selectedEvent.backColor }}/>
            </div>
            <div className="emodal-section">
              <h3 className="emodal-label">Date/Time:</h3>
              <div className="emodal-info">
                <p>Start: {new Date(selectedEvent.start).toLocaleString()}</p>
                <p>End: {new Date(selectedEvent.end).toLocaleString()}</p>
              </div>
            </div>
            <button type="button" onClick={closeModal} className="close-modal">Close</button>
          </div>
        </div>
      )}

      {/* ── Edit event modal ── */}
      {isEditModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create" onSubmit={handleSubmit}>
              <h3>Edit Event</h3>
              <label>Event Title:</label>
              <input type="text" onChange={e => setText(e.target.value)} value={text} />
              <label>Event Type:</label>
              <div className="event-types">
                {typeOptions.map(opt => (
                  <button key={opt} type="button" className="event-type-button"
                    onClick={() => setType(opt)}
                    style={{ background: type === opt ? 'var(--primary)' : '#fff', color: type === opt ? '#fff' : 'var(--primary)', border: '2px solid var(--primary)', padding: '6px 10px', borderRadius: '4px', fontFamily: 'Poppins', cursor: 'pointer', fontSize: '1em', margin: '2px' }}>
                    {opt}
                  </button>
                ))}
              </div>
              <label>Event Color:</label>
              <div className="color-picker">
                {colorOptions.map(opt => (
                  <div key={opt} className={`color-circle ${color === opt ? 'selected' : ''}`}
                    style={{ backgroundColor: opt }} onClick={() => setColor(opt)} />
                ))}
              </div>
              <label>Date:</label>
              <input type="date" onChange={e => setDate(e.target.value)} value={date} />
              <label>Start Time:</label>
              <input type="time" onChange={e => setStartTime(e.target.value)} value={startTime} />
              <label>End Time:</label>
              <input type="time" onChange={e => setEndTime(e.target.value)} value={endTime} />
              <button type="submit" className="submit">Save</button>
              {editError && <div className="error">{editError}</div>}
              <button type="button" onClick={closeEditModal} className="submit">Close</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Parent code verification modal ── */}
      {isParentVerificationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Verify Parent Code</h4>
            <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '12px' }}>
              Ask your parent or guardian to enter the code they set on your account.
            </p>
            <form onSubmit={verifyParentCode}>
              <input
                type="password"
                value={enteredCode}
                onChange={e => setEnteredCode(e.target.value)}
                placeholder="Enter parent code"
              />
              <button type="submit" className="submit" disabled={isVerifying}>
                {isVerifying ? 'Verifying…' : 'Verify'}
              </button>
              {verifyError && <p style={{ color: 'var(--error)', marginTop: '8px', fontSize: '0.9em' }}>{verifyError}</p>}
            </form>
            <button type="button" onClick={closeParentVerificationModal} className="close-modal" style={{ marginTop: '8px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;