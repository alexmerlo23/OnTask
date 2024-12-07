import { useState } from "react";
import { useClassContext } from "../hooks/useClassContext";
import { useAuthContext } from '../hooks/useAuthContext';

const ClassroomForm = () => {
  const { dispatch } = useClassContext();
  const { user } = useAuthContext();

  const [email, setEmail] = useState(user.email);
  const [code, setCode] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted'); // Debug log

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!classroomName || !code || !email) {
      setError('Please fill in all fields');
      return;
    }

    console.log('Request body:', { classroomName, code, email }); // Debug log

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ classroomName, code, email }),
      });

      console.log('Response from /api/classes:', response); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data from /api/classes:', errorData); // Debug log

        // Check for duplicate key error
        if (errorData.code === 11000) {
          setError('Code already in use. Please select a different code.');
        } else {
          setError('Failed to create class. Please try again.');
        }
        return;
      }

      const classData = await response.json();
      console.log('Class created successfully:', classData); // Debug log
      dispatch({ type: 'CREATE_CLASS', payload: classData });

      const responseTwo = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ email: user.email, newCode: code }),
      });

      console.log('Response from /api/user patch:', responseTwo); // Debug log

      if (!responseTwo.ok) {
        const errorTextTwo = await responseTwo.text();
        console.error('Error updating user code:', errorTextTwo); // Debug log
        setError('Failed to update user code.');
        return;
      }

      const updatedUser = await responseTwo.json();
      console.log('User updated successfully:', updatedUser); // Debug log

      // Update the user context
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });

      setIsModalOpen(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An unexpected error occurred.');
    }
  };

  const openModal = () => {
    console.log('Opening modal'); // Debug log
    setIsModalOpen(true);
  };
  const closeModal = () => {
    console.log('Closing modal'); // Debug log
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={openModal} className="create-class-button">Create Class</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="create-class" onSubmit={handleSubmit}>
              <h3>Create a New Class</h3>

              <label>Class Name:</label>
              <input
                type="text"
                onChange={(e) => setClassroomName(e.target.value)}
                value={classroomName}
              />

              <label>Class Code:</label>
              <input
                type="text"
                onChange={(e) => setCode(e.target.value)}
                value={code}
              />

              <input
                type="hidden"
                value={email}
              />

              <button type="submit" className="submit" disabled={!classroomName || !code || !email}>
                Create Class
              </button>
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

export default ClassroomForm;
