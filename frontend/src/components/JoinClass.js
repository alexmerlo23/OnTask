import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

export const JoinClass = () => {
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  const { user, dispatch } = useAuthContext();

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

    console.log('Sending token:', user.token);
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCode: trimmedCode }),
      });

      console.log('Response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);

      if (!response.ok) {
        let errorMessage;
        try {
          const json = JSON.parse(text);
          errorMessage = json.error || `Server responded with status ${response.status}`;
          if (response.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
            dispatch({ type: 'LOGOUT' });
          }
        } catch {
          errorMessage = text || `Server responded with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Try to parse the response as JSON
      let userData;
      try {
        userData = JSON.parse(text);
      } catch (e) {
        throw new Error('Server returned invalid JSON');
      }

      // Update local storage with the new user data
      const updatedUser = { ...user, code: userData.code };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the auth context with the updated user
      dispatch({ type: 'LOGIN', payload: updatedUser });
      
      setSuccess('Successfully joined class!');
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setNewCode('');
      }, 1500);
      
    } catch (err) {
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