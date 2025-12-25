import { motion } from 'framer-motion'
import './LoadingScreen.scss'

const LoadingScreen = () => {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="loading-content">
        <motion.div
          className="loading-logo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="logo-text">EUPHORIA</span>
          <span className="logo-accent">PAINTINGS</span>
        </motion.div>
        
        <motion.div
          className="loading-bar-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="loading-bar"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
        
        <motion.p
          className="loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading artistry...
        </motion.p>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
