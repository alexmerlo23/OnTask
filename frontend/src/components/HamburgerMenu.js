import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogout } from '../hooks/useLogout';
import { Squash as Hamburger } from 'hamburger-react'

const HamburgerMenu = () => {
  const { logout } = useLogout();
  const [isOpen, setOpen] = useState(false)

  const handleLogout = () => {
    logout();
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="hamburger-container">
      <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
      {isOpen && (
        <div className="hamburger-menu">
          <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
          <nav className="menu-content">
            <Link to="/account" onClick={handleLinkClick}>Account</Link>
            <Link to="/" onClick={handleLinkClick}>Calendar</Link>
            <Link to="/manage-classes" onClick={handleLinkClick}>Manage Classes</Link>
            <Link to="/" onClick={handleLogout}>Log out</Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default HamburgerMenu