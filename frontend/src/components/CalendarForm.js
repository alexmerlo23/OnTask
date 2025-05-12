import { useState, useEffect } from "react";
import { useEventsContext } from "../hooks/useEventsContext";
import { useAuthContext } from '../hooks/useAuthContext';
import API_URL from '../config/api';

const EventForm = () => {
  const { createEvent } = useEventsContext();
  const { user } = useAuthContext();

  // state variables to help with form
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  const [classroom, setClassroom] = useState('');
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState(['Homework', 'Test', 'Document', 'Other']);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch classroom data when the component mounts
  useEffect(() => {
    const fetchClassroom = async () => {
      if (user) {
        try {
          setError(null);
          const response = await fetch(`${API_URL}/api/classes/by-email?email=${user.email}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (!response.ok) {
            // Instead of throwing an error, set a default classroom name
            console.warn('Could not fetch classroom, using default');
            setClassroom('default');
            return;
          }

          const classroomData = await response.json();
          setClassroom(classroomData.classroomName || 'default');
        } catch (error) {
          console.error('Error fetching classroom:', error);
          // Set a default classroom instead of showing an error
          setClassroom('default');
        }
      }
    };

    fetchClassroom();
  }, [user]);

  // when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // verify user
      if (!user) {
        setError('You must be logged in');
        setIsLoading(false);
        return;
      }

      // Gather form data and check required fields
      const formErrors = [];
      if (!text) formErrors.push('text');
      if (!date) formErrors.push('date');
      if (!startTime) formErrors.push('startTime');
      if (!endTime) formErrors.push('endTime');
      if (!type) formErrors.push('type');
      
      if (formErrors.length > 0) {
        setEmptyFields(formErrors);
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // put date and time into correct format
      const start = new Date(`${date}T${startTime}Z`);
      const end = new Date(`${date}T${endTime}Z`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Invalid date or time provided');
        setIsLoading(false);
        return;
      }

      // store event info into a variable
      const event = { 
        text,
        backColor: color || 'Grey', // Default color if none selected
        type,
        start: start.toISOString(),
        end: end.toISOString(),
        classroom: classroom || 'default',
        email: user.email
      };

      console.log('Event to be created:', event);
      
      // Using the context function to create the event
      const result = await createEvent(event);
      
      if (result) {
        // Reset form on success
        setText('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setColor('');
        setType('');
        setError(null);
        setEmptyFields([]);
        closeModal();
        
        // reload the window to update events on calendar
        window.location.reload();
      } else {
        setError('Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('An error occurred while creating the event.');
    } finally {
      setIsLoading(false);
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

              <label>Event Title: <span className="required">*</span></label>
              <input
                type="text"
                onChange={(e) => setText(e.target.value)}
                value={text}
                className={emptyFields.includes('text') ? 'error' : ''}
              />

              <label>Event Type: <span className="required">*</span></label>
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

              <label>Date: <span className="required">*</span></label>
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                className={emptyFields.includes('date') ? 'error' : ''}
              />

              <label>Start Time: <span className="required">*</span></label>
              <input
                type="time"
                onChange={(e) => setStartTime(e.target.value)}
                value={startTime}
                className={emptyFields.includes('startTime') ? 'error' : ''}
              />

              <label>End Time: <span className="required">*</span></label>
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

              <button 
                type="submit" 
                className="submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Event'}
              </button>
              
              {error && <div className="error">{error}</div>}

              <button 
                type="button" 
                onClick={closeModal} 
                className="close-modal"
                disabled={isLoading}
              >
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