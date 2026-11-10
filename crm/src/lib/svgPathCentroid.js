/**
 * Robust SVG path centroid and bounding box calculator.
 * Supports absolute & relative commands (M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z).
 * Computes polygon centroid using shoelace formula with fallback to bounding box center.
 *
 * @param {string} d - SVG path "d" attribute string
 * @returns {{ textX: number, textY: number, minX: number, maxX: number, minY: number, maxY: number } | null}
 */
export function computePathCentroid(d) {
  if (!d || typeof d !== 'string') return null

  // Normalize tokens: match command letters or signed floating point numbers
  const tokens = d.match(/[a-df-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/gi)
  if (!tokens || tokens.length === 0) return null

  let currX = 0
  let currY = 0
  let startX = 0
  let startY = 0
  const points = []

  let i = 0
  let cmd = ''

  while (i < tokens.length) {
    const token = tokens[i]
    if (/^[a-df-z]$/i.test(token)) {
      cmd = token
      i++
    }

    if (cmd === 'M') {
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      startX = currX
      startY = currY
      points.push({ x: currX, y: currY })
      cmd = 'L'
    } else if (cmd === 'm') {
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      startX = currX
      startY = currY
      points.push({ x: currX, y: currY })
      cmd = 'l'
    } else if (cmd === 'L') {
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'l') {
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'H') {
      currX = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'h') {
      currX += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'V') {
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'v') {
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'C') {
      i += 4 // skip 2 control points (x1, y1, x2, y2)
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'c') {
      i += 4
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'S' || cmd === 'Q') {
      i += 2 // skip control point
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 's' || cmd === 'q') {
      i += 2
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'T') {
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 't') {
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'A') {
      i += 5 // rx, ry, angle, large-arc, sweep
      currX = parseFloat(tokens[i++])
      currY = parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'a') {
      i += 5
      currX += parseFloat(tokens[i++])
      currY += parseFloat(tokens[i++])
      points.push({ x: currX, y: currY })
    } else if (cmd === 'Z' || cmd === 'z') {
      currX = startX
      currY = startY
      points.push({ x: currX, y: currY })
      cmd = ''
    } else {
      i++
    }
  }

  if (points.length === 0) return null

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const pt of points) {
    if (!isNaN(pt.x) && !isNaN(pt.y)) {
      if (pt.x < minX) minX = pt.x
      if (pt.x > maxX) maxX = pt.x
      if (pt.y < minY) minY = pt.y
      if (pt.y > maxY) maxY = pt.y
    }
  }

  if (minX === Infinity || maxX === -Infinity) return null

  // Polygon centroid using shoelace formula
  let area2 = 0
  let cx = 0
  let cy = 0
  const n = points.length

  for (let j = 0; j < n; j++) {
    const p1 = points[j]
    const p2 = points[(j + 1) % n]
    const cross = (p1.x * p2.y - p2.x * p1.y)
    area2 += cross
    cx += (p1.x + p2.x) * cross
    cy += (p1.y + p2.y) * cross
  }

  if (Math.abs(area2) > 1e-4) {
    const finalCx = cx / (3 * area2)
    const finalCy = cy / (3 * area2)
    // Check if inside bounding box
    if (finalCx >= minX && finalCx <= maxX && finalCy >= minY && finalCy <= maxY) {
      return {
        textX: Math.round(finalCx * 10) / 10,
        textY: Math.round(finalCy * 10) / 10,
        minX,
        maxX,
        minY,
        maxY,
      }
    }
  }

  // Fallback to bounding box center
  return {
    textX: Math.round(((minX + maxX) / 2) * 10) / 10,
    textY: Math.round(((minY + maxY) / 2) * 10) / 10,
    minX,
    maxX,
    minY,
    maxY,
  }
}

