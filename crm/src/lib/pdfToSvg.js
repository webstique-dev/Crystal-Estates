import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

/**
 * Converts an uploaded plot PDF blueprint into an SVG document
 * Matching the exact structure and dimensions of client/public/plots/kolapakkam-layout.svg
 *
 * @param {File|Blob|ArrayBuffer} file - Uploaded PDF file
 * @param {number} [scale=2.0] - Scale multiplier for crisp blueprint rendering
 * @returns {Promise<{ svgString: string, viewBox: string, width: number, height: number, filename: string, slug: string }>}
 */
export async function convertPdfToSvg(file, scale = 2.0) {
  const arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdfDoc = await loadingTask.promise
  const page = await pdfDoc.getPage(1)

  // 1x baseline viewport determines SVG coordinate space & viewBox
  const baseViewport = page.getViewport({ scale: 1.0 })
  const width = Math.round(baseViewport.width)
  const height = Math.round(baseViewport.height)
  const viewBox = `0 0 ${width} ${height}`

  // Render on offscreen canvas at high resolution
  const renderViewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(renderViewport.width)
  canvas.height = Math.round(renderViewport.height)
  const ctx = canvas.getContext('2d', { alpha: false })

  await page.render({
    canvasContext: ctx,
    viewport: renderViewport,
  }).promise

  const dataUrl = canvas.toDataURL('image/png', 0.95)

  // Generate clean standalone SVG matching kolapakkam-layout.svg
  const svgString = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   version="1.1"
   id="svg1"
   width="${width}"
   height="${height}"
   viewBox="${viewBox}"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg">
  <defs id="defs1" />
  <g id="layer1">
    <image
       id="layout-drawing"
       width="${width}"
       height="${height}"
       x="0"
       y="0"
       preserveAspectRatio="none"
       xlink:href="${dataUrl}" />
  </g>
</svg>`

  const originalName = file.name || 'layout.pdf'
  const rawBase = originalName
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const slug = rawBase.endsWith('-layout') ? rawBase.replace(/-layout$/, '') : rawBase
  const filename = `${slug}-layout.svg`

  return {
    svgString,
    width,
    height,
    viewBox,
    filename,
    slug,
    dataUrl,
    numPages: pdfDoc.numPages,
  }
}

/**
 * Handles reading an uploaded SVG file directly
 */
export async function readSvgFile(file) {
  const text = await file.text()
  let viewBox = '0 0 1056 816'
  let width = 1056
  let height = 816

  const viewBoxMatch = text.match(/viewBox=["']([0-9.\s-]+)["']/i)
  if (viewBoxMatch && viewBoxMatch[1]) {
    viewBox = viewBoxMatch[1].trim()
    const parts = viewBox.split(/\s+/).map(Number)
    if (parts.length === 4) {
      width = parts[2]
      height = parts[3]
    }
  } else {
    const widthMatch = text.match(/width=["']([0-9.]+)["']/i)
    const heightMatch = text.match(/height=["']([0-9.]+)["']/i)
    if (widthMatch && heightMatch) {
      width = parseFloat(widthMatch[1]) || 1056
      height = parseFloat(heightMatch[1]) || 816
      viewBox = `0 0 ${width} ${height}`
    }
  }

  const rawBase = (file.name || 'layout.svg')
    .replace(/\.svg$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const slug = rawBase.endsWith('-layout') ? rawBase.replace(/-layout$/, '') : rawBase
  const filename = `${slug}-layout.svg`

  return {
    svgString: text,
    width,
    height,
    viewBox,
    filename,
    slug,
  }
}

