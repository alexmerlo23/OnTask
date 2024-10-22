import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Squash as Hamburger } from 'hamburger-react'

const HamburgerMenu = () => {
  const [isOpen, setOpen] = useState(false)

  return (
    <div className="hamburger-container">
      <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
      {isOpen && (
        <div className="hamburger-menu">
            <Hamburger toggled={isOpen} toggle={setOpen} size={24} />
          <nav className="menu-content">
            {/* Add links here once Account and Calendar pages are developed */}
            <Link to="/account">Account</Link>
            <Link to="/calendar">Calendar</Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default HamburgerMenu