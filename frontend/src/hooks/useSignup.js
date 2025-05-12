import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import API_URL from '../config/api';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, role, code, name) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/user/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password, role, code, name })
      });

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
        return;
      }

      // save the user to local storage
      localStorage.setItem('user', JSON.stringify(json));

      // update the auth context
      dispatch({type: 'LOGIN', payload: json});

      // update loading state
      setIsLoading(false);
    } catch (err) {
      console.error('Signup error:', err);
      setIsLoading(false);
      setError('Failed to connect to server. Please try again.');
    }
  };

  return { signup, isLoading, error };
}