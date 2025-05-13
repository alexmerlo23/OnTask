import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useEventsContext } from '../hooks/useEventsContext'; // Import Events Context hook
import API_URL from '../config/api';

export const JoinClass = () => {
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  const { user, dispatch } = useAuthContext();
  const { fetchEvents } = useEventsContext(); // Get fetchEvents function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!user || !user.token) {
      setError('User is not logged in or token is missing');
      setIsLoading(false);
      return;
    }

    const trimmedCode = newCode.trim();
    if (!trimmedCode) {
      setError('Class code cannot be empty');
      setIsLoading(false);
      return;
    }

    try {
      // Use the API_URL to join the class
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCode: trimmedCode }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || `Server error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status}. ${text || ''}`);
        }
      }
      
      const text = await response.text();
      
      if (!text) {
        throw new Error('Server returned empty response');
      }
      
      let userData;
      try {
        userData = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Server returned invalid JSON');
      }

      // Create updated user object with new code
      const updatedUser = {
        ...user,
        code: userData.code
      };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update context
      dispatch({ type: 'LOGIN', payload: updatedUser });
      
      // Now fetch events for the new class code
      await fetchEvents();
      
      setSuccess('Successfully joined class! Fetching class events...');
      
      // Close modal after showing success message briefly
      setTimeout(() => {
        setIsModalOpen(false);
        setNewCode('');
        window.location.reload(); // Force refresh to ensure events are displayed
      }, 1500);
      
    } catch (err) {
      console.error('Join class error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={openModal} className="create-class-button">Join Class</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="join-class" onSubmit={handleSubmit}>
              <h3>Join a Class</h3>

              <label>Class Code:</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />

              <button type="submit" className="submit" disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Join Class'}
              </button>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}

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

export default JoinClass;