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
            <Link to="/account">Account</Link>
            <Link to="/">Calendar</Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default HamburgerMenu