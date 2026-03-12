import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import HamburgerMenu from './HamburgerMenu';
import EventForm from '../components/CalendarForm';
import './Navbar.css';

const Navbar = ({ fetchEvents }) => {
  const { user } = useAuthContext();

  return (
    <header>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user && <HamburgerMenu />}
        </div>

        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>OnTask</h1>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{user.email}</span>
              {user.role === 'teacher' && (
                <div style={{ marginLeft: '1rem' }}>
                  <EventForm fetchEvents={fetchEvents} />
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