import { useState } from 'react';

const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to login'); // Throw an error if response is not ok
      }

      const json = await response.json();

      // Check if the response body is empty
      if (!json) {
        throw new Error('Unexpected response format'); // Handle empty response
      }

      // Assume you store the user token and other user data
      localStorage.setItem('user', JSON.stringify(json));
      setIsLoading(false);
      return json; // Return the user data if needed
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  return { login, error, isLoading };
};

export default useLogin;
