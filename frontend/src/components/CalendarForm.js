import { useState } from "react";
import { useEventsContext } from "../hooks/useEventsContext";
import { useAuthContext } from '../hooks/useAuthContext';

const EventForm = ({ fetchEvents }) => {
  const { dispatch } = useEventsContext();
  const { user } = useAuthContext();

  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user) {
      setError('You must be logged in');
      return;
    }
  
    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }
  
    // Combine date and time into a single datetime string
    const start = new Date(`${date}T${startTime}Z`);
    const end = new Date(`${date}T${endTime}Z`);
    
    // Check if the dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date or time provided');
      return;
    }
  
    // Convert to UTC before sending to the server
    const event = { 
      text,
      start: start.toISOString(),  // This will be in UTC
      end: end.toISOString(),      // This will be in UTC
      user_id: user.id // Ensure your event model accepts user_id
    };
  
    console.log("Sending event:", event);
  
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Ensure user.token is defined
        },
      });
  
      // Handle the response
      if (!response.ok) {
        const json = await response.json(); // Attempt to parse the JSON
        setError(json.error || 'Something went wrong'); // Provide a fallback error message
        setEmptyFields(json.emptyFields || []); // Ensure emptyFields is defined
        console.log("Error:", json.error);
      } else {
        const json = await response.json(); // Parse JSON if the response is OK
        setText('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setError(null);
        setEmptyFields([]);
        console.log("Event dispatched:", json);
        dispatch({ type: 'CREATE_EVENT', payload: { ...json, id: json._id } });
        fetchEvents();
      }
    } catch (error) {
      console.error('Fetch error:', error); // Log any network errors
      setError('An error occurred while creating the event.');
    }
  };

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a New Event</h3>

      <label>Event Title:</label>
      <input 
        type="text"
        onChange={(e) => setText(e.target.value)}
        value={text}
        className={emptyFields.includes('text') ? 'error' : ''}
      />

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

      <button>Add Event</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default EventForm;
