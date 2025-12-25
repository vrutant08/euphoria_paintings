import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { artworks, categories } from '../../data/artworks'
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

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const galleryRef = useRef(null)
  const navigate = useNavigate()

  const filteredArtworks = activeCategory === 'all' 
    ? artworks 
    : artworks.filter(art => art.category === activeCategory)

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

  return (
    <motion.div
      className="gallery"
      ref={galleryRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background lines */}
      <div className="gallery-bg-lines">
        <div className="gallery-line gallery-line--1"></div>
        <div className="gallery-line gallery-line--2"></div>
        <div className="gallery-line gallery-line--3"></div>
      </div>
      
      {/* Cursor-following spotlight */}
      <motion.div 
        className="cursor-spotlight"
        animate={{
          x: mousePos.x - 200,
          y: mousePos.y - 200,
        }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      />
      
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
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              {activeCategory === cat.id && (
                <motion.span
                  className="filter-underline"
                  layoutId="filterUnderline"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
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
                className="gallery-card"
                variants={itemVariants}
                layout
                onMouseEnter={() => setHoveredCard(artwork.id)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ y: -8 }}
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
                    <div className="overlay-content">
                      <span className="view-text">View</span>
                    </div>
                  </motion.div>
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
