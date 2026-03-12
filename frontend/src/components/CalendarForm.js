import { useState } from "react";
import { useEventsContext } from "../hooks/useEventsContext";
import { useAuthContext } from '../hooks/useAuthContext';
import './CalendarForm.css';

// Returns { date, startTime, endTime } pre-filled to now → now+1hr in local time
const getDefaultTimes = () => {
  const now = new Date();

  // "YYYY-MM-DD" in local time (not UTC, so the date input matches what the user sees)
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const pad = (n) => String(n).padStart(2, '0');
  const startTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
  const endTime = `${pad(later.getHours())}:${pad(later.getMinutes())}`;

  return { date, startTime, endTime };
};

const EventForm = () => {
  const { createEvent } = useEventsContext();
  const { user } = useAuthContext();

  const [text, setText] = useState('');
  const [date, setDate] = useState(() => getDefaultTimes().date);
  const [startTime, setStartTime] = useState(() => getDefaultTimes().startTime);
  const [endTime, setEndTime] = useState(() => getDefaultTimes().endTime);
  const [color, setColor] = useState('');
  const [type, setType] = useState('');
  // For teachers: selected from their classes array. Default to first class if available.
  const [classroom, setClassroom] = useState(
    user?.classes?.length > 0 ? user.classes[0].code : ''
  );
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeOptions] = useState(['Homework', 'Test', 'Document', 'Other']);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        setError('You must be logged in');
        setIsLoading(false);
        return;
      }

      const formErrors = [];
      if (!text) formErrors.push('text');
      if (!date) formErrors.push('date');
      if (!startTime) formErrors.push('startTime');
      if (!endTime) formErrors.push('endTime');
      if (!type) formErrors.push('type');
      if (!classroom) formErrors.push('classroom');

      if (formErrors.length > 0) {
        setEmptyFields(formErrors);
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const start = new Date(`${date}T${startTime}Z`);
      const end = new Date(`${date}T${endTime}Z`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Invalid date or time provided');
        setIsLoading(false);
        return;
      }

      const event = {
        text,
        color: color || 'Grey',
        type,
        start: start.toISOString(),
        end: end.toISOString(),
        classroom, // this is the class code chosen by the teacher
        email: user.email
      };

      const result = await createEvent(event);

      if (result) {
        const defaults = getDefaultTimes();
        setText('');
        setDate(defaults.date);
        setStartTime(defaults.startTime);
        setEndTime(defaults.endTime);
        setColor('');
        setType('');
        setClassroom(user?.classes?.length > 0 ? user.classes[0].code : '');
        setError(null);
        setEmptyFields([]);
        closeModal();
        window.location.reload();
      } else {
        setError('Failed to create event. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred while creating the event.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const colorOptions = [
    'Black', 'Grey', 'Red', 'OrangeRed', 'MediumVioletRed',
    'Purple', 'BlueViolet', 'RoyalBlue', 'DarkBlue', 'ForestGreen'
  ];

  const teacherClasses = user?.classes || [];

  return (
    <>
      <button onClick={openModal} className="add-event-button">Add Event</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create" onSubmit={handleSubmit}>
              <h3>Add a New Event</h3>

              {/* Class selector — only shown for teachers who have classes */}
              {teacherClasses.length > 0 ? (
                <>
                  <label>
                    Class: <span className="required">*</span>
                  </label>
                  <select
                    className={`class-select ${emptyFields.includes('classroom') ? 'error' : ''}`}
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                  >
                    <option value="">— Select a class —</option>
                    {teacherClasses.map((cls) => (
                      <option key={cls.code} value={cls.code}>
                        {cls.classroomName} ({cls.code})
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="no-class-warning">
                  ⚠️ You have no classes yet. <a href="/manage-classes">Create a class</a> before adding events.
                </div>
              )}

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

              <button type="submit" className="submit" disabled={isLoading || teacherClasses.length === 0}>
                {isLoading ? 'Adding...' : 'Add Event'}
              </button>

              {error && <div className="error">{error}</div>}

              <button type="button" onClick={closeModal} className="close-modal" disabled={isLoading}>
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