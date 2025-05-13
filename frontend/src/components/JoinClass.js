import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

export const JoinClass = () => {
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, dispatch } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Verify user
    if (!user || !user.token) {
      setError('User is not logged in or token is missing');
      setIsLoading(false);
      return;
    }

    // Validate input
    const trimmedCode = newCode.trim();
    if (!trimmedCode) {
      setError('Class code cannot be empty');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCode: trimmedCode }), // Remove email
      });

      // Check if response is OK
      if (!response.ok) {
        const text = await response.text();
        let errorMessage;
        try {
          const json = JSON.parse(text);
          errorMessage = json.error || `Server responded with status ${response.status}`;
        } catch {
          errorMessage = text || `Server responded with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Check if response has JSON content
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }

      const json = await response.json();

      // Update user context
      dispatch({ type: 'UPDATE_CODE', payload: { code: trimmedCode } });

      // Close modal on success
      setIsModalOpen(false);
      setNewCode('');
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
                Join Class
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

export default JoinClass;