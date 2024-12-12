import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
import HamburgerMenu from './HamburgerMenu';
import EventForm from '../components/CalendarForm';
import ClassroomForm from '../components/ClassroomForm';
import JoinClass from '../components/JoinClass';

const Navbar = ({ fetchEvents }) => {
  const { user } = useAuthContext();

  // navbar at the top of the screen
  return (
    <header>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side with HamburgerMenu and logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user && <HamburgerMenu />}
        </div>

        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginLeft: user ? 'rem' : '1 rem' }}>
            <h1>OnTask</h1>
          </Link>

        {/* Right side with user info, logout button, and EventForm for teachers */}
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{user.email}</span>
              {user.role === 'teacher' && (
                <div style={{ marginLeft: '1rem' }}>
                  {!user.code && <ClassroomForm />}
                  <EventForm fetchEvents={fetchEvents} />
                </div>
              )}
              {user.role === 'student' && (
                <div style={{ marginLeft: '1rem' }}>
                  {user.code === '' && <JoinClass />}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/signup" style={{ marginLeft: '1rem' }}>Signup</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
