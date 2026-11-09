'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  MapPin,
  ArrowLeft,
  FileText,
  FileCheck2,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Download,
  CheckCircle2,
  Video,
  ArrowUpRight,
} from 'lucide-react'
import { Container, Section, Button, Badge } from '../ui'
import EnquiryForm from '../forms/EnquiryForm'
import { ProjectCard } from './ProjectCard'
import PlotViewer from '../plot-viewer/PlotViewer'
import { resolveMapEmbedUrl, resolveMapDirectUrl } from '../../lib/api'

export default function PropertyDetailClient({ initialProject, staticAllProjects = [] }) {
  const [project, setProject] = useState(initialProject)
  const [allProjects, setAllProjects] = useState(staticAllProjects)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Fetch updated project details dynamically from MongoDB
  useEffect(() => {
    fetch('/api/plots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plots) && data.plots.length > 0) {
          setAllProjects(data.plots)

          const found = data.plots.find(
            (p) =>
              p.slug === initialProject?.slug ||
              p.id === initialProject?.id ||
              p.projectId === initialProject?.projectId ||
              p.projectId === initialProject?.id ||
              p._id === initialProject?.id
          )
          if (found) setProject(found)
        }
      })
      .catch(() => {})
  }, [initialProject])

  // Related projects (excluding current)
  const relatedProjects = allProjects
    .filter(
      (p) =>
        p.id !== project.id &&
        p._id !== project.id &&
        (!p.slug || p.slug !== project.slug)
    )
    .slice(0, 3)

  // ─────────────────────────────────────────────────────────────
  // 1. DYNAMIC SECTION 1: PROJECT LAYOUT DATA
  // ─────────────────────────────────────────────────────────────
  const hasLayout = Boolean(
    project.hasLayoutMap ||
    project.layoutImage ||
    project.layoutUrl ||
    project.layoutBackgroundUrl ||
    project.layoutPlan
  )

  // ─────────────────────────────────────────────────────────────
  // 2. DYNAMIC SECTION 2: PROJECT IMAGES & VIDEOS (ONLY REAL DATA)
  // ─────────────────────────────────────────────────────────────
  const rawImages = [
    ...(Array.isArray(project.images) ? project.images : []),
    ...(Array.isArray(project.gallery) ? project.gallery : []),
    ...(typeof project.image === 'string' ? [project.image] : []),
  ].filter((img) => typeof img === 'string' && img.trim().length > 0)

  // Deduplicate while preserving order, zero dummy images
  const projectImages = Array.from(new Set(rawImages))
  const hasImages = projectImages.length > 0

  // Real project videos (support both string URLs and uploaded video objects { name, url, size })
  const rawVideos = []
  if (Array.isArray(project.videos)) {
    project.videos.forEach((v) => {
      if (typeof v === 'string' && v.trim().length > 0) {
        rawVideos.push({ url: v.trim(), name: 'Project Video' })
      } else if (v && typeof v === 'object' && v.url) {
        rawVideos.push({
          url: String(v.url).trim(),
          name: v.name || 'Project Video',
          size: v.size || '',
        })
      }
    })
  }
  ;[project.video, project.videoUrl, project.youtubeUrl, project.video_url].forEach((v) => {
    if (typeof v === 'string' && v.trim().length > 0) {
      rawVideos.push({ url: v.trim(), name: 'Project Video' })
    }
  })

  // Deduplicate by URL
  const seenVideoUrls = new Set()
  const projectVideos = rawVideos.filter((v) => {
    if (!v.url || seenVideoUrls.has(v.url)) return false
    seenVideoUrls.add(v.url)
    return true
  })
  const hasVideos = projectVideos.length > 0
  const hasMedia = hasImages || hasVideos

  // Video embed URL parser
  const getEmbedVideoUrl = (url) => {
    if (!url) return ''
    if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) return url
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/)
    if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    return url
  }

  // ─────────────────────────────────────────────────────────────
  // 3. DYNAMIC SECTION 3: DOCUMENTS DATA (ONLY REAL DATA)
  // ─────────────────────────────────────────────────────────────
  const availableDocuments = []

  // Dynamic documents array from API/DB
  if (Array.isArray(project.documents) && project.documents.length > 0) {
    project.documents.forEach((doc) => {
      if (typeof doc === 'string' && doc.trim().length > 0) {
        availableDocuments.push({ title: doc, desc: null, url: null, isDownload: false })
      } else if (doc && typeof doc === 'object' && (doc.title || doc.name)) {
        availableDocuments.push({
          title: doc.title || doc.name,
          desc: doc.desc || doc.description || null,
          url: doc.url || doc.file || null,
          isDownload: Boolean(doc.url || doc.file),
        })
      }
    })
  }

  // Real brochure URL if provided
  if (project.brochureUrl && typeof project.brochureUrl === 'string') {
    availableDocuments.push({
      title: `${project.name} Official Brochure`,
      desc: 'Verified project documentation, boundary specifications, and extent measurements.',
      url: project.brochureUrl,
      isDownload: true,
    })
  }

  // Real approval credential if provided
  if (project.approval && typeof project.approval === 'string') {
    availableDocuments.push({
      title: project.approval,
      desc: `Official sanction clearance & legal title verification for ${project.name}.`,
      url: project.approvalDocUrl || null,
      isDownload: Boolean(project.approvalDocUrl),
    })
  }

  // Real RERA registration number if provided
  if (project.reraNumber) {
    availableDocuments.push({
      title: `RERA Registration: ${project.reraNumber}`,
      desc: 'Sanctioned layout approval from the Real Estate Regulatory Authority.',
      url: null,
      isDownload: false,
    })
  }

  // Real survey number if provided
  if (project.surveyNumber) {
    availableDocuments.push({
      title: `Revenue Survey Number: ${project.surveyNumber}`,
      desc: 'Official revenue registry village demarcation coordinate.',
      url: null,
      isDownload: false,
    })
  }

  const hasDocuments = availableDocuments.length > 0

  // ─────────────────────────────────────────────────────────────
  // 4. DYNAMIC SECTION 4: MAP LOCATION DATA
  // ─────────────────────────────────────────────────────────────
  const mapLocationInput =
    project.mapLocation ||
    project.mapUrl ||
    project.googleMapsUrl ||
    project.mapEmbedUrl ||
    project.location

  const hasLocation = Boolean(
    (mapLocationInput && typeof mapLocationInput === 'string' && mapLocationInput.trim().length > 0) ||
    project.coordinates
  )

  const mapEmbedSrc = resolveMapEmbedUrl(
    mapLocationInput,
    `${project.location || project.name} Chennai`
  )
  const mapDirectLink = resolveMapDirectUrl(
    mapLocationInput,
    `${project.location || project.name} Chennai`
  )

  // Lightbox navigation
  const openLightbox = (idx) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)
  const nextImage = useCallback(
    () => setLightboxIndex((prev) => (prev + 1) % projectImages.length),
    [projectImages.length]
  )
  const prevImage = useCallback(
    () =>
      setLightboxIndex(
        (prev) => (prev - 1 + projectImages.length) % projectImages.length
      ),
    [projectImages.length]
  )

  // Lightbox keyboard listener
  useEffect(() => {
    if (lightboxIndex === null || projectImages.length === 0) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, nextImage, prevImage, projectImages.length])

  return (
    <>
      <Section>
        {/* Navigation Breadcrumb Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--green-700)',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            <ArrowLeft size={16} /> Back to Projects Directory
          </Link>
        </div>

        {/* Vertical Flow of Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Project Overview Card (Full Width) */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(227, 221, 209, 0.9)',
              borderRadius: '16px',
              padding: 'clamp(24px, 3.5vw, 36px)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
                flexWrap: 'wrap',
              }}
            >
              {project.type && <Badge tone="primary">{project.type}</Badge>}
              {project.approval && <Badge tone="gold">{project.approval}</Badge>}
              {project.location && (
                <span
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={14} color="var(--gold)" />
                  {project.location}
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                color: 'var(--green-950)',
                marginBottom: '14px',
                lineHeight: 1.25,
              }}
            >
              {project.name}
            </h1>

            {project.description && (
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.75',
                  color: 'var(--ink-2)',
                  marginBottom: '24px',
                }}
              >
                {project.description}
              </p>
            )}

            {/* Key Specs Matrix */}
            <div
              style={{
                background: 'var(--bg-soft, #f8f6f0)',
                borderRadius: '12px',
                padding: '20px 24px',
                border: '1px solid var(--line)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                fontSize: '14px',
              }}
            >
              {(project.area || project.plotSizes) && (
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Size / Extent
                  </span>
                  <strong style={{ fontSize: '15px', color: 'var(--green-950)' }}>
                    {project.area || project.plotSizes}
                  </strong>
                </div>
              )}

              {project.plotSizes && (
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Available Plot Sizes
                  </span>
                  <strong style={{ fontSize: '15px', color: 'var(--green-950)' }}>
                    {project.plotSizes}
                  </strong>
                </div>
              )}

              {project.facing && (
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Facing Orientation
                  </span>
                  <strong style={{ fontSize: '15px', color: 'var(--green-950)' }}>
                    {project.facing}
                  </strong>
                </div>
              )}

              {project.status && (
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Availability Status
                  </span>
                  <strong
                    style={{
                      fontSize: '15px',
                      color: project.status === 'Sold Out' ? '#dc2626' : 'var(--green-600)',
                    }}
                  >
                    {project.status}
                  </strong>
                </div>
              )}

              {(project.priceDisplay || project.price) && (
                <div style={{ gridColumn: '1 / -1', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Investment Price
                  </span>
                  <span style={{ fontSize: '20px', color: 'var(--gold-hover)', fontWeight: 700 }}>
                    {project.priceDisplay || `₹ ${(Number(project.price) / 100000).toFixed(1)} Lakhs`}
                  </span>
                </div>
              )}
            </div>

            {/* Highlights (if provided in project data) */}
            {Array.isArray(project.highlights) && project.highlights.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green-900)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Project Highlights:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                  {project.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: 'var(--ink)' }}>
                      <CheckCircle2 size={16} color="var(--green-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 1. PROJECT LAYOUT SECTION (DISPLAYED AT THE TOP IN FULL WIDTH)  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {hasLayout && (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(227, 221, 209, 0.9)',
                borderRadius: '16px',
                padding: 'clamp(24px, 3.5vw, 36px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                  <Layers size={14} />
                  <span>PROJECT LAYOUT</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-950)', margin: '0 0 6px 0' }}>
                  Master Plan &amp; Parcel Layout
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Interactive layout boundaries, parcel extents, internal roads, and live availability for {project.name}.
                </p>
              </div>

              {project.hasLayoutMap ? (
                <div>
                  <PlotViewer />
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button href="/layout-viewer" variant="outline" size="sm">
                      <Maximize2 size={14} />
                      <span>Open Fullscreen Interactive Layout Viewer</span>
                    </Button>
                  </div>
                </div>
              ) : project.layoutImage ? (
                <div
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <img
                    src={project.layoutImage}
                    alt={`${project.name} Master Layout Plan`}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              ) : project.layoutUrl ? (
                <div style={{ padding: '24px', background: 'var(--bg-soft)', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--ink-2)', marginBottom: '14px' }}>
                    Official layout map documentation is available for online viewing.
                  </p>
                  <Button href={project.layoutUrl} variant="primary" size="sm">
                    <Layers size={14} />
                    <span>View Sanctioned Layout Drawing</span>
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2. PROJECT IMAGES & VIDEOS (BELOW LAYOUT IN FULL WIDTH)          */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {hasMedia && (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(227, 221, 209, 0.9)',
                borderRadius: '16px',
                padding: 'clamp(24px, 3.5vw, 36px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                  <Camera size={14} />
                  <span>{hasVideos ? 'PROJECT IMAGES & VIDEOS' : 'PROJECT IMAGES'}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-950)', margin: '0 0 6px 0' }}>
                  {hasVideos ? 'Site Photographs & Video Walkthrough' : 'Site & Property Photographs'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Visual documentation from {project.name}{project.location ? ` in ${project.location}` : ''}.
                </p>
              </div>

              {/* Verified Images Grid */}
              {hasImages && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: projectImages.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {projectImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      style={{
                        position: 'relative',
                        height: projectImages.length === 1 ? '400px' : '260px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid var(--line)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={`${project.name} photo ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(15, 61, 46, 0.85)',
                          color: '#ffffff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Maximize2 size={13} /> Click to expand
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verified Videos Grid (Only if provided in project data) */}
              {hasVideos && (
                <div style={{ marginTop: hasImages ? '28px' : '0' }}>
                  {hasImages && (
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        color: 'var(--green-950)',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Video size={18} color="var(--gold)" />
                      <span>Project Video Walkthrough</span>
                    </h3>
                  )}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: projectVideos.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    {projectVideos.map((vidObj, vIdx) => {
                      const vidUrl = typeof vidObj === 'string' ? vidObj : vidObj.url
                      const vidName = typeof vidObj === 'object' && vidObj.name ? vidObj.name : `Video ${vIdx + 1}`
                      const isDirectVideo =
                        vidUrl.match(/\.(mp4|webm|ogg)($|\?)/i) ||
                        vidUrl.startsWith('/videos/') ||
                        vidUrl.includes('video-')
                      return (
                        <div
                          key={vIdx}
                          style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--line)',
                            background: '#000000',
                            boxShadow: 'var(--shadow-sm)',
                            position: 'relative',
                            aspectRatio: '16 / 9',
                          }}
                        >
                          {isDirectVideo ? (
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              src={vidUrl}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                              suppressHydrationWarning
                            />
                          ) : (
                            <iframe
                              src={getEmbedVideoUrl(vidUrl)}
                              title={`${project.name} ${vidName}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ width: '100%', height: '100%', border: 0 }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 3. DOCUMENTS SECTION (FULL WIDTH)                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {hasDocuments && (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(227, 221, 209, 0.9)',
                borderRadius: '16px',
                padding: 'clamp(24px, 3.5vw, 36px)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                  <FileText size={14} />
                  <span>LEGAL DOCUMENTS &amp; APPROVALS</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-950)', margin: '0 0 6px 0' }}>
                  Legal Documents &amp; Approvals
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                  Verified statutory approvals, registration records, and official documentation available for {project.name}.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '14px',
                }}
              >
                {availableDocuments.map((doc, dIdx) => (
                  <div
                    key={dIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '14px',
                      background: 'var(--bg-soft, #fcfaf6)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'var(--green-50)',
                          color: 'var(--green-900)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <FileCheck2 size={20} color="var(--green-700)" />
                      </div>
                      <div>
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '15px',
                            color: 'var(--green-950)',
                            marginBottom: '4px',
                          }}
                        >
                          {doc.title}
                        </strong>
                        {doc.desc && (
                          <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5', display: 'block' }}>
                            {doc.desc}
                          </span>
                        )}
                      </div>
                    </div>

                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--outline btn--sm"
                        style={{ flexShrink: 0, alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>{doc.isDownload ? 'Download' : 'View'}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 4. MAP LOCATION (LEFT) + ENQUIRY FORM (RIGHT) SIDE BY SIDE       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div
            className={`property-map-enquiry-row ${!hasLocation ? 'property-map-enquiry-row--full' : ''}`}
          >
            {hasLocation && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid rgba(227, 221, 209, 0.9)',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 3.5vw, 36px)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                    <MapPin size={14} />
                    <span>MAP LOCATION</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-950)', margin: '0 0 6px 0' }}>
                    Location &amp; Road Accessibility
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                    Geographical navigation and neighborhood road access for {project.location || project.name}.
                  </p>
                </div>

                <div
                  style={{
                    flex: 1,
                    minHeight: '420px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    position: 'relative',
                    background: '#e9e5dc',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <a
                    href={mapDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 10,
                      background: 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(4px)',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#0B57D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Open in Maps</span>
                    <ArrowUpRight size={13} />
                  </a>
                  <iframe
                    title={`${project.name} Location Map`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '420px', width: '100%', height: '100%', display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    src={mapEmbedSrc}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                maxWidth: !hasLocation ? '720px' : 'none',
                width: '100%',
                margin: !hasLocation ? '0 auto' : '0',
              }}
            >
              <EnquiryForm
                selectedPlot={project}
                prefillInterest={project.name}
                title={`Enquire for ${project.name}`}
                subtitle="Connect directly with our land advisory desk for verified documentation, pricing breakdown, or guided site visit."
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Image Lightbox Modal */}
      {lightboxIndex !== null && projectImages.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
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

          {projectImages.length > 1 && (
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
          )}

          <div
            style={{ maxWidth: '90vw', maxHeight: '85vh', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={projectImages[lightboxIndex]}
              alt={`${project.name} preview`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <p style={{ color: '#ffffff', marginTop: '10px', fontSize: '14px' }}>
              {project.name} — Photo {lightboxIndex + 1} of {projectImages.length}
            </p>
          </div>

          {projectImages.length > 1 && (
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
          )}
        </div>
      )}

      {/* Similar Land Opportunities */}
      {relatedProjects.length > 0 && (
        <Section
          title="Similar Land Opportunities"
          subtitle="Explore other approved plots and agricultural farmland in our Chennai portfolio"
          center
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {relatedProjects.map((rel) => (
              <ProjectCard key={rel.id || rel._id} project={rel} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
