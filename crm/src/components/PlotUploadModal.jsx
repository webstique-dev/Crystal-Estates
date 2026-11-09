import React, { useState, useRef } from 'react'
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  MapPin,
  Sparkles
} from 'lucide-react'
import { convertPdfToSvg, readSvgFile } from '../lib/pdfToSvg'
import { uploadPlotImage, uploadLayoutSvg, createPlot } from '../lib/api'

export default function PlotUploadModal({ isOpen, onClose, onPlotAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    plotNo: '',
    type: 'Residential Plots',
    location: 'Kolapakkam, Chennai',
    area: '1200',
    price: '4200000',
    facing: 'East',
    status: 'Available',
    approval: 'CMDA & RERA Approved',
    description: '',
  })

  // Images state
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const imageInputRef = useRef(null)

  // Layout PDF / SVG state
  const [layoutFile, setLayoutFile] = useState(null)
  const [isConvertingPdf, setIsConvertingPdf] = useState(false)
  const [convertedSvg, setConvertedSvg] = useState(null)
  const [layoutPreviewUrl, setLayoutPreviewUrl] = useState(null)
  const layoutInputRef = useRef(null)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  if (!isOpen) return null

  // Handle Form text inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Image Selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    const newPreviews = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: URL.createObjectURL(file),
      file,
    }))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle Layout File (PDF or SVG) Selection
  const handleLayoutFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLayoutFile(file)

    const isPdf = file.name.toLowerCase().endsWith('.pdf')
    const isSvg = file.name.toLowerCase().endsWith('.svg')

    if (!isPdf && !isSvg) {
      setError('Please select a valid .pdf or .svg file for the plot layout.')
      return
    }

    try {
      if (isPdf) {
        setIsConvertingPdf(true)
        // Convert PDF to standalone SVG matching kolapakkam-layout.svg
        const result = await convertPdfToSvg(file, 2.0)
        setConvertedSvg(result)
        setLayoutPreviewUrl(result.dataUrl)
        setIsConvertingPdf(false)
      } else {
        // Read SVG
        const result = await readSvgFile(file)
        setConvertedSvg(result)
        const blob = new Blob([result.svgString], { type: 'image/svg+xml' })
        setLayoutPreviewUrl(URL.createObjectURL(blob))
      }
    } catch (err) {
      console.error('PDF/SVG conversion error:', err)
      setError(`Failed to convert file: ${err.message}`)
      setIsConvertingPdf(false)
    }
  }

  const handleClearLayout = () => {
    setLayoutFile(null)
    setConvertedSvg(null)
    setLayoutPreviewUrl(null)
    if (layoutInputRef.current) layoutInputRef.current.value = ''
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter a project or plot name.')
      }

      // 1. Upload Images
      let primaryImageUrl = '/images/plot-1.jpg'
      const uploadedGalleryUrls = []

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadRes = await uploadPlotImage(file)
          if (uploadRes.success && uploadRes.url) {
            uploadedGalleryUrls.push(uploadRes.url)
          }
        }
        if (uploadedGalleryUrls.length > 0) {
          primaryImageUrl = uploadedGalleryUrls[0]
        }
      }

      // 2. Upload Converted Layout SVG (if provided)
      let layoutBackgroundUrl = null
      let layoutSlug = null

      if (convertedSvg) {
        const customSlug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')

        const uploadSvgRes = await uploadLayoutSvg({
          svgContent: convertedSvg.svgString,
          layoutSlug: customSlug || convertedSvg.slug,
          projectName: formData.name,
          viewBox: convertedSvg.viewBox,
          width: convertedSvg.width,
          height: convertedSvg.height,
        })

        if (uploadSvgRes.success) {
          layoutBackgroundUrl = uploadSvgRes.layoutBackgroundUrl
          layoutSlug = uploadSvgRes.slug
        }
      }

      // 3. Create Plot Entry in Database
      const plotPayload = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        area: Number(formData.area),
        price: Number(formData.price),
        facing: formData.facing,
        status: formData.status,
        approval: formData.approval,
        image: primaryImageUrl,
        gallery: uploadedGalleryUrls,
        hasLayoutMap: Boolean(layoutBackgroundUrl),
        layoutSlug,
        layoutBackgroundUrl,
        description: formData.description,
      }

      const createRes = await createPlot(plotPayload)

      setSuccessMessage(`Plot "${formData.name}" and layout SVG saved successfully!`)
      if (onPlotAdded) onPlotAdded(createRes.plot)

      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Plot upload submission failed:', err)
      setError(err.message || 'Failed to submit plot')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Upload Plot & Layout</h3>
              <p className="text-xs text-slate-500">
                Upload photos, details, and blueprint PDF (auto-converted to SVG layout map)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Plot Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project / Plot Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Kolapakkam Phase 2 / Plot #14"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="Residential Plots">Residential Plots</option>
                  <option value="Farm Lands">Farm Lands</option>
                  <option value="Villa Plots">Villa Plots</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area (Sq.ft)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1200"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="4200000"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facing
                </label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Booking Open">Booking Open</option>
                  <option value="Few Left">Few Left</option>
                  <option value="Token Paid">Token Paid</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approval
                </label>
                <input
                  type="text"
                  name="approval"
                  value={formData.approval}
                  onChange={handleChange}
                  placeholder="CMDA & RERA Approved"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Plot Images */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Plot & Site Photos
            </h4>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20"
            >
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Click to upload plot photos</p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 20MB</p>
            </div>

            {/* Thumbnail Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Layout PDF / SVG Drawing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Blueprint Layout Drawing (PDF or SVG)
              </h4>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Converts PDF → SVG
              </span>
            </div>

            {!convertedSvg && !isConvertingPdf && (
              <div
                onClick={() => layoutInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-xl p-6 text-center cursor-pointer transition bg-emerald-50/20 hover:bg-emerald-50/40"
              >
                <input
                  ref={layoutInputRef}
                  type="file"
                  accept=".pdf,.svg"
                  onChange={handleLayoutFileSelect}
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  Upload Layout Plan (PDF or SVG)
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Upload an architectural blueprint PDF. It will automatically convert into a sharp SVG layout map matching <span className="font-mono text-emerald-700">kolapakkam-layout.svg</span>.
                </p>
              </div>
            )}

            {isConvertingPdf && (
              <div className="p-8 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-800">Converting Blueprint PDF to SVG...</p>
                <p className="text-xs text-slate-500">
                  Parsing vector layers, dimensions, and viewBox coordinates...
                </p>
              </div>
            )}

            {convertedSvg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {convertedSvg.filename}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Dimensions: {convertedSvg.width} × {convertedSvg.height} px | viewBox: &quot;{convertedSvg.viewBox}&quot;
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearLayout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* SVG Visual Preview Box */}
                {layoutPreviewUrl && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900/5 aspect-2/1 flex items-center justify-center relative">
                    <img
                      src={layoutPreviewUrl}
                      alt="Layout Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/70 text-white px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                      SVG Layout Ready
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg shadow-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Save Plot & Layout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

