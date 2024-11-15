import { useContext } from 'react';
import { eventsContext } from '../context/EventContext'; // Adjust the path based on your directory structure

export const useEventsContext = () => {
    const context = useContext(eventsContext);

    if (!context) {
        throw Error('useEventsContext must be used inside an EventsContextProvider');
    }

    return context;
}