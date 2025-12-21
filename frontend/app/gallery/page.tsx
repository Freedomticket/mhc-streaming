'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Realm = 'all' | 'inferno' | 'purgatorio' | 'paradiso'

interface GalleryItem {
  id: number
  title: string
  realm: 'inferno' | 'purgatorio' | 'paradiso'
  imagePath: string
  artist: string
  description: string
}

export default function GalleryPage() {
  const [selectedRealm, setSelectedRealm] = useState<Realm>('all')

  const galleryItems: GalleryItem[] = [
    // Inferno Items
    { id: 1, title: "Dante's Inferno Circle", realm: 'inferno', imagePath: '/images/dante\'s-inferno-circle-pic.png', artist: 'Classical', description: 'The nine circles of Hell' },
    { id: 2, title: 'Dark Passion 1', realm: 'inferno', imagePath: '/images/img1.png', artist: 'Unknown', description: 'Realm of fire and torment' },
    { id: 3, title: 'Dark Passion 2', realm: 'inferno', imagePath: '/images/img2.png', artist: 'Unknown', description: 'Shadows and flame' },
    { id: 4, title: 'Dark Passion 3', realm: 'inferno', imagePath: '/images/img3.png', artist: 'Unknown', description: 'Eternal suffering' },
    { id: 5, title: 'Dark Vision 1', realm: 'inferno', imagePath: '/images/img4.png', artist: 'Unknown', description: 'Descent into darkness' },
    { id: 6, title: 'Dark Vision 2', realm: 'inferno', imagePath: '/images/img5.png', artist: 'Unknown', description: 'Infernal landscapes' },
    { id: 7, title: 'Dark Vision 3', realm: 'inferno', imagePath: '/images/img6.png', artist: 'Unknown', description: 'Abyss of despair' },
    
    // Purgatorio Items
    { id: 8, title: 'Rising Spirit 1', realm: 'purgatorio', imagePath: '/images/img8.png', artist: 'Unknown', description: 'Realm of transformation' },
    { id: 9, title: 'Rising Spirit 2', realm: 'purgatorio', imagePath: '/images/img9.png', artist: 'Unknown', description: 'Path to redemption' },
    { id: 10, title: 'Mist & Growth 1', realm: 'purgatorio', imagePath: '/images/img10.png', artist: 'Unknown', description: 'Ascending through trials' },
    { id: 11, title: 'Mist & Growth 2', realm: 'purgatorio', imagePath: '/images/img11.png', artist: 'Unknown', description: 'Purification journey' },
    { id: 12, title: 'Ethereal Journey 1', realm: 'purgatorio', imagePath: '/images/img12.png', artist: 'Unknown', description: 'Between realms' },
    { id: 13, title: 'Ethereal Journey 2', realm: 'purgatorio', imagePath: '/images/img13.png', artist: 'Unknown', description: 'Hope and change' },
    { id: 14, title: 'Transformation', realm: 'purgatorio', imagePath: '/images/img14.png', artist: 'Unknown', description: 'Renewal of spirit' },
    
    // Paradiso Items
    { id: 15, title: 'Divine Light 1', realm: 'paradiso', imagePath: '/images/img15.png', artist: 'Unknown', description: 'Celestial glory' },
    { id: 16, title: 'Divine Light 2', realm: 'paradiso', imagePath: '/images/img16.png', artist: 'Unknown', description: 'Heaven\'s radiance' },
    { id: 17, title: 'Celestial Harmony 1', realm: 'paradiso', imagePath: '/images/img17.png', artist: 'Unknown', description: 'Perfect peace' },
    { id: 18, title: 'Celestial Harmony 2', realm: 'paradiso', imagePath: '/images/img18.png', artist: 'Unknown', description: 'Divine order' },
    { id: 19, title: 'Golden Paradise 1', realm: 'paradiso', imagePath: '/images/img19.png', artist: 'Unknown', description: 'Eternal bliss' },
    { id: 20, title: 'Golden Paradise 2', realm: 'paradiso', imagePath: '/images/img20.png', artist: 'Unknown', description: 'Sacred light' },
    { id: 21, title: 'Heavenly Vision', realm: 'paradiso', imagePath: '/images/img21.png', artist: 'Unknown', description: 'Ultimate enlightenment' },
  ]

  const filteredItems = selectedRealm === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.realm === selectedRealm)

  const realmStyles = {
    inferno: 'bg-inferno-charcoal border-paradiso-gold',
    purgatorio: 'bg-purgatorio-dark border-purgatorio-mist',
    paradiso: 'bg-paradiso-pearl border-paradiso-gold'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      <div className="container-responsive py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-etched text-h1 mb-4 text-shadow-inferno">
            Dante's Realms Gallery
          </h1>
          <p className="text-xl text-purgatorio-mist mb-2">
            Journey through Inferno, Purgatorio, and Paradiso
          </p>
          <p className="text-sm text-gray-500">
            Visual interpretations of Dante's Divine Comedy
          </p>
        </div>

        {/* Realm Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => setSelectedRealm('all')}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
              selectedRealm === 'all'
                ? 'btn-inferno scale-105'
                : 'btn-secondary-inferno'
            }`}
          >
            All Realms ({galleryItems.length})
          </button>
          <button
            onClick={() => setSelectedRealm('inferno')}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
              selectedRealm === 'inferno'
                ? 'bg-paradiso-gold text-black scale-105'
                : 'btn-secondary-inferno'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 7 6 7 11C7 14 9 16 12 16C15 16 17 14 17 11C17 6 12 2 12 2Z M12 14C11 14 10 13 10 11.5C10 9.5 12 7 12 7C12 7 14 9.5 14 11.5C14 13 13 14 12 14Z"/>
            </svg>
            Inferno ({galleryItems.filter(i => i.realm === 'inferno').length})
          </button>
          <button
            onClick={() => setSelectedRealm('purgatorio')}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
              selectedRealm === 'purgatorio'
                ? 'bg-purgatorio-mist text-black scale-105'
                : 'btn-secondary-inferno'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 15C3 15 5 17 8 17C11 17 13 15 13 15M13 15C13 15 15 17 18 17C21 17 23 15 23 15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Purgatorio ({galleryItems.filter(i => i.realm === 'purgatorio').length})
          </button>
          <button
            onClick={() => setSelectedRealm('paradiso')}
            className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
              selectedRealm === 'paradiso'
                ? 'bg-paradiso-gold text-black scale-105'
                : 'btn-secondary-inferno'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
            </svg>
            Paradiso ({galleryItems.filter(i => i.realm === 'paradiso').length})
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid-gallery">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card-inferno hover-lift group cursor-pointer overflow-hidden`}
            >
              {/* Image */}
              <div className="aspect-square-card relative overflow-hidden rounded-lg mb-4 bg-inferno-ash">
                <Image
                  src={item.imagePath}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Realm Badge Overlay */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`
                    text-xs px-3 py-1 rounded-full font-bold
                    ${item.realm === 'inferno' ? 'badge-inferno' : ''}
                    ${item.realm === 'purgatorio' ? 'badge-purgatorio' : ''}
                    ${item.realm === 'paradiso' ? 'badge-paradiso' : ''}
                  `}>
                    {item.realm.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-paradiso-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  by {item.artist}
                </p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-4">No items in this realm</p>
            <button
              onClick={() => setSelectedRealm('all')}
              className="btn-secondary-inferno"
            >
              View All Realms
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
