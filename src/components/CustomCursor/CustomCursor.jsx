import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './CustomCursor.scss'

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateCursorType = () => {
      const hoveredElement = document.elementFromPoint(position.x, position.y)
      if (hoveredElement) {
        const isClickable = 
          hoveredElement.tagName === 'BUTTON' ||
          hoveredElement.tagName === 'A' ||
          hoveredElement.closest('button') ||
          hoveredElement.closest('a') ||
          hoveredElement.classList.contains('clickable') ||
          window.getComputedStyle(hoveredElement).cursor === 'pointer'
        
        setIsPointer(isClickable)
      }
    }

    const handleMouseEnter = () => setIsHidden(false)
    const handleMouseLeave = () => setIsHidden(true)

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseover', updateCursorType)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', updateCursorType)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [position.x, position.y])

  return (
    <>
      <motion.div
        className={`cursor cursor--dot ${isHidden ? 'hidden' : ''}`}
        style={{
          x: position.x - 4,
          y: position.y - 4,
        }}
        animate={{
          scale: isPointer ? 0 : 1
        }}
        transition={{
          scale: { duration: 0.15 }
        }}
      />
      <motion.div
        className={`cursor cursor--ring ${isHidden ? 'hidden' : ''}`}
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isPointer ? 1.5 : 1
        }}
        transition={{
          x: { duration: 0.1, ease: "linear" },
          y: { duration: 0.1, ease: "linear" },
          scale: { duration: 0.15 }
        }}
      />
    </>
  )
}

export default CustomCursor
