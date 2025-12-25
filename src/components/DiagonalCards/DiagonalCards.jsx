import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { artworks } from '../../data/artworks'
import './DiagonalCards.scss'

const DiagonalCards = () => {
  const containerRef = useRef(null)
  const column1Ref = useRef(null)
  const column2Ref = useRef(null)
  const column3Ref = useRef(null)

  // Split artworks into 3 columns
  const column1Data = artworks.filter((_, i) => i % 3 === 0)
  const column2Data = artworks.filter((_, i) => i % 3 === 1)
  const column3Data = artworks.filter((_, i) => i % 3 === 2)

  // Duplicate for seamless loop
  const duplicatedColumn1 = [...column1Data, ...column1Data, ...column1Data]
  const duplicatedColumn2 = [...column2Data, ...column2Data, ...column2Data]
  const duplicatedColumn3 = [...column3Data, ...column3Data, ...column3Data]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Column 1 - moves up
      const col1Height = column1Ref.current.scrollHeight / 3
      gsap.to(column1Ref.current, {
        y: -col1Height,
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: {
          y: gsap.utils.unitize(y => parseFloat(y) % col1Height)
        }
      })

      // Column 2 - moves down (starts offset)
      const col2Height = column2Ref.current.scrollHeight / 3
      gsap.set(column2Ref.current, { y: -col2Height })
      gsap.to(column2Ref.current, {
        y: 0,
        duration: 35,
        ease: "none",
        repeat: -1,
        modifiers: {
          y: gsap.utils.unitize(y => {
            const parsed = parseFloat(y)
            return parsed >= 0 ? parsed - col2Height : parsed
          })
        }
      })

      // Column 3 - moves up (different speed)
      const col3Height = column3Ref.current.scrollHeight / 3
      gsap.to(column3Ref.current, {
        y: -col3Height,
        duration: 25,
        ease: "none",
        repeat: -1,
        modifiers: {
          y: gsap.utils.unitize(y => parseFloat(y) % col3Height)
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const renderCard = (artwork, index) => (
    <div key={`${artwork.id}-${index}`} className="diagonal-card">
      <div className="diagonal-card__image-wrapper">
        {artwork.image ? (
          <img 
            src={artwork.image} 
            alt={artwork.title}
            loading="lazy"
          />
        ) : (
          <div className="diagonal-card__placeholder">
            <span className="placeholder-icon">🎨</span>
            <span className="placeholder-text">Artwork</span>
          </div>
        )}
        <div className="diagonal-card__overlay">
          <span className="diagonal-card__title">{artwork.title}</span>
          <span className="diagonal-card__category">{artwork.category}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="diagonal-cards" ref={containerRef}>
      {/* Fade mask overlays */}
      <div className="diagonal-cards__fade diagonal-cards__fade--top" />
      <div className="diagonal-cards__fade diagonal-cards__fade--bottom" />
      
      {/* Three diagonal columns */}
      <div className="diagonal-cards__wrapper">
        {/* Column 1 - Left, tilted left */}
        <div className="diagonal-column diagonal-column--left">
          <div className="diagonal-column__inner" ref={column1Ref}>
            {duplicatedColumn1.map((artwork, i) => renderCard(artwork, i))}
          </div>
        </div>

        {/* Column 2 - Center, straight */}
        <div className="diagonal-column diagonal-column--center">
          <div className="diagonal-column__inner" ref={column2Ref}>
            {duplicatedColumn2.map((artwork, i) => renderCard(artwork, i))}
          </div>
        </div>

        {/* Column 3 - Right, tilted right */}
        <div className="diagonal-column diagonal-column--right">
          <div className="diagonal-column__inner" ref={column3Ref}>
            {duplicatedColumn3.map((artwork, i) => renderCard(artwork, i))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagonalCards
