import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { fetchArtworks } from '../../services/artworkService'
import './DiagonalCards.scss'

// Placeholder cards for "Coming Soon"
const createPlaceholder = (id) => ({ 
  id: `placeholder-${id}`, 
  title: 'Coming Soon', 
  category: 'artwork', 
  image: null,
  isPlaceholder: true 
})

// Shuffle array randomly (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const DiagonalCards = () => {
  const containerRef = useRef(null)
  const column1Ref = useRef(null)
  const column2Ref = useRef(null)
  const column3Ref = useRef(null)
  const [artworks, setArtworks] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch artworks from Supabase
  useEffect(() => {
    const loadArtworks = async () => {
      const { data, error } = await fetchArtworks()
      if (data && data.length > 0) {
        // Transform and shuffle data
        const transformed = data.map(artwork => ({
          ...artwork,
          image: artwork.image_url || null
        }))
        setArtworks(shuffleArray(transformed))
      } else {
        setArtworks([])
      }
      setIsLoaded(true)
    }
    loadArtworks()
  }, [])

  // Distribute artworks across 3 columns with placeholders for empty slots
  const { column1Data, column2Data, column3Data } = useMemo(() => {
    const minCardsPerColumn = 3 // Minimum cards needed for smooth scrolling
    
    // Shuffle artworks for random distribution
    const shuffled = shuffleArray([...artworks])
    
    // Create column arrays
    const col1 = []
    const col2 = []
    const col3 = []
    
    // Distribute shuffled artworks round-robin style
    shuffled.forEach((artwork, index) => {
      const columnIndex = index % 3
      if (columnIndex === 0) col1.push(artwork)
      else if (columnIndex === 1) col2.push(artwork)
      else col3.push(artwork)
    })
    
    // Fill with placeholders if needed (minimum 3 per column for smooth loop)
    let placeholderId = 0
    while (col1.length < minCardsPerColumn) {
      col1.push(createPlaceholder(placeholderId++))
    }
    while (col2.length < minCardsPerColumn) {
      col2.push(createPlaceholder(placeholderId++))
    }
    while (col3.length < minCardsPerColumn) {
      col3.push(createPlaceholder(placeholderId++))
    }
    
    return { 
      column1Data: col1, 
      column2Data: col2, 
      column3Data: col3 
    }
  }, [artworks])

  // Duplicate for seamless loop
  const duplicatedColumn1 = [...column1Data, ...column1Data, ...column1Data]
  const duplicatedColumn2 = [...column2Data, ...column2Data, ...column2Data]
  const duplicatedColumn3 = [...column3Data, ...column3Data, ...column3Data]

  useEffect(() => {
    // Wait for data to load and refs to be available
    if (!isLoaded || !column1Ref.current || !column2Ref.current || !column3Ref.current) return
    
    const ctx = gsap.context(() => {
      // Column 1 - moves up
      const col1Height = column1Ref.current.scrollHeight / 3
      if (col1Height > 0) {
        gsap.to(column1Ref.current, {
          y: -col1Height,
          duration: 30,
          ease: "none",
          repeat: -1,
          modifiers: {
            y: gsap.utils.unitize(y => parseFloat(y) % col1Height)
          }
        })
      }

      // Column 2 - moves down (starts offset)
      const col2Height = column2Ref.current.scrollHeight / 3
      if (col2Height > 0) {
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
      }

      // Column 3 - moves up (different speed)
      const col3Height = column3Ref.current.scrollHeight / 3
      if (col3Height > 0) {
        gsap.to(column3Ref.current, {
          y: -col3Height,
          duration: 25,
          ease: "none",
          repeat: -1,
          modifiers: {
            y: gsap.utils.unitize(y => parseFloat(y) % col3Height)
          }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isLoaded, artworks])

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
