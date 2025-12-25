import { useEffect, useRef, useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import DiagonalCards from '../../components/DiagonalCards/DiagonalCards'
import { artistInfo } from '../../data/artworks'
import './Home.scss'

const rotatingWords = ['Paintings', 'Welcomes You', 'Creations', 'Dreams']

// Fluid text animation - each letter animates with wave effect
const FluidText = ({ text }) => {
  const letters = text.split('')
  
  return (
    <span className="fluid-text">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="fluid-letter"
          animate={{
            y: [0, -8, 0, 5, 0],
            rotateZ: [0, -2, 0, 2, 0],
            scaleY: [1, 1.05, 1, 0.98, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  )
}

const Home = ({ setCommissionOpen }) => {
  const heroTextRef = useRef(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse for reactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Rotate words every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useLayoutEffect(() => {
    // Reset elements to visible state first
    const words = heroTextRef.current?.querySelectorAll('.hero-title .word')
    const subtitle = heroTextRef.current?.querySelector('.hero-subtitle')
    const cta = heroTextRef.current?.querySelector('.hero-cta')
    
    if (words) {
      gsap.set(words, { y: 0, opacity: 1 })
    }
    if (subtitle) {
      gsap.set(subtitle, { y: 0, opacity: 1 })
    }
    if (cta) {
      gsap.set(cta, { y: 0, opacity: 1 })
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero text on load
      gsap.fromTo(
        '.hero-title .word',
        { y: 60, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.2
        }
      )

      gsap.fromTo(
        '.hero-subtitle',
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.5
        }
      )

      gsap.fromTo(
        '.hero-cta',
        { y: 15, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.7
        }
      )
    }, heroTextRef)

    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Cards */}
      <DiagonalCards />

      {/* Hero Content Overlay */}
      <div className="hero" ref={heroTextRef}>
        {/* Reactive gradient orbs */}
        <motion.div 
          className="reactive-orb reactive-orb--1"
          animate={{
            x: mousePosition.x * 30,
            y: mousePosition.y * 30,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div 
          className="reactive-orb reactive-orb--2"
          animate={{
            x: mousePosition.x * -40,
            y: mousePosition.y * -40,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
        />
        
        <div className="hero__content">
          {/* Main Title */}
          <h1 className="hero-title">
            <span className="word"><FluidText text="Euphoria" /></span>{' '}
            <span className="word accent rotating-word-container">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  className="rotating-word"
                  initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  {rotatingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            {artistInfo.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <Link to="/gallery" className="btn btn--primary">
              View Portfolio
            </Link>
            <button 
              className="btn btn--secondary"
              onClick={() => setCommissionOpen(true)}
            >
              Request Commission
            </button>
          </div>
        </div>

        {/* Social Links - Bottom Left */}
        <div className="hero__social">
          <a 
            href={artistInfo.social.instagram}
            target="_blank" 
            rel="noopener noreferrer"
          >
            INSTAGRAM
          </a>
          <a 
            href={artistInfo.social.artstation}
            target="_blank" 
            rel="noopener noreferrer"
          >
            ARTSTATION
          </a>
        </div>

        {/* Commission Badge - Bottom Right */}
        <motion.div 
          className="hero__commission"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          <button 
            className="commission-link"
            onClick={() => setCommissionOpen(true)}
          >
            Available for Commissions
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Home
