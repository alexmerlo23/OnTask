import React, { useState, Suspense, lazy } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

// Lazy load the DayPilotCalendar
const DayPilotCalendar = lazy(() => import('@daypilot/daypilot-lite-react').then(module => ({ default: module.DayPilotCalendar })));

const Calendar = ({ startDate, events, onDeleteEvent, onEditEvent }) => {
  const { user } = useAuthContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = (event) => {
    setSelectedEvent(event);  // Store the selected event
    setIsModalOpen(true);     // Open the modal
  };

  const closeModal = () => setIsModalOpen(false);  // Close the modal

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openEditModal = (event) => {
    setSelectedEvent(event);  // Store the selected event
    setIsEditModalOpen(true);     // Open the modal
  };

  const closeEditModal = () => setIsEditModalOpen(false);  // Close the modal

  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [classroom, setClassroom] = useState('');
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [typeOptions, setTypeOptions] = useState(['Homework', 'Test', 'Document', 'Other']);

  const colorOptions = [
    'Black', 'Grey', 'Red', 'OrangeRed', 'MediumVioletRed',
    'Purple', 'BlueViolet', 'RoyalBlue', 'DarkBlue', 'ForestGreen'
  ];

  function separateDateTime(dateTime) {
    const parts = dateTime.split('T');
    const date = parts[0]; // The date part
    const time = parts[1]; // The time part
    return { date, time };
  }

  const formattedEvents = events.map(event => ({
    id: event.id,
    text: event.text,
    start: new Date(event.start).toISOString(),
    end: new Date(event.end).toISOString(),
    backColor: event.backColor,
    participants: event.participants || 0,
    type: event.type,
    classroom: event.classroom
  }));

  const config = {
    viewType: "Week",
    durationBarVisible: false,
    startDate: startDate,
    events: formattedEvents,

    onBeforeEventRender: args => {
      args.data.backColor = args.data.backColor || "#ffffff"; // Fallback to white if no color
      args.data.html = `
        <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>${args.data.text}</div>
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 5px;">
            ${onEditEvent ? '<span class="edit-icon" style="cursor: pointer;">✏️</span>' : ''}
            ${onDeleteEvent ? '<span class="delete-icon" style="cursor: pointer;">🗑️</span>' : ''}
          </div>
        </div>`;
    },

    // Conditionally handle event clicks only if edit/delete is allowed
    onEventClick: args => {
      if (onDeleteEvent || onEditEvent) {
        const eventId = args.e.id();
        const target = args.originalEvent.target;

        if (onDeleteEvent && target.classList.contains("delete-icon")) {
          onDeleteEvent(eventId);
        } else if (onEditEvent && target.classList.contains("edit-icon")) {
          const event = formattedEvents.find(event => event.id === eventId);

          const { date: eventStartDate, time: eventStartTime } = separateDateTime(event.start.toString());
          const { date: eventEndDate, time: eventEndTime } = separateDateTime(event.end.toString());
          setText(event.text);
          setType(event.type);
          setColor(event.backColor);
          setDate(eventStartDate);
          setStartTime(eventStartTime);
          setEndTime(eventEndTime);
          setClassroom(event.classroom);

          openEditModal(event);
        } else {
          const event = formattedEvents.find(event => event.id === eventId);
          openModal(event); // Open modal with event details
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!date || !startTime || !endTime || !type) {
      setError('Please fill in all fields');
      return;
    }

    const start = new Date(`${date}T${startTime}Z`);
    const end = new Date(`${date}T${endTime}Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date or time provided');
      return;
    }

    const event = { 
      text,
      color,
      type,
      start: start.toISOString(),
      end: end.toISOString(),
      classroom
    };

    onEditEvent(selectedEvent.id, event)
  };

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
