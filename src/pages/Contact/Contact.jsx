import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { artistInfo, projectTypes } from '../../data/artworks'
import './Contact.scss'

// Animated input field with floating label
const AnimatedInput = ({ label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = props.value && props.value.length > 0
  
  return (
    <div className={`animated-input ${isFocused || hasValue ? 'active' : ''}`}>
      <motion.label
        animate={{
          y: isFocused || hasValue ? -25 : 0,
          scale: isFocused || hasValue ? 0.85 : 1,
          color: isFocused ? '#ff6b9d' : 'rgba(255,255,255,0.5)'
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <input 
        {...props} 
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
      />
      <motion.div 
        className="input-line"
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

const Contact = () => {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const formRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Personal Portrait',
    budget: '',
    vision: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call - Replace with actual backend
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Contact Form:', formData)
    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <motion.div
      className="contact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background decorations */}
      <div className="contact-bg-decor">
        <motion.div 
          className="contact-orb contact-orb--1"
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="contact-orb contact-orb--2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.35, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.div 
          className="contact-line contact-line--1"
          animate={{ 
            scaleX: [0.3, 1, 0.3],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="contact-ring contact-ring--1"
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="contact__container">
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

        <div className="contact__grid">
          {/* Info Section */}
          <motion.div 
            className="contact-info"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.h1 
              className="contact-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Let's Create <span className="accent">Together</span>
            </motion.h1>
            
            <motion.p 
              className="contact-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Whether you have a clear vision or just a spark of an idea, 
              I'd love to hear about your project. Every commission begins 
              with a conversation.
            </motion.p>

            <div className="contact-details">
              <div className="detail-item">
                <span className="label">Response Time</span>
                <span className="value">Within 48 hours</span>
              </div>
              <div className="detail-item">
                <span className="label">Availability</span>
                <span className="value available">Open for commissions</span>
              </div>
            </div>

            <div className="contact-links">
              <p className="links-label">Or reach out directly:</p>
              <a href="mailto:hello@euphoriapaintings.com" className="email-link">
                hello@euphoriapaintings.com
              </a>
              <div className="social-links">
                <a href={artistInfo.social.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href={artistInfo.social.artstation} target="_blank" rel="noopener noreferrer">
                  ArtStation
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div 
            className="contact-form-wrapper"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. I'll get back to you within 48 hours.</p>
                <button 
                  className="btn btn--secondary"
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: '',
                      email: '',
                      projectType: 'Personal Portrait',
                      budget: '',
                      vision: ''
                    })
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">NAME</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">EMAIL</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="projectType">PROJECT TYPE</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                    >
                      {projectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="budget">BUDGET RANGE (Optional)</label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                    >
                      <option value="">Select range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000+">$5,000+</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="vision">YOUR VISION</label>
                  <textarea
                    id="vision"
                    name="vision"
                    placeholder="Tell me about your project... What inspires you? What emotions do you want to capture? Any reference images or artists you admire?"
                    rows={6}
                    value={formData.vision}
                    onChange={handleChange}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Contact
