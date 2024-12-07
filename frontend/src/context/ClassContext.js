import { createContext, useReducer, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext'; // Assuming you are storing user data here

export const ClassesContext = createContext();

export const ClassesReducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_CLASS':
            return { ...state, classroom: action.payload }; // Store the classroom in the context
        default:
            return state;
    }
};

export const ClassesContextProvider = ({ children }) => {
    const { user } = useAuthContext(); // Access user context (assuming user data is stored here)
    const [state, dispatch] = useReducer(ClassesReducer, {
        classroom: null,
    });

    useEffect(() => {
        if (user && user.classroom) {
            // Fetch classroom data if it exists in user
            fetchClassroom(user.classroom)
                .then(classroom => {
                    dispatch({ type: 'CREATE_CLASS', payload: classroom });
                })
                .catch(error => {
                    console.error('Failed to fetch classroom:', error);
                });
        }
    }, [user]);

    const fetchClassroom = async (classroomId) => {
        const response = await fetch(`/api/classrooms/${classroomId}`);
        const classroom = await response.json();
        return classroom;
    };

    return (
        <ClassesContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ClassesContext.Provider>
    );
};
