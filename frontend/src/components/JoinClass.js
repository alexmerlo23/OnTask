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
      
      // Get response as text first
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      // Only try to parse as JSON if there's content
      if (!responseText || responseText.trim() === '') {
        throw new Error('Server returned empty response');
      }
      
      // Parse the text as JSON
      const userData = JSON.parse(responseText);
      console.log('Parsed user data:', userData);
      
      if (!response.ok) {
        throw new Error(userData.error || `Server error: ${response.status}`);
      }
    
      // Create updated user object with new code
      const updatedUser = {
        ...user,
        code: userData.code
      };
      
      console.log('Updated user object:', updatedUser);
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update context
      dispatch({ type: 'LOGIN', payload: updatedUser });
      
      setSuccess('Successfully joined class!');
      setTimeout(() => {
        setIsModalOpen(false);
        setNewCode('');
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