import { useState } from "react";
import { useClassContext } from "../hooks/useClassContext";
import { useAuthContext } from '../hooks/useAuthContext';

const ClassroomForm = () => {
  const { dispatch } = useClassContext();
  const { user } = useAuthContext();

  // state variables to help with form
  const [email, setEmail] = useState(user.email);
  const [code, setCode] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // handles submission of create class button
  const handleSubmit = async (e) => {
    e.preventDefault();

    // verify user
    if (!user) {
      setError('You must be logged in');
      return;
    }

    // verify all fields are filled
    if (!classroomName || !code || !email) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // post the class to the database
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ classroomName, code, email }),
      });

      if (!response.ok) { // handle if post fails
        const errorData = await response.json();

        // Check for duplicate key error
        if (errorData.code === 11000) {
          setError('Code already in use. Please select a different code.');
        } else {
          setError('Failed to create class. Please try again.');
        }
        return;
      }

      // class controller
      const classData = await response.json();
      dispatch({ type: 'CREATE_CLASS', payload: classData });

      // patch the user with the class code
      const responseTwo = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ email: user.email, newCode: code }),
      });

      if (!responseTwo.ok) { // handle if patch fails
        const errorTextTwo = await responseTwo.text();
        console.error('Error updating user code:', errorTextTwo); // Debug log
        setError('Failed to update user code.');
        return;
      }

      const updatedUser = await responseTwo.json();

      // Update the user context
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });

      setIsModalOpen(false); // close modal
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An unexpected error occurred.');
    }
    window.location.reload();

  };

  // functions to open and close the form modal
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // class form
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
