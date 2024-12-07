import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { EventsContextProvider } from './context/EventContext';
import { AuthContextProvider } from './context/AuthContext'
import {ClassesContextProvider} from './context/ClassContext'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ClassesContextProvider>
        <EventsContextProvider>
          <App />
        </EventsContextProvider>
      </ClassesContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);