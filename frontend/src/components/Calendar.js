import { React, useState, useEffect } from 'react';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { useAuthContext } from '../hooks/useAuthContext';

const Calendar = ({ startDate, events = [], onDeleteEvent, onEditEvent }) => {
  const { user } = useAuthContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParentVerificationModalOpen, setIsParentVerificationModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isParentCodeVerified, setIsParentCodeVerified] = useState(false);  // Track if the parent code is verified
  const [enteredCode, setEnteredCode] = useState('');  // Store entered code
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);  // Track if code is correct
  const [calendarError, setCalendarError] = useState(null);

  // Check if events data exists and is valid
  useEffect(() => {
    if (!Array.isArray(events)) {
      console.error("Events is not an array:", events);
      setCalendarError("Error loading events");
    } else {
      setCalendarError(null);
    }
  }, [events]);

  // opens modal for event info
  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false); // function to close event info modal
  const closeParentVerificationModal = () => setIsParentVerificationModalOpen(false); // closes parent verification modal

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // function to open edit event modal
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false); // function to close edit event modal

  // state variables to help with form submission
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [classroom, setClassroom] = useState('');
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const typeOptions = ['Homework', 'Test', 'Document', 'Other'];

  const colorOptions = [
    'Black', 'Grey', 'Red', 'OrangeRed', 'MediumVioletRed',
    'Purple', 'BlueViolet', 'RoyalBlue', 'DarkBlue', 'ForestGreen'
  ];

  // separates the date and time string into two strings
  function separateDateTime(dateTime) {
    try {
      const parts = dateTime.split('T');
      const date = parts[0];
      const time = parts[1];
      return { date, time };
    } catch (error) {
      console.error("Error separating date time:", error);
      return { date: '', time: '' };
    }
  }

  // Safely map events to prevent errors
  const formattedEvents = Array.isArray(events) ? events.map(event => {
    try {
      return {
        id: event._id || event.id,
        text: event.text || 'Untitled Event',
        start: new Date(event.start).toISOString(),
        end: new Date(event.end).toISOString(),
        backColor: event.backColor || event.color || 'Grey',
        participants: event.participants || 0,
        type: event.type || 'Other',
        classroom: event.classroom || 'default'
      };
    } catch (error) {
      console.error("Error formatting event:", error, event);
      return null;
    }
  }).filter(Boolean) : [];

  // configures the calendar based on user role
  const config = {
    viewType: "Week",
    durationBarVisible: false,
    startDate: startDate,
    events: formattedEvents,
  
    onBeforeEventRender: args => {
      try {
        args.data.backColor = args.data.backColor || "#ffffff";
      
        if (user && user.role === 'student') {
          if (isParentCodeVerified) {
            args.data.html = `
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>${args.data.text}</div>
                <div style="color: green;">✅</div>
              </div>`;
          } else {
            args.data.html = `
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>${args.data.text}</div>
                <div class="verify-parent-code" style="cursor: pointer; color: red;">
                  ☑️
                </div>
              </div>`;
          }
          
        } else if (user && user.role !== 'student') {
          args.data.html = `
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>${args.data.text}</div>
              <div style="display: flex; justify-content: center; gap: 10px; margin-top: 5px;">
                ${onEditEvent ? '<span class="edit-icon" style="cursor: pointer;">✏️</span>' : ''}
                ${onDeleteEvent ? '<span class="delete-icon" style="cursor: pointer;">🗑️</span>' : ''}
              </div>
            </div>`;
        } else {
          args.data.html = `
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>${args.data.text}</div>
              <div style="margin-top: 5px;"></div>
            </div>`;
        }
      } catch (error) {
        console.error("Error rendering event:", error);
      }
    },
  
    // when the user clicks on the event
    onEventClick: args => {
      try {
        const target = args.originalEvent.target;
      
        // Prevent opening the parent code verification modal if clicked on the checkmark and the parent code is not verified
        if (target.classList.contains('verify-parent-code') && !isParentCodeVerified) {
          openParentCodeVerificationModal();  // Open the verification modal
          return;  // Exit early so the event details modal doesn't open
        }
      
        // Handle other event clicks (Edit/Delete)
        if (onDeleteEvent || onEditEvent) {
          const eventId = args.e.id();
      
          // handles if delete is clicked
          if (onDeleteEvent && target.classList.contains("delete-icon")) {
            onDeleteEvent(eventId);
  
            // handles if the edit icon is clicked
          } else if (onEditEvent && target.classList.contains("edit-icon")) {
            const event = formattedEvents.find(event => event.id === eventId);
            if (!event) {
              console.error("Event not found:", eventId);
              return;
            }
      
            // sets the forms default values to the current event info
            const { date: eventStartDate, time: eventStartTime } = separateDateTime(event.start.toString());
            const { date: eventEndDate, time: eventEndTime } = separateDateTime(event.end.toString());
            setText(event.text);
            setType(event.type);
            setColor(event.backColor);
            setDate(eventStartDate);
            setStartTime(eventStartTime);
            setEndTime(eventEndTime);
            setClassroom(event.classroom);
      
            // opens the event modal
            openEditModal(event);
          } else {
            // opens the event info modal
            const event = formattedEvents.find(event => event.id === eventId);
            if (event) {
              openModal(event);
            }
          }
        }
      } catch (error) {
        console.error("Error handling event click:", error);
      }
    }
  };

  const openParentCodeVerificationModal = () => {
    setIsParentVerificationModalOpen(true);
  };

  const handleCodeChange = (e) => {
    setEnteredCode(e.target.value);
  };

  const verifyParentCode = (e) => {
    e.preventDefault();

    if (user && user.parentCode && enteredCode === user.parentCode) {
      setIsParentCodeVerified(true);
      setIsCodeCorrect(true);
      closeModal();
    } else {
      console.log("entered Code: ", enteredCode);
      if (user && user.parentCode) {
        console.log("user.parentCode: ", user.parentCode);
      }
      
      setIsCodeCorrect(false);
      setError('Invalid parent code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!date || !startTime || !endTime || !type) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const start = new Date(`${date}T${startTime}Z`);
      const end = new Date(`${date}T${endTime}Z`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Invalid date or time provided');
        return;
      }

      const event = {
        text,
        backColor: color || 'Grey',
        type,
        start: start.toISOString(),
        end: end.toISOString(),
        classroom
      };

      onEditEvent(selectedEvent.id, event);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError('An error occurred. Please try again.');
    }
  };

  if (calendarError) {
    return <div className="calendar-error">Error loading calendar: {calendarError}</div>;
  }

  return (
    <div>
      <DayPilotCalendar {...config} />

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


            <button type="button" onClick={closeModal} className="close-modal">
              Close
            </button>
          </div>
        </div>
      )}


      {isEditModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create" onSubmit={handleSubmit}>
              <h3>Edit Event</h3>

              <label>Event Title:</label>
              <input
                type="text"
                onChange={(e) => setText(e.target.value)}
                value={text}
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

              <input
                type="hidden"
                value={classroom}
              />

              <label>Date:</label>
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
                value={date}
              />

              <label>Start Time:</label>
              <input
                type="time"
                onChange={(e) => setStartTime(e.target.value)}
                value={startTime}
              />

              <label>End Time:</label>
              <input
                type="time"
                onChange={(e) => setEndTime(e.target.value)}
                value={endTime}
              />

              <button type="submit" className="submit">Save</button>
              {error && <div className="error">{error}</div>}

              <button type="button" onClick={closeEditModal} className="submit">
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    {isParentVerificationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Verify Parent Code</h4>
            <form onSubmit={verifyParentCode}>
              <input
                type="text"
                value={enteredCode}
                onChange={handleCodeChange}
                placeholder="Enter parent code"
                className={isCodeCorrect ? 'correct' : ''}
              />
              <button type="submit" className={isCodeCorrect ? 'submit-correct' : ''}>
                Verify
              </button>
              {error && <p>{error}</p>}
            </form>
            <button type="button" onClick={closeParentVerificationModal} className="close-modal">Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calendar;