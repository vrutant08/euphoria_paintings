import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './MenuOverlay.scss'

const menuItems = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

const MenuOverlay = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [isOpen])

  const handleNavigation = (path) => {
    setIsOpen(false)
    setTimeout(() => {
      navigate(path)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background blur */}
          <motion.div
            className="menu-overlay__backdrop"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(20px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
          />

          {/* Menu Content */}
          <div className="menu-overlay__content">
            <motion.nav
              className="menu-nav"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.path}
                  className="menu-item"
                  variants={itemVariants}
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="menu-link"
                  >
                    <span className="menu-link__text">{item.label}</span>
                    <span className="menu-link__line"></span>
                  </button>
                </motion.div>
              ))}
            </motion.nav>
          </div>

          {/* Close Button */}
          <motion.button
            className="menu-overlay__close"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="close-icon">×</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MenuOverlay
