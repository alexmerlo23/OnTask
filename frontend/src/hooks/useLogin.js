import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      let json;
      try {
        json = await response.json(); // Try parsing the response as JSON
      } catch (err) {
        json = null; // If parsing fails, set json to null
      }
  
      if (!response.ok) {
        setIsLoading(false);
        setError(json?.error || 'Something went wrong'); // Fallback error message
        return;
      }
  
      // Save the user to local storage
      localStorage.setItem('user', JSON.stringify(json));
  
      // Update the auth context
      dispatch({ type: 'LOGIN', payload: json });
  
      // Update loading state
      setIsLoading(false);
    } catch (error) {
      setError('Failed to connect to the server'); // Network error handling
      setIsLoading(false);
    }
  };
  

  return { login, isLoading, error }
}