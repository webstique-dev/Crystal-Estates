'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'
import PlotViewer from '../../components/plot-viewer/PlotViewer'
import { business } from '../../data/site'

function LayoutViewerContent() {
  const searchParams = useSearchParams()
  const slugParam = searchParams.get('slug') || searchParams.get('layout') || searchParams.get('project') || searchParams.get('id')
  const phaseParam = searchParams.get('phase')

  const [metadata, setMetadata] = useState(null)
  const [plots, setPlots] = useState([])
  const [phases, setPhases] = useState([])
  const [activePhaseIndex, setActivePhaseIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadLayout() {
      try {
        setLoading(true)
        setError(null)

        if (slugParam) {
          // 1. Try fetching layout by slug
          const layoutRes = await fetch(`/api/plots/layout/${slugParam}`)
          if (layoutRes.ok) {
            const data = await layoutRes.json()
            if (data.success && isMounted) {
              setMetadata(data.metadata)
              setPlots(data.plots || [])
              const rawPhases = Array.isArray(data.layouts) && data.layouts.length > 0
                ? data.layouts
                : Array.isArray(data.phases) && data.phases.length > 0
                ? data.phases
                : []
              setPhases(rawPhases)
              if (phaseParam && rawPhases.length > 0) {
                const matchIdx = rawPhases.findIndex(
                  (p) =>
                    String(p.id).toLowerCase() === phaseParam.toLowerCase() ||
                    String(p.name).toLowerCase() === phaseParam.toLowerCase()
                )
                if (matchIdx >= 0) setActivePhaseIndex(matchIdx)
              }
              setLoading(false)
              return
            }
          }

          // 2. Try fetching project by id/slug
          const projRes = await fetch(`/api/plots/${slugParam}`)
          if (projRes.ok) {
            const data = await projRes.json()
            if (data.success && data.plot && isMounted) {
              const p = data.plot
              const layoutUrl = p.layoutBackgroundUrl || p.layoutUrl || null
              const rawPhases = Array.isArray(p.layouts) && p.layouts.length > 0
                ? p.layouts
                : Array.isArray(p.phases) && p.phases.length > 0
                ? p.phases
                : []
              setPhases(rawPhases)
              if (phaseParam && rawPhases.length > 0) {
                const matchIdx = rawPhases.findIndex(
                  (ph) =>
                    String(ph.id).toLowerCase() === phaseParam.toLowerCase() ||
                    String(ph.name).toLowerCase() === phaseParam.toLowerCase()
                )
                if (matchIdx >= 0) setActivePhaseIndex(matchIdx)
              }
              setMetadata({
                slug: p.layoutSlug || p.slug || p.projectId || p.id,
                name: p.name || p.projectName,
                title: p.name || p.projectName,
                location: p.location,
                village: p.village,
                taluk: p.taluk,
                district: p.district,
                sNo: p.surveyNumber,
                layoutBackgroundUrl: layoutUrl,
                layoutUrl,
                viewBox: p.viewBox || '0 0 1056 816',
                width: p.width || 1056,
                height: p.height || 816,
              })
              setPlots(Array.isArray(p.plots) ? p.plots : [])
              setLoading(false)
              return
            }
          }
        }

        // 3. Fallback: load available layouts from database
        const layoutsRes = await fetch('/api/plots/layouts')
        if (layoutsRes.ok) {
          const data = await layoutsRes.json()
          if (data.success && Array.isArray(data.layouts) && data.layouts.length > 0 && isMounted) {
            const first = data.layouts[0]
            const detailsRes = await fetch(`/api/plots/layout/${first.slug}`)
            if (detailsRes.ok) {
              const details = await detailsRes.json()
              if (details.success && isMounted) {
                setMetadata(details.metadata || first)
                setPlots(details.plots || [])
                setPhases(details.layouts || details.phases || [])
                setLoading(false)
                return
              }
            }
            if (isMounted) {
              setMetadata(first)
              setPlots([])
              setLoading(false)
              return
            }
          }
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadLayout()

    return () => {
      isMounted = false
    }
  }, [slugParam, phaseParam])

  if (loading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#ffffff',
          color: 'var(--green-900, #0f3d2e)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="plot-viewer__spinner" style={{ margin: '0 auto 16px' }} />
          <p>Loading layout from database...</p>
        </div>
      </div>
    )
  }

  if (!metadata || !metadata.layoutBackgroundUrl) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf8f5',
          color: '#333',
          padding: '24px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}
      >
        <Layers size={48} color="#0f3d2e" style={{ marginBottom: '16px', opacity: 0.7 }} />
        <h2 style={{ fontSize: '24px', color: '#0f3d2e', marginBottom: '8px' }}>
          No Layout Map Available
        </h2>
        <p style={{ maxWidth: '480px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
          {error
            ? `Error loading layout: ${error}`
            : 'No layout blueprint file has been uploaded for this project. Upload blueprint files via the CRM to view interactive layouts.'}
        </p>
        <Link
          href="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#0f3d2e',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Projects Directory</span>
        </Link>
      </div>
    )
  }

  const backLink = slugParam ? `/projects/${slugParam}` : '/projects'

  const currentPhase = phases[activePhaseIndex] || null
  const activeLayoutUrl =
    currentPhase?.layoutUrl ||
    currentPhase?.layoutBackgroundUrl ||
    metadata?.layoutBackgroundUrl ||
    metadata?.layoutUrl

  const activePlots = (() => {
    if (currentPhase) {
      const phaseName = (currentPhase.name || `Phase ${activePhaseIndex + 1}`).trim()
      let pList = Array.isArray(currentPhase.plots) ? currentPhase.plots : []
      if (pList.length > 0 && pList.some((p) => p.phase)) {
        return pList.filter(
          (p) => !p.phase || String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      if (pList.length === 0 && Array.isArray(plots) && plots.length > 0) {
        return plots.filter(
          (p) => p.phase && String(p.phase).trim().toLowerCase() === phaseName.toLowerCase()
        )
      }
      return pList
    }
    return plots
  })()

  const activeViewBox = currentPhase?.viewBox || metadata?.viewBox || '0 0 1056 816'

  const handlePhaseChange = (idx) => {
    setActivePhaseIndex(idx)
    const ph = phases[idx]
    if (ph && typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('phase', ph.name || `phase-${idx + 1}`)
      window.history.replaceState({}, '', url.toString())
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#ffffff',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PlotViewer
        key={`${slugParam}-${currentPhase?.id || activePhaseIndex}-${activeLayoutUrl}`}
        initialPlots={activePlots}
        phases={phases}
        activePhase={activePhaseIndex}
        onPhaseChange={handlePhaseChange}
        fetchUrl={null}
        metadata={{
          ...metadata,
          layouts: phases,
          phases: phases,
          title: metadata.title || metadata.name || 'Layout',
          layoutBackgroundUrl: activeLayoutUrl,
          viewBox: activeViewBox,
        }}
        backgroundUrl={activeLayoutUrl}
        viewBox={activeViewBox}
        whatsappNumber={business?.whatsapp || '919444000000'}
        className="plot-viewer--fullpage"
        backHref={backLink}
      />
    </div>
  )
}

export default function LayoutViewerPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#ffffff',
          }}
        >
          <span>Loading...</span>
        </div>
      }
    >
      <LayoutViewerContent />
    </Suspense>
  )
}
