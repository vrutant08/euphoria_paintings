// ===============================
// USE COMMISSION HOOK
// React hook for handling commission requests
// ===============================
import { useState } from 'react'
import { submitCommissionRequest } from '../services/commissionService'

export const useCommission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (commissionData) => {
    setIsSubmitting(true)
    setError(null)

    const { data, error: submitError } = await submitCommissionRequest(commissionData)

    if (submitError) {
      setError(submitError)
      setIsSubmitting(false)
      return false
    }

    setSubmitted(true)
    setIsSubmitting(false)
    return true
  }

  const reset = () => {
    setSubmitted(false)
    setError(null)
  }

  return { submit, isSubmitting, submitted, error, reset }
}
