// ===============================
// USE ARTWORKS HOOK
// React hook for fetching and managing artworks
// ===============================
import { useState, useEffect, useCallback } from 'react'
import { fetchArtworks, fetchArtworkById, fetchCategories } from '../services/artworkService'

export const useArtworks = (options = {}) => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadArtworks = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const { data, error: fetchError } = await fetchArtworks(options)
    
    if (fetchError) {
      setError(fetchError)
    } else {
      setArtworks(data || [])
    }
    
    setLoading(false)
  }, [options.category, options.featured, options.limit])

  useEffect(() => {
    loadArtworks()
  }, [loadArtworks])

  return { artworks, loading, error, refetch: loadArtworks }
}

export const useArtwork = (id) => {
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadArtwork = async () => {
      if (!id) return
      
      setLoading(true)
      const { data, error: fetchError } = await fetchArtworkById(id)
      
      if (fetchError) {
        setError(fetchError)
      } else {
        setArtwork(data)
      }
      
      setLoading(false)
    }

    loadArtwork()
  }, [id])

  return { artwork, loading, error }
}

export const useCategories = () => {
  const [categories, setCategories] = useState(['all'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await fetchCategories()
      setCategories(data || ['all'])
      setLoading(false)
    }

    loadCategories()
  }, [])

  return { categories, loading }
}
