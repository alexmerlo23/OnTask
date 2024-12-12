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

    // verify user
    if (!user) {
      setError('User is not logged in');
      setIsLoading(false);
      return;
    }

    try {
      // patch the user code
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            email: user.email,  // Include the user's email for identification
            newCode: newCode,   // Include the new code
          }),
      });

      const json = await response.json();

      if (!response.ok) { // if patch fails
        throw new Error(json.error || 'Failed to update code');
      }
      else { // user context
        dispatch({ type: 'UPDATE_CODE', payload: { code: newCode } });
      }

    } catch (err) { // error handling
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // functions to open and close the modals
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // join class form
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