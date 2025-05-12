import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import API_URL from '../config/api';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
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
      console.error('Login error:', err);
      setIsLoading(false);
      setError('Failed to connect to server. Please try again.');
    }
  };

  return { login, isLoading, error };
}