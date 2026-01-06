// ===============================
// SITE SETTINGS SERVICE
// Handles site settings including About page data
// ===============================
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Default about data (fallback)
const defaultAboutData = {
  name: "Jasmine Konsoula",
  artistName: "Euphoria Paintings",
  tagline: "Visual Poetry",
  subtitle: "Exploring the ethereal boundary between reality and imagination through digital oil & light.",
  bio: [
    "I am a digital artist based in the clouds, obsessed with the texture of oil paint and the infinite possibilities of pixels. My work explores the intersection of classic romanticism and futuristic surrealism.",
    "When I'm not painting, I'm researching color theory or drinking too much coffee. I believe art should not just be seen, but felt—a fleeting emotion captured in a static frame."
  ],
  profileImage: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=1000&fit=crop",
  exhibitions: [
    { year: "2024", name: "Neon Dreams", location: "NYC" },
    { year: "2023", name: "Digital Soul", location: "London" },
    { year: "2022", name: "The Void", location: "Online" }
  ],
  tools: ["Procreate", "Photoshop", "Blender 3D", "Traditional Oil"],
  social: {
    instagram: "https://instagram.com/euphoria_paintings",
    artstation: "https://artstation.com/euphoria_paintings"
  }
}

// ===============================
// FETCH ABOUT DATA
// ===============================
export const fetchAboutData = async () => {
  if (!isSupabaseConfigured()) {
    console.log('Using default about data')
    return { data: defaultAboutData, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'artist_name',
        'tagline', 
        'subtitle',
        'bio',
        'profile_image',
        'profile_image_filename',
        'exhibitions',
        'tools',
        'social_instagram',
        'social_artstation'
      ])

    if (error) throw error

    // If no data, return defaults
    if (!data || data.length === 0) {
      return { data: defaultAboutData, error: null }
    }

    // Transform array of {key, value} to object
    const settings = {}
    data.forEach(item => {
      try {
        // Try to parse JSON values
        settings[item.key] = JSON.parse(item.value)
      } catch {
        settings[item.key] = item.value
      }
    })

    // Build about data from settings
    const aboutData = {
      name: settings.artist_name || defaultAboutData.name,
      tagline: settings.tagline || defaultAboutData.tagline,
      subtitle: settings.subtitle || defaultAboutData.subtitle,
      bio: settings.bio || defaultAboutData.bio,
      profileImage: settings.profile_image || defaultAboutData.profileImage,
      profileImageFilename: settings.profile_image_filename || null,
      exhibitions: settings.exhibitions || defaultAboutData.exhibitions,
      tools: settings.tools || defaultAboutData.tools,
      social: {
        instagram: settings.social_instagram || defaultAboutData.social.instagram,
        artstation: settings.social_artstation || defaultAboutData.social.artstation
      }
    }

    return { data: aboutData, error: null }
  } catch (error) {
    console.error('Error fetching about data:', error)
    return { data: defaultAboutData, error }
  }
}

// ===============================
// UPDATE ABOUT DATA
// ===============================
export const updateAboutData = async (aboutData) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    // Prepare settings to upsert
    const settings = [
      { key: 'artist_name', value: aboutData.name },
      { key: 'tagline', value: aboutData.tagline },
      { key: 'subtitle', value: aboutData.subtitle },
      { key: 'bio', value: JSON.stringify(aboutData.bio) },
      { key: 'profile_image', value: aboutData.profileImage },
      { key: 'profile_image_filename', value: aboutData.profileImageFilename || '' },
      { key: 'exhibitions', value: JSON.stringify(aboutData.exhibitions) },
      { key: 'tools', value: JSON.stringify(aboutData.tools) },
      { key: 'social_instagram', value: aboutData.social?.instagram || '' },
      { key: 'social_artstation', value: aboutData.social?.artstation || '' }
    ]

    // Upsert each setting
    for (const setting of settings) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { 
            key: setting.key, 
            value: setting.value,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        )
      
      if (error) throw error
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating about data:', error)
    return { data: null, error: error.message || 'Failed to update settings' }
  }
}

// ===============================
// GET SINGLE SETTING
// ===============================
export const getSetting = async (key) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) throw error
    
    try {
      return { data: JSON.parse(data.value), error: null }
    } catch {
      return { data: data.value, error: null }
    }
  } catch (error) {
    console.error('Error fetching setting:', error)
    return { data: null, error }
  }
}

// ===============================
// UPDATE SINGLE SETTING
// ===============================
export const updateSetting = async (key, value) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { 
          key, 
          value: stringValue,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )

    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating setting:', error)
    return { data: null, error }
  }
}
