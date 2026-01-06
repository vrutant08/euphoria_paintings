// ===============================
// USE ARTWORKS HOOK
// React hook for fetching and managing artworks
// ===============================
import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchArtworks, fetchArtworkById, fetchCategories } from '../services/artworkService'

// Transform artwork data to match frontend expected format
const transformArtwork = (artwork) => {
  if (!artwork) return null
  return {
    ...artwork,
    // Map database field to frontend field
    image: artwork.image_url || artwork.image || null,
  }
}

export const useArtworks = (options = {}) => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  const loadArtworks = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await fetchArtworks(options)
      
      if (!isMounted.current) return
      
      if (fetchError) {
        setError(fetchError)
      } else {
        // Transform each artwork to include 'image' field
        const transformedData = (data || []).map(transformArtwork)
        setArtworks(transformedData)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [options.category, options.featured, options.limit])

  useEffect(() => {
    isMounted.current = true
    loadArtworks()
    
    return () => {
      isMounted.current = false
    }
  }, [loadArtworks])

  return { artworks, loading, error, refetch: loadArtworks }
}

export const useArtwork = (id) => {
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    
    const loadArtwork = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const { data, error: fetchError } = await fetchArtworkById(id)
        
        if (!isMounted) return
        
        if (fetchError) {
          setError(fetchError)
        } else {
          // Transform artwork to include 'image' field
          setArtwork(transformArtwork(data))
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadArtwork()
    
    return () => {
      isMounted = false
    }
  }, [id])

  return { artwork, loading, error }
}

export const useCategories = () => {
  const [categories, setCategories] = useState(['all'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const loadCategories = async () => {
      try {
        const { data } = await fetchCategories()
        if (isMounted) {
          setCategories(data || ['all'])
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) setLoading(false)
      }
    }

    loadCategories()
    
    return () => {
      isMounted = false
    }
  }, [])

  return { categories, loading }
}
