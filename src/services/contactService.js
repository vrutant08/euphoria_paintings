// ===============================
// CONTACT SERVICE
// Handles contact form submissions
// ===============================
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ===============================
// SUBMIT CONTACT FORM
// ===============================
export const submitContactForm = async (contactData) => {
  if (!isSupabaseConfigured()) {
    console.log('Demo mode - Contact form:', contactData)
    // Simulate success in demo mode
    return { 
      data: { ...contactData, id: Date.now() }, 
      error: null,
      success: true
    }
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: contactData.name,
        email: contactData.email,
        project_type: contactData.projectType,
        budget: contactData.budget,
        message: contactData.vision || contactData.message,
        created_at: new Date().toISOString(),
        is_read: false
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { data: null, error, success: false }
  }
}

// ===============================
// FETCH ALL CONTACTS (Admin)
// ===============================
export const fetchContacts = async (unreadOnly = false) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return { data: null, error }
  }
}

// ===============================
// MARK CONTACT AS READ (Admin)
// ===============================
export const markContactAsRead = async (id) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error marking contact as read:', error)
    return { data: null, error }
  }
}
