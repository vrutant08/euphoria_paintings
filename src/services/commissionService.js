// ===============================
// COMMISSION SERVICE
// Handles commission requests
// ===============================
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// ===============================
// SUBMIT COMMISSION REQUEST
// ===============================
export const submitCommissionRequest = async (commissionData) => {
  if (!isSupabaseConfigured()) {
    console.log('Demo mode - Commission request:', commissionData)
    // Simulate success in demo mode
    return { 
      data: { ...commissionData, id: Date.now(), status: 'pending' }, 
      error: null 
    }
  }

  try {
    const { data, error } = await supabase
      .from('commissions')
      .insert([{
        ...commissionData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error submitting commission:', error)
    return { data: null, error }
  }
}

// ===============================
// FETCH ALL COMMISSIONS (Admin)
// ===============================
export const fetchCommissions = async (status = null) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null }
  }

  try {
    let query = supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return { data: null, error }
  }
}

// ===============================
// UPDATE COMMISSION STATUS (Admin)
// ===============================
export const updateCommissionStatus = async (id, status) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('commissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating commission:', error)
    return { data: null, error }
  }
}
