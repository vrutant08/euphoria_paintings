import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Pages
import Home from './pages/Home/Home'
import Gallery from './pages/Gallery/Gallery'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Studio from './pages/Studio/Studio'

// Components
import Navigation from './components/Navigation/Navigation'
import MenuOverlay from './components/MenuOverlay/MenuOverlay'
import CustomCursor from './components/CustomCursor/CustomCursor'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import CommissionModal from './components/CommissionModal/CommissionModal'

function AnimatedRoutes({ setCommissionOpen }) {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home setCommissionOpen={setCommissionOpen} />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Secret admin route - only Jasmine knows this URL */}
        <Route path="/jasmine-studio" element={<Studio />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCommissionOpen, setCommissionOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Router>
      <div className="app">
        <CustomCursor />
        
        <AnimatePresence>
          {isLoading && <LoadingScreen />}
        </AnimatePresence>

        <Navigation 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
          setCommissionOpen={setCommissionOpen}
        />
        
        <MenuOverlay 
          isOpen={isMenuOpen} 
          setIsOpen={setIsMenuOpen} 
        />

        <CommissionModal 
          isOpen={isCommissionOpen}
          setIsOpen={setCommissionOpen}
        />

        <main className="main-content">
          <AnimatedRoutes setCommissionOpen={setCommissionOpen} />
        </main>
      </div>
    </Router>
  )
}

export default App
