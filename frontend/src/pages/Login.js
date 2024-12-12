import React, { useState, Suspense, lazy } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

// Lazy load the DayPilotCalendar
const DayPilotCalendar = lazy(() => import('@daypilot/daypilot-lite-react').then(module => ({ default: module.DayPilotCalendar })));

  // handles login button
  const handleSubmit = async (e) => {
    e.preventDefault()

    await login(email, password)
    window.location.reload();
  }

  // login screen

  return (
    <div>
      {/* Suspense component to display loading indicator while calendar is being loaded */}
      <Suspense fallback={<div>Loading calendar...</div>}>
        <DayPilotCalendar {...config} />
      </Suspense>

      {isModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1>Event Info</h1>
            <h3>Event Title:</h3>
            <p>{selectedEvent.text}</p>

            <h3>Event Type:</h3>
            <p>{selectedEvent.type}</p>

            <h3>Event Color:</h3>
            <p>{selectedEvent.backColor}</p>

            <h3>Date/Time:</h3>
            <p>Start: {new Date(selectedEvent.start).toLocaleString()}</p>
            <p>End: {new Date(selectedEvent.end).toLocaleString()}</p>

            <button type="button" onClick={closeModal} className="close-modal">
              Close
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="edit-event" onSubmit={handleSubmit}>
              <h3>Edit Event</h3>

              <label>Event Title:</label>
              <input
                type="text"
                onChange={(e) => setText(e.target.value)}
                value={text}
                className={emptyFields.includes('text') ? 'error' : ''}
              />

              <label>Event Type:</label>
              <div className="event-types">
                {typeOptions.map(typeOption => (
                  <button
                    key={typeOption}
                    type="button"
                    className="event-type-button"
                    onClick={() => setType(typeOption)}
                    style={{
                      background: type === typeOption ? 'var(--primary)' : '#fff',
                      color: type === typeOption ? '#fff' : 'var(--primary)',
                      border: '2px solid var(--primary)',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontFamily: 'Poppins',
                      cursor: 'pointer',
                      fontSize: '1em',
                      margin: '2px',
                      position: 'relative'
                    }}
                  >
                    {typeOption}
                  </button>
                ))}
              </div>

              <label>Event Color:</label>
              <div className="color-picker">
                {colorOptions.map(colorOption => (
                  <div
                    key={colorOption}
                    className={`color-circle ${color === colorOption ? 'selected' : ''}`}
                    style={{ backgroundColor: colorOption }}
                    onClick={() => setColor(colorOption)}
                  />
                ))}
              </div>

              <label>Date:</label>
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                className={emptyFields.includes('date') ? 'error' : ''}
              />

              <label>Start Time:</label>
              <input
                type="time"
                onChange={(e) => setStartTime(e.target.value)}
                value={startTime}
                className={emptyFields.includes('startTime') ? 'error' : ''}
              />

              <label>End Time:</label>
              <input
                type="time"
                onChange={(e) => setEndTime(e.target.value)}
                value={endTime}
                className={emptyFields.includes('endTime') ? 'error' : ''}
              />

              <label>Classroom:</label>
              <input
                type="text"
                onChange={(e) => setClassroom(e.target.value)}
                value={classroom}
                className={emptyFields.includes('classroom') ? 'error' : ''}
              />

              <button type="submit">Save</button>
            </form>
            <button type="button" onClick={closeEditModal} className="close-modal">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
