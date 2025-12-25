import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projectTypes } from '../../data/artworks'
import './CommissionModal.scss'

const CommissionModal = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Personal Portrait',
    vision: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call - Replace with actual backend
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Commission Request:', formData)
    setSubmitted(true)
    setIsSubmitting(false)
    
    // Reset after showing success
    setTimeout(() => {
      setIsOpen(false)
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        projectType: 'Personal Portrait',
        vision: ''
      })
    }, 2000)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSubmitted(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="commission-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="commission-modal__backdrop"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="commission-modal__content"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              className="commission-modal__close"
              onClick={handleClose}
              aria-label="Close modal"
            >
              ×
            </button>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="commission-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="success-icon">✓</div>
                  <h3>Request Sent!</h3>
                  <p>I'll get back to you within 48 hours.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="commission-modal__header">
                    <h2 className="commission-title">Commission Request</h2>
                    <p className="commission-subtitle">Have a vision? Let's bring it to life.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="commission-form">
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
                      <label htmlFor="vision">VISION DETAILS</label>
                      <textarea
                        id="vision"
                        name="vision"
                        placeholder="Describe what you have in mind..."
                        rows={4}
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
                      {isSubmitting ? (
                        <span className="loading-dots">Sending...</span>
                      ) : (
                        'Send Request'
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommissionModal
