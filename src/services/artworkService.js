// ===============================
// ARTWORKS SERVICE
// Handles all artwork-related database operations
// ===============================
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Fallback demo data when Supabase is not configured
const demoArtworks = [
  { id: 1, title: "Ethereal Dreams", category: "abstract", image_url: null, year: 2024, description: "A journey through color and emotion", price: 850, is_sold: false, is_featured: true },
  { id: 2, title: "Golden Hour", category: "landscapes", image_url: null, year: 2024, description: "Capturing the magic of sunset", price: 1200, is_sold: false, is_featured: true },
  { id: 3, title: "Soul Portrait", category: "portraits", image_url: null, year: 2023, description: "The essence of inner beauty", price: 950, is_sold: true, is_featured: false },
  { id: 4, title: "Abstract Flow", category: "abstract", image_url: null, year: 2024, description: "Movement in stillness", price: 750, is_sold: false, is_featured: true },
  { id: 5, title: "Mountain Serenity", category: "landscapes", image_url: null, year: 2024, description: "Peace in the peaks", price: 1100, is_sold: false, is_featured: false },
  { id: 6, title: "Gentle Spirit", category: "portraits", image_url: null, year: 2023, description: "A window to the soul", price: 900, is_sold: false, is_featured: false },
]

// ===============================
// FETCH ALL ARTWORKS
// ===============================
export const fetchArtworks = async (options = {}) => {
  const { category, featured, limit } = options

  if (!isSupabaseConfigured()) {
    console.log('Using demo artwork data')
    let filtered = [...demoArtworks]
    if (category && category !== 'all') {
      filtered = filtered.filter(a => a.category === category)
    }
    if (featured) {
      filtered = filtered.filter(a => a.is_featured)
    }
    if (limit) {
      filtered = filtered.slice(0, limit)
    }
    return { data: filtered, error: null }
  }

  try {
    let query = supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (featured) {
      query = query.eq('is_featured', true)
    }
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return { data: null, error }
  }
}

// ===============================
// FETCH SINGLE ARTWORK BY ID
// ===============================
export const fetchArtworkById = async (id) => {
  if (!isSupabaseConfigured()) {
    const artwork = demoArtworks.find(a => a.id === parseInt(id))
    return { data: artwork || null, error: artwork ? null : 'Not found' }
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return { data: null, error }
  }
}

// ===============================
// FETCH CATEGORIES
// ===============================
export const fetchCategories = async () => {
  if (!isSupabaseConfigured()) {
    return { data: ['all', 'abstract', 'landscapes', 'portraits'], error: null }
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('category')

    if (error) throw error
    
    const uniqueCategories = ['all', ...new Set(data.map(a => a.category))]
    return { data: uniqueCategories, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: ['all'], error }
  }
}

// ===============================
// CREATE ARTWORK (Admin only)
// ===============================
export const createArtwork = async (artworkData) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .insert([artworkData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating artwork:', error)
    return { data: null, error }
  }
}

// ===============================
// UPDATE ARTWORK (Admin only)
// ===============================
export const updateArtwork = async (id, updates) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating artwork:', error)
    return { data: null, error }
  }
}

// ===============================
// DELETE ARTWORK (Admin only)
// ===============================
export const deleteArtwork = async (id) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error deleting artwork:', error)
    return { data: null, error }
  }
}
