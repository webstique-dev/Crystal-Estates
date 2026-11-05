'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Maximize2,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera,
  Layers,
  Plane,
  Video,
} from 'lucide-react'
import { Container, Section, Badge, Button } from '../ui'
import { galleryCategories, galleryMedia } from '../../data/galleryData'

export default function GalleryClientView() {
  const [activeTab, setActiveTab] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

  const filteredMedia =
    activeTab === 'All'
      ? galleryMedia
      : galleryMedia.filter((item) => item.category === activeTab)

  const openMedia = (item, idx) => {
    if (item.category === 'Videos' && item.videoUrl) {
      setActiveVideo(item)
    } else {
      setLightboxIndex(idx)
    }
  }

  const closeLightbox = () => setLightboxIndex(null)
  const closeVideoModal = () => setActiveVideo(null)

  const nextImage = useCallback(
    () => setLightboxIndex((prev) => (prev + 1) % filteredMedia.length),
    [filteredMedia.length]
  )
  const prevImage = useCallback(
    () =>
      setLightboxIndex(
        (prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length
      ),
    [filteredMedia.length]
  )

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        closeLightbox()
        closeVideoModal()
      }
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, nextImage, prevImage])

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Site Photos':
        return <Camera size={14} />
      case 'Layouts':
        return <Layers size={14} />
      case 'Drone Views':
        return <Plane size={14} />
      case 'Videos':
        return <Video size={14} />
      default:
        return null
    }
  }

  return (
    <Section>
      <Container>
        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '36px',
          }}
        >
          {galleryCategories.map((cat) => {
            const isActive = activeTab === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '999px',
                  border: isActive ? '1.5px solid var(--gold)' : '1px solid var(--line)',
                  background: isActive ? 'var(--green-900)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(15, 61, 46, 0.2)' : 'none',
                }}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            )
          })}
        </div>

        {/* Responsive Masonry / Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredMedia.map((item, idx) => {
            const isVideo = item.category === 'Videos'
            return (
              <div
                key={item.id}
                onClick={() => openMedia(item, idx)}
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid rgba(227, 221, 209, 0.85)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: '220px',
                    overflow: 'hidden',
                    background: '#ece7dd',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    <Badge tone={isVideo ? 'gold' : 'dark'}>{item.category}</Badge>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isVideo ? 'var(--gold)' : 'rgba(15, 61, 46, 0.9)',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {isVideo ? <Play size={18} fill="currentColor" /> : <Maximize2 size={16} />}
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={13} color="var(--gold)" />
                    {item.location}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      color: 'var(--green-900)',
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13.5px',
                      color: 'var(--ink-2)',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    {item.caption}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>

      {/* Image Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Previous Image"
          >
            <ChevronLeft size={28} />
          </button>

          <div
            style={{ maxWidth: '90vw', maxHeight: '85vh', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredMedia[lightboxIndex]?.image}
              alt={filteredMedia[lightboxIndex]?.title}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <div style={{ color: '#ffffff', marginTop: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>
                {filteredMedia[lightboxIndex]?.title}
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                {filteredMedia[lightboxIndex]?.caption}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Next Image"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={closeVideoModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              background: '#111827',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                {activeVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

