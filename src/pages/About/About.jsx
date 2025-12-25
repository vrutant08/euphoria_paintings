import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { artistInfo } from '../../data/artworks'
import './About.scss'

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
      {/* Reactive floating shapes */}
      <motion.div 
        className="floating-shape floating-shape--1"
        animate={{
          x: mousePos.x * 20,
          y: mousePos.y * 20,
          rotate: mousePos.x * 5
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <motion.div 
        className="floating-shape floating-shape--2"
        animate={{
          x: mousePos.x * -30,
          y: mousePos.y * -30,
          rotate: mousePos.y * -8
        }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
      />
      <motion.div 
        className="floating-shape floating-shape--3"
        animate={{
          x: mousePos.x * 15,
          y: mousePos.y * -20,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      />
      
      <div className="about__container">
        {/* Back Link */}
        <motion.button 
          onClick={() => navigate('/')} 
          className="back-link"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="arrow">←</span>
          <span>BACK</span>
        </motion.button>

        <div className="about__grid">
          {/* Image Section */}
          <div className="about-image">
            <ParallaxImage 
              src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop" 
              alt="Jasmine Konsoula - Artist"
            />
          </div>

          {/* Content Section */}
          <div className="about-content">
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
