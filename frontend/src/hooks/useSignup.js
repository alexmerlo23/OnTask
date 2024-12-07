import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
//import { useClassContext } from './useClassContext'

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();
  //const { dispatch: classDispatch } = useClassContext();

  const signup = async (email, password, role, code, name) => {
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, code, name })
    });
    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      // save the user to local storage
      localStorage.setItem('user', JSON.stringify(json));

      // update the auth context
      dispatch({ type: 'LOGIN', payload: json });

      // update loading state
      setIsLoading(false);
    }
  };

  /*const signupClass = async (email, classroomName, code) => {
    console.log("testing")
    setIsLoading(true);
    setError(null);

    const classroom = {
      email,
      classroomName,
      code
    }

    const response = await fetch('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classroom),
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    console.log(json)

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    }
    if (response.ok) {
      // save the user to local storage
      localStorage.setItem('class', JSON.stringify(json));

      classDispatch({ type: 'CREATE_CLASS', payload: json });

      // update loading state
      setIsLoading(false);
    }
  };*/

  return { signup, isLoading, error };
};