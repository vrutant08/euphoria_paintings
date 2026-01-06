import { useState, useRef, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { useArtworks, useCategories } from '../../hooks'
import { categories as defaultCategories } from '../../data/artworks'
import './Gallery.scss'

// Magnetic button component
const MagneticElement = ({ children, className }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      x.set((e.clientX - centerX) * 0.3)
      y.set((e.clientY - centerY) * 0.3)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

// Lightbox Component
const Lightbox = ({ artwork, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div 
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="lightbox__content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lightbox__close" onClick={onClose}>×</button>
        <div className="lightbox__image">
          {artwork.image ? (
            <img src={artwork.image} alt={artwork.title} />
          ) : (
            <div className="lightbox__placeholder">
              <span className="placeholder-icon">🎨</span>
              <span className="placeholder-text">Artwork Coming Soon</span>
            </div>
          )}
        </div>
        <div className="lightbox__info">
          <h2>{artwork.title}</h2>
          <div className="lightbox__meta">
            <span className="category">{artwork.category}</span>
            <span className="year">{artwork.year}</span>
          </div>
          {artwork.description && <p className="description">{artwork.description}</p>}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Floating particles component - memoized to prevent re-renders on mouse move
const FloatingParticles = memo(() => {
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    size: Math.random() * 10 + 6, // Bigger particles (6-16px)
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 6, // Faster: 6-16s instead of 10-25s
    delay: Math.random() * 3
  }))
  
  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -70, 0],
            x: [0, 35, -35, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
})

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [clickedCard, setClickedCard] = useState(null)
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const galleryRef = useRef(null)
  const navigate = useNavigate()

  // Fetch artworks from backend
  const { artworks, loading, error } = useArtworks({ category: activeCategory })
  const { categories } = useCategories()
  
  // Use fetched categories or fallback to defaults
  const displayCategories = categories.length > 1 ? categories : defaultCategories

  const filteredArtworks = artworks || []

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gallery-header',
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      
      // Animate decorative lines
      gsap.fromTo(
        '.gallery-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.inOut', stagger: 0.1 }
      )
    }, galleryRef)

    return () => ctx.revert()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const handleCardClick = (artwork) => {
    setClickedCard(artwork.id)
    setTimeout(() => {
      setSelectedArtwork(artwork)
      setClickedCard(null)
    }, 300)
  }

  return (
    <motion.div
      className="gallery"
      ref={galleryRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Background decorative elements */}
      <div className="gallery-bg-decor">
        <motion.div 
          className="decor-circle decor-circle--1"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="decor-circle decor-circle--2"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="decor-line decor-line--1"
          animate={{ 
            scaleX: [0.5, 1, 0.5],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="decor-line decor-line--2"
          animate={{ 
            scaleX: [0.6, 1, 0.6],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedArtwork && (
          <Lightbox 
            artwork={selectedArtwork} 
            onClose={() => setSelectedArtwork(null)} 
          />
        )}
      </AnimatePresence>

      <div className="gallery__container">
        {/* Header */}
        <header className="gallery-header">
          <div className="gallery-header__text">
            <motion.h1 
              className="gallery-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Selected Works
            </motion.h1>
            <motion.p 
              className="gallery-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              2023 — 2025 Collection
            </motion.p>
          </div>
          
          <motion.button 
            onClick={() => navigate('/')}
            className="back-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="arrow">←</span>
            <span>BACK</span>
          </motion.button>
        </header>

        {/* Category Filter */}
        <nav className="gallery-filter">
          {displayCategories.map(cat => {
            // Handle both object format and string format
            const catId = typeof cat === 'object' ? cat.id : cat
            const catLabel = typeof cat === 'object' ? cat.label : cat.charAt(0).toUpperCase() + cat.slice(1)
            
            return (
              <button
                key={catId}
                className={`filter-btn ${activeCategory === catId ? 'active' : ''}`}
                onClick={() => setActiveCategory(catId)}
              >
                {catLabel}
                {activeCategory === catId && (
                  <motion.span
                    className="filter-underline"
                    layoutId="filterUnderline"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Gallery Grid */}
        <motion.div
          className="gallery-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeCategory}
        >
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((artwork) => (
              <motion.article
                key={artwork.id}
                className={`gallery-card ${clickedCard === artwork.id ? 'clicked' : ''}`}
                variants={itemVariants}
                layout
                onMouseEnter={() => setHoveredCard(artwork.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(artwork)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="gallery-card__image">
                  {artwork.image ? (
                    <img 
                      src={artwork.image} 
                      alt={artwork.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="gallery-card__placeholder">
                      <span className="placeholder-icon">🎨</span>
                      <span className="placeholder-text">Coming Soon</span>
                    </div>
                  )}
                  <motion.div 
                    className="gallery-card__overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredCard === artwork.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="overlay-content"
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ 
                        scale: hoveredCard === artwork.id ? 1 : 0,
                        rotate: hoveredCard === artwork.id ? 0 : -10
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <span className="view-text">View</span>
                    </motion.div>
                  </motion.div>
                  
                  {/* Click ripple effect */}
                  <AnimatePresence>
                    {clickedCard === artwork.id && (
                      <motion.div 
                        className="click-ripple"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="gallery-card__info">
                  <h3 className="card-title">{artwork.title}</h3>
                  <div className="card-meta">
                    <span className="card-category">{artwork.category}</span>
                    <span className="card-year">{artwork.year}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Gallery
