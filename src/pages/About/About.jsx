import { useRef, useEffect, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { fetchAboutData } from '../../services/settingsService'
import { artistInfo as defaultArtistInfo } from '../../data/artworks'
import './About.scss'

// Floating particles component - memoized to prevent re-renders on mouse move
const FloatingParticles = memo(() => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
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

// Parallax image component
const ParallaxImage = ({ src, alt }) => {
  const ref = useRef(null)
  const [elementTop, setElementTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  
  useEffect(() => {
    const element = ref.current
    const setValues = () => {
      setElementTop(element?.offsetTop || 0)
      setClientHeight(window.innerHeight)
    }
    setValues()
    window.addEventListener('resize', setValues)
    return () => window.removeEventListener('resize', setValues)
  }, [])
  
  return (
    <div ref={ref} className="parallax-image-container">
      <motion.img 
        src={src} 
        alt={alt}
        initial={{ scale: 1.1 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      />
      <div className="image-grain"></div>
    </div>
  )
}

const About = () => {
  const aboutRef = useRef(null)
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [artistInfo, setArtistInfo] = useState(defaultArtistInfo)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch about data from Supabase
  useEffect(() => {
    let isMounted = true
    
    const loadAboutData = async () => {
      try {
        const { data, error } = await fetchAboutData()
        if (isMounted && data) {
          setArtistInfo(data)
        }
      } catch (err) {
        console.error('Error loading about data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    
    loadAboutData()
    
    // Safety timeout - ensure loading always completes
    const timeout = setTimeout(() => {
      if (isMounted) setIsLoading(false)
    }, 3000)
    
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [])
  
  // Track mouse for reactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal animation
      gsap.fromTo(
        '.about-image',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      )

      gsap.fromTo(
        '.about-content > *',
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power3.out',
          stagger: 0.1,
          delay: 0.4
        }
      )
    }, aboutRef)

    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      className="about"
      ref={aboutRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Animated background decorations */}
      <div className="about-bg-decor">
        <motion.div 
          className="about-orb about-orb--1"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="about-orb about-orb--2"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="about-line about-line--1"
          animate={{ 
            scaleX: [0.4, 1, 0.4],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="about-ring about-ring--1"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="about__container">
        {/* Header with Back Link */}
        <div className="about__header">
          <motion.button 
            onClick={() => navigate('/')} 
            className="back-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="arrow">←</span>
            <span>BACK</span>
          </motion.button>
        </div>

        <div className="about__grid">
          {/* Image Section */}
          <div className="about-image">
            <ParallaxImage 
              src={artistInfo.profileImage || "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop"} 
              alt={`${artistInfo.name} - Artist`}
            />
          </div>

          {/* Content Section */}
          <div className="about-content">
            {/* Back button positioned here */}
            <motion.button 
              onClick={() => navigate('/')} 
              className="back-link-content"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="arrow">←</span>
              <span>BACK</span>
            </motion.button>

            <motion.h1 
              className="about-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hello, I'm <span className="accent">{artistInfo.name.split(' ')[0]}.</span>
            </motion.h1>

            <div className="about-bio">
              {artistInfo.bio.map((paragraph, index) => (
                <motion.p 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            <div className="about-details">
              {/* Exhibitions */}
              <motion.div 
                className="detail-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="detail-title">Exhibitions</h3>
                <ul className="exhibition-list">
                  {artistInfo.exhibitions.map((exhibition, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 10, color: '#ff6b9d' }}
                    >
                      <span className="year">{exhibition.year}</span>
                      <span className="separator">—</span>
                      <span className="name">{exhibition.name},</span>
                      <span className="location">{exhibition.location}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Tools */}
              <motion.div 
                className="detail-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="detail-title">Tools</h3>
                <ul className="tools-list">
                  {artistInfo.tools.map((tool, index) => (
                    <motion.li 
                      key={index} 
                      className={index === artistInfo.tools.length - 1 ? 'highlight' : ''}
                      whileHover={{ scale: 1.05, x: 5 }}
                    >
                      {tool}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div 
              className="about-social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <motion.a 
                href={artistInfo.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.1, y: -3 }}
              >
                Instagram
              </motion.a>
              <motion.a 
                href={artistInfo.social.artstation}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.1, y: -3 }}
              >
                ArtStation
              </motion.a>
              <motion.a 
                href={artistInfo.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                whileHover={{ scale: 1.1, y: -3 }}
              >
                Twitter
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
    
  )
}

export default About
