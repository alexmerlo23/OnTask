import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages & components
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import Account from './pages/Account'

// Contexts
import { ClassesContextProvider } from './context/ClassContext'  // Import the provider

function App() {
  const { user } = useAuthContext()

  return (
    <div className="App">
      <ClassesContextProvider>  {/* Wrap the app with the ClassesContextProvider */}
        <BrowserRouter>
          <Navbar />
          <div className="pages">
            <Routes>
              <Route 
                path="/" 
                element={user ? <Home /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/login" 
                element={!user ? <Login /> : <Navigate to="/" />} 
              />
              <Route 
                path="/signup" 
                element={!user ? <Signup /> : <Navigate to="/" />} 
              />
              <Route 
                path="/createEvent" 
                element={user ? <Home /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/account" 
                element={<Account />} 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </ClassesContextProvider>  {/* End the ClassesContextProvider wrapping */}
    </div>
  );
}

export default App;
