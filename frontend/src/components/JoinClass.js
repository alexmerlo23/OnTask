import { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import API_URL from '../config/api'; // Import the API_URL

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
    console.log('Using API URL:', `${API_URL}/api/user`); // Log the complete URL
    try {
      // Use the API_URL here instead of a relative path
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newCode: trimmedCode }),
      });

      console.log('Response status:', response.status);
      
      // For debugging
      const contentType = response.headers.get('Content-Type');
      console.log('Content-Type header:', contentType);
      
      if (!response.ok) {
        const text = await response.text();
        console.log('Error response:', text);
        
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || `Server error: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server error: ${response.status}. ${text || ''}`);
        }
      }
      
      // Check if response has content
      const text = await response.text();
      console.log('Raw response text:', text);
      
      if (!text) {
        throw new Error('Server returned empty response');
      }
      
      let userData;
      try {
        userData = JSON.parse(text);
        console.log('Parsed user data:', userData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Server returned invalid JSON');
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