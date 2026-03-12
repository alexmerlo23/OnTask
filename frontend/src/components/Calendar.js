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
        <EventStatsModal
          event={selectedEvent}
          user={user}
          onClose={closeModal}
          onEdit={event => { setIsModalOpen(false); openEditModal(event); }}
          onDelete={event => { setIsModalOpen(false); onDeleteEvent && onDeleteEvent(event.id); }}
          onVerify={async (parentCode) => {
            setIsVerifying(true);
            setVerifyError("");
            try {
              const res = await fetch(`${API_URL}/api/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ eventId: selectedEvent.id, classCode: selectedEvent.classroom, parentCode })
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || 'Verification failed');
              setCompletedEventIds(prev => new Set([...prev, selectedEvent.id]));
            } finally {
              setIsVerifying(false);
            }
          }}
          isVerified={user && user.role === 'student' && completedEventIds.has(selectedEvent.id)}
        />
      )}

      {/* ── Edit event modal ── */}
      {isEditModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create" onSubmit={handleSubmit}>
              <h3>{selectedEvent ? 'Edit Event' : 'Add Event'}</h3>
              <label>Event Title:</label>
              <input type="text" onChange={e => setText(e.target.value)} value={text} required />
              <label>Event Type:</label>
              <div className="event-types">
                {typeOptions.map(opt => (
                  <button key={opt} type="button" className={`event-type-button${type === opt ? ' selected' : ''}`} onClick={() => setType(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
              <label>Event Color:</label>
              <div className="color-picker">
                {colorOptions.map(opt => (
                  <div key={opt} className={`color-circle${color === opt ? ' selected' : ''}`} style={{ backgroundColor: opt }} onClick={() => setColor(opt)} />
                ))}
              </div>
              <label>Date:</label>
              <input type="date" onChange={e => setDate(e.target.value)} value={date} required />
              <label>Start Time:</label>
              <input type="time" onChange={e => setStartTime(e.target.value)} value={startTime} required />
              <label>End Time:</label>
              <input type="time" onChange={e => setEndTime(e.target.value)} value={endTime} required />
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

// EventStatsModal component for event completion stats
const EventStatsModal = ({ event, user, onClose, onEdit, onDelete, onVerify, isVerified }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [parentCodeInput, setParentCodeInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/completions/class-stats/${event.classroom}`,
          { headers: { Authorization: `Bearer ${user.token}` } });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load stats");
        // Find this event's stats
        const ev = (json.eventStats || []).find(e => e.eventId === event.id);
        setStats(ev ? { ...ev, totalStudents: ev.totalStudents } : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [event, user]);

  // Completion bar effect
  const CompletionBar = ({ completed, total }) => {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return (
      <div style={{ margin: '10px 0 6px 0' }}>
        <div style={{
          background: '#eee',
          borderRadius: '8px',
          height: '18px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: pct === 100 ? 'var(--primary)' : 'linear-gradient(90deg, #1aac83 60%, #e7e7e7 100%)',
            borderRadius: '8px',
            transition: 'width 0.5s cubic-bezier(.4,2,.6,1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: pct > 10 ? 'flex-end' : 'flex-start',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95em',
            paddingRight: pct > 10 ? 10 : 0
          }}>
            {pct > 10 && `${pct}%`}
          </div>
        </div>
        <div style={{ fontSize: '0.92em', color: '#555', marginTop: 2, textAlign: 'right' }}>
          {completed} of {total} students completed
        </div>
      </div>
    );
  };

  // Student/parent verify handler
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError("");
    try {
      await onVerify(parentCodeInput);
      setShowVerify(false);
      setParentCodeInput("");
    } catch (err) {
      setVerifyError(err.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="emodal-overlay">
      <div className="emodal-content" style={{ maxWidth: 420, minWidth: 320, padding: 28 }}>
        <h1 className="emodal-title" style={{ fontSize: '1.4em', marginBottom: 18 }}>Event Details</h1>
        <div className="emodal-section" style={{ marginBottom: 10 }}>
          <span className="emodal-label" style={{ fontWeight: 600}}>Title:</span>
          <span className="emodal-info" style={{ marginLeft: 8 }}>{event.text}</span>
        </div>
        <div className="emodal-section" style={{ marginBottom: 10 }}>
          <span className="emodal-label" style={{ fontWeight: 600 }}>Type:</span>
          <span className="emodal-info" style={{ marginLeft: 8 }}>{event.type}</span>
        </div>
        <div className="emodal-section" style={{ marginBottom: 10 }}>
          <span className="emodal-label" style={{ fontWeight: 600 }}>Classroom:</span>
          <span className="emodal-info" style={{ marginLeft: 8 }}>{event.classroom}</span>
        </div>
        <div className="emodal-section" style={{ marginBottom: 10 }}>
          <span className="emodal-label" style={{ fontWeight: 600 }}>Date/Time:</span>
          <span className="emodal-info" style={{ marginLeft: 8 }}>
            {new Date(event.start).toLocaleString()}<br/>
            <span style={{ color: '#888', fontSize: '0.97em' }}>to</span> {new Date(event.end).toLocaleString()}
          </span>
        </div>
        {/* Completion stats */}
        <div className="emodal-section" style={{ marginTop: 18 }}>
          <span className="emodal-label" style={{ fontWeight: 600 }}>Completion:</span>
          {loading && <p style={{ margin: '10px 0' }}>Loading…</p>}
          {error && <p style={{ color: 'var(--error)', margin: '10px 0' }}>{error}</p>}
          {stats && (
            <CompletionBar completed={stats.completedCount} total={stats.totalStudents} />
          )}
          {!loading && !error && !stats && (
            <p className="emodal-info">No completion data for this event.</p>)}
        </div>
        {/* Bottom row for actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {user && user.role === 'teacher' && (
              <>
                <button onClick={() => onEdit(event)} style={{ background: '#1aac83', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onDelete(event)} style={{ background: '#e7195a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}>Delete</button>
              </>
            )}
            {user && user.role === 'student' && !isVerified && (
              <>
                {showVerify ? (
                  <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <input
                      type="password"
                      value={parentCodeInput}
                      onChange={e => setParentCodeInput(e.target.value)}
                      placeholder="Enter parent code"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                      required
                    />
                    <button type="submit" disabled={isVerifying} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}>
                      {isVerifying ? 'Verifying…' : 'Verify'}
                    </button>
                    {verifyError && <div style={{ color: 'var(--error)', fontSize: '0.95em' }}>{verifyError}</div>}
                  </form>
                ) : (
                  <button onClick={() => setShowVerify(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}>Enter Parent Code</button>
                )}
              </>
            )}
          </div>
          <button type="button" onClick={onClose} className="close-modal" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 600, fontSize: '1em', cursor: 'pointer', marginLeft: 'auto' }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;