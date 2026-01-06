// ===============================
// USE CONTACT FORM HOOK
// React hook for handling contact form submission
// ===============================
import { useState } from 'react'
import { submitContactForm } from '../services/contactService'

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    const { success, error: submitError } = await submitContactForm(formData)

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
