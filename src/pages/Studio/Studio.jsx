import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { uploadImage, deleteImage } from '../../services/storageService'
import { createArtwork, fetchArtworks, deleteArtwork, updateArtwork } from '../../services/artworkService'
import { fetchAboutData, updateAboutData } from '../../services/settingsService'
import './Studio.scss'

// Password stored in environment variable for security
const STUDIO_PASSWORD = import.meta.env.VITE_STUDIO_PASSWORD || 'euphoria2024'

const Studio = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('upload')
  const [editingArtwork, setEditingArtwork] = useState(null)
  
  // Form state for artwork
  const [formData, setFormData] = useState({
    title: '',
    category: 'portraits',
    year: new Date().getFullYear().toString(),
    description: '',
    price: '',
    is_featured: false,
    is_sold: false,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // About page state
  const [aboutData, setAboutData] = useState({
    name: '',
    tagline: '',
    subtitle: '',
    bio: ['', ''],
    profileImage: '',
    profileImageFilename: '',
    exhibitions: [{ year: '', name: '', location: '' }],
    tools: [],
    social: { instagram: '', artstation: '' }
  })
  const [aboutProfileFile, setAboutProfileFile] = useState(null)
  const [aboutProfilePreview, setAboutProfilePreview] = useState('')
  const [savingAbout, setSavingAbout] = useState(false)

  // Check for saved session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('euphoria_studio_auth')
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadArtworks()
      loadAboutData()
    }
  }, [isAuthenticated])

  // Load About data
  const loadAboutData = async () => {
    const { data, error } = await fetchAboutData()
    if (data) {
      setAboutData({
        name: data.name || '',
        tagline: data.tagline || '',
        subtitle: data.subtitle || '',
        bio: data.bio || ['', ''],
        profileImage: data.profileImage || '',
        profileImageFilename: data.profileImageFilename || '',
        exhibitions: data.exhibitions?.length > 0 
          ? data.exhibitions 
          : [{ year: '', name: '', location: '' }],
        tools: data.tools || [],
        social: {
          instagram: data.social?.instagram || '',
          artstation: data.social?.artstation || ''
        }
      })
      if (data.profileImage) {
        setAboutProfilePreview(data.profileImage)
      }
    }
  }

  // Auto-dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadArtworks = async () => {
    setLoading(true)
    const { data, error } = await fetchArtworks()
    if (data) {
      setArtworks(data)
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === STUDIO_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('euphoria_studio_auth', 'authenticated')
      setMessage({ type: '', text: '' })
    } else {
      setMessage({ type: 'error', text: 'Incorrect password' })
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('euphoria_studio_auth')
    setPassword('')
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a valid image (JPG, PNG, WebP, GIF)' })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be under 10MB' })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'portraits',
      year: new Date().getFullYear().toString(),
      description: '',
      price: '',
      is_featured: false,
      is_sold: false,
    })
    setSelectedFile(null)
    setPreviewUrl('')
    setEditingArtwork(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile && !editingArtwork) {
      setMessage({ type: 'error', text: 'Please select an image' })
      return
    }

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    try {
      let imageUrl = editingArtwork?.image_url
      let imageFilename = editingArtwork?.image_filename

      // Upload new image if selected
      if (selectedFile) {
        const uploadResult = await uploadImage(selectedFile, 'artworks')
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }

        imageUrl = uploadResult.url
        imageFilename = uploadResult.filename

        // Delete old image if editing
        if (editingArtwork?.image_filename) {
          await deleteImage(editingArtwork.image_filename)
        }
      }

      const artworkData = {
        title: formData.title.trim(),
        category: formData.category,
        year: formData.year,
        description: formData.description.trim(),
        price: formData.price ? parseFloat(formData.price) : null,
        is_featured: formData.is_featured,
        is_sold: formData.is_sold,
        image_url: imageUrl,
        image_filename: imageFilename,
      }

      let result
      if (editingArtwork) {
        result = await updateArtwork(editingArtwork.id, artworkData)
      } else {
        result = await createArtwork(artworkData)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      setMessage({ 
        type: 'success', 
        text: editingArtwork ? 'Artwork updated successfully!' : 'Artwork uploaded successfully!' 
      })
      resetForm()
      loadArtworks()
      setActiveTab('manage')

    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (artwork) => {
    setFormData({
      title: artwork.title || '',
      category: artwork.category || 'portraits',
      year: artwork.year || new Date().getFullYear().toString(),
      description: artwork.description || '',
      price: artwork.price?.toString() || '',
      is_featured: artwork.is_featured || false,
      is_sold: artwork.is_sold || false,
    })
    setPreviewUrl(artwork.image_url || '')
    setEditingArtwork(artwork)
    setActiveTab('upload')
  }

  const handleDelete = async (artwork) => {
    if (!confirm(`Delete "${artwork.title}"? This cannot be undone.`)) {
      return
    }

    try {
      // Delete image from R2
      if (artwork.image_filename) {
        await deleteImage(artwork.image_filename)
      }
      
      // Delete from database
      const result = await deleteArtwork(artwork.id)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setMessage({ type: 'success', text: 'Artwork deleted successfully' })
      loadArtworks()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete artwork: ' + error.message })
    }
  }

  // ===============================
  // ABOUT PAGE HANDLERS
  // ===============================
  const handleAboutProfileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAboutProfileFile(file)
      setAboutProfilePreview(URL.createObjectURL(file))
    }
  }

  const handleAboutSubmit = async (e) => {
    e.preventDefault()
    setSavingAbout(true)
    setMessage({ type: '', text: '' })

    try {
      let profileImageUrl = aboutData.profileImage

      // Upload new profile image if selected
      if (aboutProfileFile) {
        const uploadResult = await uploadImage(aboutProfileFile, 'about')
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload profile image')
        }

        profileImageUrl = uploadResult.url
      }

      // Update about data
      const result = await updateAboutData({
        ...aboutData,
        profileImage: profileImageUrl
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setAboutData({ ...aboutData, profileImage: profileImageUrl })
      setAboutProfileFile(null)
      setMessage({ type: 'success', text: 'About page updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update about page: ' + error.message })
    } finally {
      setSavingAbout(false)
    }
  }

  // ===============================
  // LOGIN SCREEN
  // ===============================
  if (!isAuthenticated) {
    return (
      <motion.div 
        className="studio-login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Floating particles background */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <motion.div 
          className="login-container"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="login-header">
            <motion.div 
              className="logo-icon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🎨
            </motion.div>
            <h1>Artist Studio</h1>
            <p>Welcome back, Jasmine</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
              />
              <div className="input-glow" />
            </div>
            
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Enter Studio</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.button>
          </form>

          <AnimatePresence>
            {message.text && (
              <motion.p 
                className={`message ${message.type}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fixed Back Button - Bottom Right (same as other pages) */}
        <motion.button 
          onClick={() => navigate('/')}
          className="back-link"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="arrow">←</span>
          <span>BACK</span>
        </motion.button>
      </motion.div>
    )
  }

  // ===============================
  // ADMIN DASHBOARD
  // ===============================
  return (
    <motion.div 
      className="studio"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="studio-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🎨</span>
            <div className="logo-text">
              <h1>Euphoria Studio</h1>
              <span className="subtitle">Manage your artworks</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <motion.button 
            className="btn-secondary"
            onClick={() => navigate('/gallery')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View Gallery
          </motion.button>
          
          <motion.button 
            className="btn-ghost"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </motion.button>
        </div>
      </header>

      {/* Message Banner */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            className={`message-banner ${message.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>
              {message.type === 'success' ? '✓' : '!'} {message.text}
            </span>
            <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {editingArtwork ? 'Edit Artwork' : 'Upload Artwork'}
        </button>
        <button 
          className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => { setActiveTab('manage'); resetForm(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Manage ({artworks.length})
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          About Page
        </button>
      </div>

      {/* Content */}
      <div className="studio-content">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'upload' ? (
            <motion.section 
              key="upload"
              className="upload-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <form onSubmit={handleSubmit} className="upload-form">
                {/* Image Upload Area */}
                <div 
                  className={`drop-zone ${dragActive ? 'active' : ''} ${previewUrl ? 'has-image' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="preview-container">
                      <img src={previewUrl} alt="Preview" />
                      <div className="preview-overlay">
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Remove
                        </button>
                        <label className="change-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          Change
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                            hidden
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="drop-content">
                      <div className="drop-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                      <div className="drop-text">
                        <span className="primary">Drop your artwork here</span>
                        <span className="secondary">or click to browse</span>
                      </div>
                      <span className="file-info">JPG, PNG, WebP, GIF • Max 10MB</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>
                  )}
                </div>

                {/* Form Fields */}
                <div className="form-fields">
                  <div className="form-group full">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter artwork title"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="portraits">Portraits</option>
                        <option value="landscapes">Landscapes</option>
                        <option value="abstract">Abstract</option>
                        <option value="still-life">Still Life</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Year</label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="2024"
                      />
                    </div>

                    <div className="form-group">
                      <label>Price (€)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="form-group full">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell the story behind this artwork..."
                      rows={4}
                    />
                  </div>

                  <div className="form-row checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark" />
                      <span>Featured on homepage</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_sold"
                        checked={formData.is_sold}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark" />
                      <span>Mark as sold</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  {editingArtwork && (
                    <motion.button 
                      type="button"
                      className="btn-secondary"
                      onClick={resetForm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel Edit
                    </motion.button>
                  )}
                  
                  <motion.button 
                    type="submit"
                    className="btn-primary"
                    disabled={uploading}
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                  >
                    {uploading ? (
                      <>
                        <div className="spinner" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>{editingArtwork ? 'Update Artwork' : 'Upload Artwork'}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.section>
          ) : activeTab === 'manage' ? (
            <motion.section 
              key="manage"
              className="manage-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {loading ? (
                <div className="loading-state">
                  <div className="spinner large" />
                  <p>Loading artworks...</p>
                </div>
              ) : artworks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🖼️</div>
                  <h3>No artworks yet</h3>
                  <p>Upload your first masterpiece to get started!</p>
                  <motion.button 
                    className="btn-primary"
                    onClick={() => setActiveTab('upload')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Upload Artwork
                  </motion.button>
                </div>
              ) : (
                <div className="artworks-grid">
                  {artworks.map((artwork, index) => (
                    <motion.article 
                      key={artwork.id}
                      className="artwork-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <div className="artwork-image">
                        {artwork.image_url ? (
                          <img src={artwork.image_url} alt={artwork.title} />
                        ) : (
                          <div className="no-image">
                            <span>🖼️</span>
                          </div>
                        )}
                        {artwork.is_sold && (
                          <div className="sold-badge">Sold</div>
                        )}
                        {artwork.is_featured && (
                          <div className="featured-badge">★</div>
                        )}
                      </div>
                      
                      <div className="artwork-info">
                        <h3>{artwork.title}</h3>
                        <div className="meta">
                          <span className="category">{artwork.category}</span>
                          {artwork.year && <span className="year">{artwork.year}</span>}
                          {artwork.price && <span className="price">€{artwork.price}</span>}
                        </div>
                      </div>
                      
                      <div className="artwork-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(artwork)}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(artwork)}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          ) : activeTab === 'about' ? (
            <motion.section 
              key="about"
              className="about-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <form onSubmit={handleAboutSubmit} className="about-form">
                <h2 className="section-title">Edit About Page</h2>
                
                {/* Profile Image */}
                <div className="about-form-group">
                  <label>Profile Photo</label>
                  <div className="profile-image-upload">
                    <div className="profile-preview">
                      {aboutProfilePreview ? (
                        <img src={aboutProfilePreview} alt="Profile" />
                      ) : (
                        <div className="no-image">👤</div>
                      )}
                    </div>
                    <div className="profile-actions">
                      <label className="upload-btn">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAboutProfileChange}
                          hidden
                        />
                        Choose Photo
                      </label>
                      {aboutProfilePreview && (
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => { setAboutProfileFile(null); setAboutProfilePreview(''); }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="about-form-group">
                  <label>Artist Name</label>
                  <input
                    type="text"
                    value={aboutData.name}
                    onChange={(e) => setAboutData({ ...aboutData, name: e.target.value })}
                    placeholder="Jasmine Konsoula"
                  />
                </div>

                {/* Tagline */}
                <div className="about-form-group">
                  <label>Tagline</label>
                  <input
                    type="text"
                    value={aboutData.tagline}
                    onChange={(e) => setAboutData({ ...aboutData, tagline: e.target.value })}
                    placeholder="Visual Poetry"
                  />
                </div>

                {/* Subtitle */}
                <div className="about-form-group">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    value={aboutData.subtitle}
                    onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                    placeholder="Exploring the ethereal boundary..."
                  />
                </div>

                {/* Bio Paragraphs */}
                <div className="about-form-group">
                  <label>Bio (Paragraph 1)</label>
                  <textarea
                    value={aboutData.bio[0] || ''}
                    onChange={(e) => {
                      const newBio = [...aboutData.bio]
                      newBio[0] = e.target.value
                      setAboutData({ ...aboutData, bio: newBio })
                    }}
                    placeholder="First paragraph about yourself..."
                    rows={4}
                  />
                </div>

                <div className="about-form-group">
                  <label>Bio (Paragraph 2)</label>
                  <textarea
                    value={aboutData.bio[1] || ''}
                    onChange={(e) => {
                      const newBio = [...aboutData.bio]
                      newBio[1] = e.target.value
                      setAboutData({ ...aboutData, bio: newBio })
                    }}
                    placeholder="Second paragraph about yourself..."
                    rows={4}
                  />
                </div>

                {/* Tools */}
                <div className="about-form-group">
                  <label>Tools (comma separated)</label>
                  <input
                    type="text"
                    value={aboutData.tools?.join(', ') || ''}
                    onChange={(e) => setAboutData({ 
                      ...aboutData, 
                      tools: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    placeholder="Procreate, Photoshop, Traditional Oil"
                  />
                </div>

                {/* Social Links */}
                <div className="about-form-row">
                  <div className="about-form-group">
                    <label>Instagram URL</label>
                    <input
                      type="url"
                      value={aboutData.social?.instagram || ''}
                      onChange={(e) => setAboutData({ 
                        ...aboutData, 
                        social: { ...aboutData.social, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="about-form-group">
                    <label>ArtStation URL</label>
                    <input
                      type="url"
                      value={aboutData.social?.artstation || ''}
                      onChange={(e) => setAboutData({ 
                        ...aboutData, 
                        social: { ...aboutData.social, artstation: e.target.value }
                      })}
                      placeholder="https://artstation.com/..."
                    />
                  </div>
                </div>

                {/* Exhibitions */}
                <div className="about-form-group">
                  <label>Exhibitions</label>
                  <div className="exhibitions-list">
                    {aboutData.exhibitions?.map((exhibition, index) => (
                      <div key={index} className="exhibition-row">
                        <input
                          type="text"
                          value={exhibition.year || ''}
                          onChange={(e) => {
                            const newExhibitions = [...aboutData.exhibitions]
                            newExhibitions[index] = { ...exhibition, year: e.target.value }
                            setAboutData({ ...aboutData, exhibitions: newExhibitions })
                          }}
                          placeholder="Year"
                          className="year-input"
                        />
                        <input
                          type="text"
                          value={exhibition.name || ''}
                          onChange={(e) => {
                            const newExhibitions = [...aboutData.exhibitions]
                            newExhibitions[index] = { ...exhibition, name: e.target.value }
                            setAboutData({ ...aboutData, exhibitions: newExhibitions })
                          }}
                          placeholder="Exhibition Name"
                        />
                        <input
                          type="text"
                          value={exhibition.location || ''}
                          onChange={(e) => {
                            const newExhibitions = [...aboutData.exhibitions]
                            newExhibitions[index] = { ...exhibition, location: e.target.value }
                            setAboutData({ ...aboutData, exhibitions: newExhibitions })
                          }}
                          placeholder="Location"
                        />
                        <button
                          type="button"
                          className="remove-exhibition"
                          onClick={() => {
                            const newExhibitions = aboutData.exhibitions.filter((_, i) => i !== index)
                            setAboutData({ ...aboutData, exhibitions: newExhibitions })
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-exhibition"
                      onClick={() => setAboutData({ 
                        ...aboutData, 
                        exhibitions: [...(aboutData.exhibitions || []), { year: '', name: '', location: '' }]
                      })}
                    >
                      + Add Exhibition
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                  <motion.button 
                    type="submit"
                    className="btn-primary"
                    disabled={savingAbout}
                    whileHover={{ scale: savingAbout ? 1 : 1.02 }}
                    whileTap={{ scale: savingAbout ? 1 : 0.98 }}
                  >
                    {savingAbout ? (
                      <>
                        <div className="spinner" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                          <polyline points="17 21 17 13 7 13 7 21"/>
                          <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Studio
