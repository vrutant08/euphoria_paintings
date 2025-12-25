import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Navigation.scss'

const Navigation = ({ isMenuOpen, setIsMenuOpen, setCommissionOpen }) => {
  return (
    <nav className="navigation">
      <div className="navigation__container">
        {/* Logo */}
        <Link to="/" className="navigation__logo">
          <span className="logo-main">EUPHORIA</span>
          <span className="logo-sub">PAINTINGS</span>
        </Link>

        {/* Social Links - Left */}
        <div className="navigation__social">
          <a 
            href="https://instagram.com/euphoriapaintings" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            INSTAGRAM
          </a>
          <a 
            href="https://artstation.com/euphoriapaintings" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            ARTSTATION
          </a>
        </div>

        {/* Commission Badge - Right */}
        <motion.button
          className="navigation__commission"
          onClick={() => setCommissionOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="commission-text">Available for Commissions</span>
        </motion.button>

        {/* Menu Toggle */}
        <button 
          className={`navigation__menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger">
            <span className="line"></span>
            <span className="line"></span>
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Navigation
