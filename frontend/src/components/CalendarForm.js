import { useState } from "react";
import { useEventsContext } from "../hooks/useEventsContext";
import { useAuthContext } from '../hooks/useAuthContext';

const EventForm = () => {
  const { dispatch } = useEventsContext();
  const { user } = useAuthContext();

  // state variables to help with form
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [classroom, setClassroom] = useState(user.code);
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState(['Homework', 'Test', 'Document', 'Other']);

  // when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();

    // verify user
    if (!user) {
      setError('You must be logged in');
      return;
    }

    // verify all fields are filled
    if (!date || !startTime || !endTime || !type) {
      setError('Please fill in all fields');
      return;
    }

    // put date and time into correct format
    const start = new Date(`${date}T${startTime}Z`);
    const end = new Date(`${date}T${endTime}Z`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date or time provided');
      return;
    }

    // store event info into a variable
    const event = { 
      text,
      color,
      type,
      start: start.toISOString(),
      end: end.toISOString(),
      classroom: 'default'
    };

    try {
      // post the event to the database
      const response = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      // handle if post fails
      if (!response.ok) {
        const json = await response.json();
        console.log(json)
        setError(json.error || 'Something went wrong');
        setEmptyFields(json.emptyFields || []);
      } else {
        // event controller
        const json = await response.json();
        setText('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setColor('');
        setType('');
        setError(null);
        setEmptyFields([]);
        dispatch({ type: 'CREATE_EVENT', payload: { ...json, id: json._id } });

        // reload the window to update events on calendar
        window.location.reload();
      }
    } catch (error) {
      console.error('Fetch error:', error); // log the errors
      setError('An error occurred while creating the event.');
    }
  };

  // functions to open and close modals
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const colorOptions = [
    'Black', 'Grey', 'Red', 'OrangeRed', 'MediumVioletRed',
    'Purple', 'BlueViolet', 'RoyalBlue', 'DarkBlue', 'ForestGreen'
  ];

  // The add event form
  return (
    <>
      <button onClick={openModal} className="add-event-button">Add Event</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create" onSubmit={handleSubmit}>
              <h3>Add a New Event</h3>

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

              <input 
                type="hidden"
                value={classroom}
              />

              <button type="submit" className="submit">Add Event</button>
              {error && <div className="error">{error}</div>}

              <button type="button" onClick={closeModal} className="close-modal">
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EventForm;
