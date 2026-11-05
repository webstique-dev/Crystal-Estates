'use client'

import React, { useState, useEffect } from 'react'
import PlotViewer from '../../components/plot-viewer/PlotViewer'
import { KOLAPAKKAM_METADATA } from '../../data/kolapakkamPlots'
import { business } from '../../data/site'

export default function LayoutViewerPage() {
  const [metadata, setMetadata] = useState(KOLAPAKKAM_METADATA)
  const [plots, setPlots] = useState([])

  useEffect(() => {
    fetch('/api/plots/kolapakkam')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.metadata) setMetadata(data.metadata)
          if (data.plots && data.plots.length > 0) setPlots(data.plots)
        }
      })
      .catch(() => {})
  }, [])

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
        initialPlots={plots.length > 0 ? plots : null}
        metadata={metadata}
        backgroundUrl={metadata.layoutBackgroundUrl}
        viewBox={metadata.viewBox}
        whatsappNumber={business.whatsapp}
        className="plot-viewer--fullpage"
        backHref="/projects/kolapakkam"
      />
    </div>
  )
}
