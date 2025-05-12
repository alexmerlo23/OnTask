import { useContext } from 'react';
import { ClassesContext } from '../context/ClassContext';
import { useAuthContext } from './useAuthContext';
import API_URL from '../config/api';

export const useClassContext = () => {
  const context = useContext(ClassesContext);
  const { user } = useAuthContext();

  if (!context) {
    throw Error('useClassContext must be used inside a ClassesContextProvider');
  }

  // Updated to use the API_URL
  const fetchClassroomByEmail = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/classes/by-email?email=${email}`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch classroom: ${response.status}`);
      }
      
      const data = await response.json();
      context.dispatch({ type: 'CREATE_CLASS', payload: data });
      return data;
    } catch (error) {
      console.error("Error fetching classroom:", error);
      return null;
    }
  };

  // Updated to use the API_URL
  const createClassroom = async (classroomData) => {
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(classroomData)
      });
      
      const json = await response.json();
      
      if (response.ok) {
        context.dispatch({ type: 'CREATE_CLASS', payload: json });
        return json;
      } else {
        console.error("Failed to create classroom:", json);
        return null;
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
      return null;
    }
  };

  return { 
    ...context, 
    fetchClassroomByEmail,
    createClassroom 
  };
};