import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  MapPin,
  Sparkles,
  Video,
  RefreshCw,
  Layers,
  FileCode2,
  DollarSign,
  Maximize2,
  Save,
  Check,
  Building2,
  ExternalLink,
} from 'lucide-react'
import {
  uploadPlotImage,
  uploadLayoutFile,
  uploadLayoutSvg,
  uploadDocument,
  uploadVideo,
  createPlot,
  updatePlot,
  fetchLayoutDetails,
} from '../../lib/api'
import PlotManagementSection from './PlotManagementSection'

function generateProjectId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `CE-${randomNum}`
}

export default function AddEditPropertyPage({ initialData, onSave, onCancel }) {
  const isEdit = Boolean(initialData && initialData.id)

  // Step Tabs: 'basic' | 'measurements' | 'pricing' | 'media'
  const [activeTab, setActiveTab] = useState('basic')

  // Form State with all 16 Fields — Clean blank initial state without any dummy defaults
  const [formData, setFormData] = useState({
    projectId: initialData?.projectId || generateProjectId(),
    name: initialData?.name || initialData?.projectName || '',
    propertyType: initialData?.propertyType || initialData?.type || 'Residential',
    district: initialData?.district || '',
    taluk: initialData?.taluk || '',
    village: initialData?.village || '',
    location: initialData?.location || '',
    surveyNumber: initialData?.surveyNumber || '',
    totalLandArea: initialData?.totalLandArea
      ? String(initialData.totalLandArea).replace(/[^0-9.]/g, '')
      : initialData?.area
      ? String(initialData.area)
      : '',
    totalLandAreaUnit: initialData?.totalLandAreaUnit || 'Sq.ft.',
    availableArea: initialData?.availableArea
      ? String(initialData.availableArea).replace(/[^0-9.]/g, '')
      : initialData?.available
      ? String(initialData.available)
      : '',
    availableAreaUnit: initialData?.availableAreaUnit || 'Sq.ft.',
    plotNumber: initialData?.plotNumber || initialData?.plotNo || '',
    length: initialData?.length || '',
    width: initialData?.width || '',
    plotDimensions: initialData?.plotDimensions || '',
    price: initialData?.price ? String(initialData.price) : '',
    pricePerSqft: initialData?.pricePerSqft ? String(initialData.pricePerSqft) : '',
    pricePerCent: initialData?.pricePerCent ? String(initialData.pricePerCent) : '',
    roadAccess: initialData?.roadAccess || '',
    approvalStatus: initialData?.approvalStatus || initialData?.approval || '',
    status: initialData?.status || 'Available',
    facing: initialData?.facing || 'East',
    description: initialData?.description || '',
    mapLocation: initialData?.mapLocation || initialData?.mapUrl || initialData?.googleMapsUrl || initialData?.mapEmbedUrl || '',
  })

  // Images State
  const [existingImages, setExistingImages] = useState(
    Array.isArray(initialData?.images) && initialData.images.length > 0
      ? initialData.images
      : initialData?.image
      ? [initialData.image]
      : []
  )
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const imageInputRef = useRef(null)

  // Documents State
  const [existingDocs, setExistingDocs] = useState(
    Array.isArray(initialData?.documents) ? initialData.documents : []
  )
  const [newDocFiles, setNewDocFiles] = useState([])
  const [newDocList, setNewDocList] = useState([])
  const documentInputRef = useRef(null)

  // Layout Blueprint State (Accepts all formats directly without conversion)
  const [existingLayoutUrl, setExistingLayoutUrl] = useState(
    initialData?.layoutBackgroundUrl || initialData?.layoutUrl || null
  )
  const [layoutFile, setLayoutFile] = useState(null)
  const layoutInputRef = useRef(null)

  // Layout Plots & Path Data State
  const [layoutPlots, setLayoutPlots] = useState(
    Array.isArray(initialData?.plots) ? initialData.plots : []
  )

  // Load existing layout plots from database if editing a property
  useEffect(() => {
    const slug = initialData?.layoutSlug || initialData?.slug || initialData?.id
    if (slug && (!initialData?.plots || initialData.plots.length === 0)) {
      fetchLayoutDetails(slug)
        .then((data) => {
          if (data.success && Array.isArray(data.plots) && data.plots.length > 0) {
            setLayoutPlots(data.plots)
          }
        })
        .catch(() => {})
    }
  }, [initialData])

  // Videos State
  const [videoList, setVideoList] = useState(
    Array.isArray(initialData?.videos) ? initialData.videos : []
  )
  const [newVideoFiles, setNewVideoFiles] = useState([])
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const videoInputRef = useRef(null)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Form Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === 'district' || name === 'taluk' || name === 'village') {
        const d = name === 'district' ? value : prev.district
        const t = name === 'taluk' ? value : prev.taluk
        const v = name === 'village' ? value : prev.village
        updated.location = [v, t, d].filter(Boolean).join(', ')
      }

      if (name === 'length' || name === 'width') {
        const l = name === 'length' ? value : prev.length
        const w = name === 'width' ? value : prev.width
        if (l && w) {
          updated.plotDimensions = `${l}'0" x ${w}'0"`
        }
      }

      return updated
    })
  }

  const handleRegenerateId = () => {
    setFormData((prev) => ({ ...prev, projectId: generateProjectId() }))
  }

  // Image Handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewImageFiles((prev) => [...prev, ...files])
    const previews = files.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(file),
      file,
    }))
    setNewImagePreviews((prev) => [...prev, ...previews])
  }

  const handleRemoveExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleRemoveNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  // Document Handlers
  const handleDocumentSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewDocFiles((prev) => [...prev, ...files])
    const docs = files.map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      file,
    }))
    setNewDocList((prev) => [...prev, ...docs])
  }

  const handleRemoveExistingDoc = (idx) => {
    setExistingDocs((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleRemoveNewDoc = (idx) => {
    setNewDocFiles((prev) => prev.filter((_, i) => i !== idx))
    setNewDocList((prev) => prev.filter((_, i) => i !== idx))
  }

  // Video Handlers
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewVideoFiles((prev) => [...prev, ...files])
    const vids = files.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      file,
    }))
    setVideoList((prev) => [...prev, ...vids])
  }

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return
    setVideoList((prev) => [
      ...prev,
      { name: 'Drone / Video Link', url: videoUrlInput.trim(), isLink: true },
    ])
    setVideoUrlInput('')
  }

  const handleRemoveVideo = (idx) => {
    setVideoList((prev) => prev.filter((_, i) => i !== idx))
  }

  // Layout Blueprint Selection (Accepts all formats directly, no conversion)
  const handleLayoutFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLayoutFile(file)
  }

  const handleClearLayout = () => {
    setLayoutFile(null)
    setExistingLayoutUrl(null)
    if (layoutInputRef.current) layoutInputRef.current.value = ''
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter the Project Name.')
      }

      // 1. Upload any new images
      const uploadedImages = [...existingImages]
      for (const file of newImageFiles) {
        const res = await uploadPlotImage(file)
        if (res.success && res.url) {
          uploadedImages.push(res.url)
        }
      }
      const primaryImage = uploadedImages[0] || null

      // 2. Upload any new documents
      const uploadedDocs = [...existingDocs]
      for (const file of newDocFiles) {
        try {
          const res = await uploadDocument(file)
          if (res.success && res.url) {
            uploadedDocs.push({
              name: res.name,
              url: res.url,
              size: res.sizeFormatted,
            })
          }
        } catch (dErr) {
          console.warn('Doc upload error:', dErr)
        }
      }

      // 3. Upload any new videos
      const finalVideos = [...videoList.filter((v) => !v.file)]
      for (const file of newVideoFiles) {
        try {
          const res = await uploadVideo(file)
          if (res.success && res.url) {
            finalVideos.push({
              name: res.name,
              url: res.url,
              size: res.sizeFormatted,
            })
          }
        } catch (vErr) {
          console.warn('Video upload error:', vErr)
        }
      }

      // 4. Upload Layout Blueprint File (Direct upload of any format, no conversion)
      let layoutBackgroundUrl = existingLayoutUrl
      let layoutUrl = initialData?.layoutUrl || existingLayoutUrl || null
      let layoutSlug = initialData?.layoutSlug || null
      let layoutFileName = initialData?.layoutFileName || null

      if (layoutFile) {
        const uploadRes = await uploadLayoutFile(layoutFile, formData.name)
        if (uploadRes.success) {
          layoutBackgroundUrl = uploadRes.url
          layoutUrl = uploadRes.url
          layoutSlug = uploadRes.slug || null
          layoutFileName = uploadRes.name || layoutFile.name
        }
      }

      // 5. Construct Final Property Payload without dummy numbers
      const finalLocation =
        formData.location ||
        [formData.village, formData.taluk, formData.district].filter(Boolean).join(', ')

      const payload = {
        projectId: formData.projectId,
        name: formData.name.trim(),
        projectName: formData.name.trim(),
        propertyType: formData.propertyType,
        type: formData.propertyType,
        location: finalLocation,
        district: formData.district,
        taluk: formData.taluk,
        village: formData.village,
        surveyNumber: formData.surveyNumber,
        totalLandArea: formData.totalLandArea
          ? `${formData.totalLandArea} ${formData.totalLandAreaUnit}`
          : '',
        totalLandAreaUnit: formData.totalLandAreaUnit,
        area: formData.totalLandArea ? Number(formData.totalLandArea) : null,
        availableArea: formData.availableArea
          ? `${formData.availableArea} ${formData.availableAreaUnit}`
          : '',
        availableAreaUnit: formData.availableAreaUnit,
        plotNumber: formData.plotNumber,
        plotNo: formData.plotNumber,
        plotDimensions: formData.plotDimensions,
        length: formData.length,
        width: formData.width,
        price: formData.price ? Number(formData.price) : null,
        pricePerSqft: formData.pricePerSqft ? Number(formData.pricePerSqft) : null,
        pricePerCent: formData.pricePerCent ? Number(formData.pricePerCent) : null,
        roadAccess: formData.roadAccess,
        approvalStatus: formData.approvalStatus,
        approval: formData.approvalStatus,
        rera: formData.approvalStatus,
        documents: uploadedDocs,
        images: uploadedImages,
        gallery: uploadedImages,
        image: primaryImage,
        videos: finalVideos,
        status: formData.status,
        badge: formData.status,
        facing: formData.facing,
        description: formData.description,
        mapLocation: (formData.mapLocation || '').trim(),
        mapUrl: (formData.mapLocation || '').trim(),
        googleMapsUrl: (formData.mapLocation || '').trim(),
        hasLayoutMap: Boolean(layoutBackgroundUrl || layoutUrl || layoutPlots.length > 0),
        layoutSlug,
        layoutBackgroundUrl,
        layoutUrl,
        layoutFileName,
        layoutImage:
          layoutBackgroundUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(layoutBackgroundUrl)
            ? layoutBackgroundUrl
            : initialData?.layoutImage || null,
        plots: layoutPlots,
        totalPlots: layoutPlots.length,
        availablePlots: layoutPlots.filter((p) => p.status === 'Available').length,
      }

      let savedResult
      if (isEdit) {
        await updatePlot(initialData.id, payload)
        savedResult = { ...initialData, ...payload }
        setSuccessMessage(`Project "${formData.name}" updated successfully!`)
      } else {
        const createRes = await createPlot(payload)
        savedResult = createRes.plot
        setSuccessMessage(`Project "${formData.name}" created successfully!`)
      }

      if (onSave) onSave(savedResult, isEdit)

      setTimeout(() => {
        setIsSubmitting(false)
        if (onCancel) onCancel()
      }, 1200)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to save property')
      setIsSubmitting(false)
    }
  }

  const TABS = [
    { id: 'basic', label: '1. Project & Location', icon: MapPin },
    { id: 'measurements', label: '2. Land & Dimensions', icon: Maximize2 },
    { id: 'pricing', label: '3. Pricing & Approvals', icon: DollarSign },
    { id: 'media', label: '4. Documents, Photos & Videos', icon: Layers },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* ── Top Header Bar with Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0B57D0] hover:border-[#0B57D0] transition shadow-2xs"
            title="Back to Properties"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-0.5">
              <span>Properties</span>
              <span>/</span>
              <span className="text-[#0B57D0]">{isEdit ? 'Edit Project' : 'Add New Property'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {isEdit ? `Edit: ${formData.name || 'Project'}` : 'Add New Property'}
              <span className="text-xs font-mono font-bold bg-blue-50 text-[#0B57D0] px-2.5 py-0.5 rounded-lg border border-blue-100">
                {formData.projectId}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Update Project' : 'Save & Publish'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Notification Alerts ── */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0B57D0] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Tab Content Forms ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8">
        {/* TAB 1: BASIC DETAILS & LOCATION */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>1. Project ID (Auto Unique)</span>
                  <button
                    type="button"
                    onClick={handleRegenerateId}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter project / layout name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                >
                  <option value="Residential">Residential</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Bulk land">Bulk land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  16. Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Booked">Booked</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Location Hierarchy */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#0B57D0]" />
                <span>4. Location Hierarchy (District, Taluk, Village)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Kancheepuram"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Taluk
                  </label>
                  <input
                    type="text"
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    placeholder="e.g. Sriperumbudur"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Kolapakkam"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Formatted Address
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Village, Taluk, District"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Map Location / Google Maps Link */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Google Maps Location / Share Link / Embed Code</span>
                  {formData.mapLocation && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Configured
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mapLocation"
                    value={formData.mapLocation}
                    onChange={handleChange}
                    placeholder="Paste Google Maps link, iframe embed URL, or coordinates (e.g. 12.9784, 80.2185)"
                    className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0B57D0]"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pinpoints this exact layout on the client property page (accepts Google Maps URLs, embed iframe src, or coordinates).
                </p>

                {formData.mapLocation && (
                  <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0B57D0]" /> Live Map Preview
                      </span>
                      <a
                        href={
                          formData.mapLocation.startsWith('http')
                            ? formData.mapLocation
                            : `https://maps.google.com/?q=${encodeURIComponent(formData.mapLocation)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0B57D0] hover:underline flex items-center gap-1 text-[10px]"
                      >
                        Open in Maps <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <iframe
                      title="Map Preview"
                      src={
                        formData.mapLocation.includes('google.com/maps/embed')
                          ? (formData.mapLocation.match(/src=["']([^"']+)["']/i)?.[1] || formData.mapLocation)
                          : `https://maps.google.com/maps?q=${encodeURIComponent(
                              formData.mapLocation.match(/src=["']([^"']+)["']/i)?.[1] || formData.mapLocation
                            )}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                      }
                      className="w-full h-36 rounded-lg border-0 bg-slate-200"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Survey Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                5. Survey Number (Land Survey Details)
              </label>
              <input
                type="text"
                name="surveyNumber"
                value={formData.surveyNumber}
                onChange={handleChange}
                placeholder="e.g. S.No: 206/2A1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 2: MEASUREMENTS & DIMENSIONS */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  6. Total Land Area
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="totalLandArea"
                    value={formData.totalLandArea}
                    onChange={handleChange}
                    placeholder="Enter area number"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <select
                    name="totalLandAreaUnit"
                    value={formData.totalLandAreaUnit}
                    onChange={handleChange}
                    className="w-32 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Sq.ft.">Sq.ft.</option>
                    <option value="Cents">Cents</option>
                    <option value="Acres">Acres</option>
                    <option value="Grounds">Grounds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  7. Available Area (Current Available Extent)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="availableArea"
                    value={formData.availableArea}
                    onChange={handleChange}
                    placeholder="Enter available area"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <select
                    name="availableAreaUnit"
                    value={formData.availableAreaUnit}
                    onChange={handleChange}
                    className="w-32 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Sq.ft.">Sq.ft.</option>
                    <option value="Cents">Cents</option>
                    <option value="Acres">Acres</option>
                    <option value="Grounds">Grounds</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  8. Plot Number (Individual Plot Identification)
                </label>
                <input
                  type="text"
                  name="plotNumber"
                  value={formData.plotNumber}
                  onChange={handleChange}
                  placeholder="e.g. Plot No. 1 to 45"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Facing Direction
                </label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="East">East Facing</option>
                  <option value="North">North Facing</option>
                  <option value="West">West Facing</option>
                  <option value="South">South Facing</option>
                  <option value="North-East">North-East Corner</option>
                </select>
              </div>
            </div>

            {/* Plot Dimensions */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>9. Plot Dimensions (Length & Width)</span>
                {formData.plotDimensions && (
                  <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {formData.plotDimensions}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="Length in ft"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width in ft"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                11. Road Access (Width & Access Details)
              </label>
              <input
                type="text"
                name="roadAccess"
                value={formData.roadAccess}
                onChange={handleChange}
                placeholder="e.g. 30 ft. Wide Tar Road"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PRICING & APPROVALS */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="text-xs font-bold text-slate-800">
                10. Price Structure (Total / Per Sq.ft. / Per Cent)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Total Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter total price in ₹"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Price per Sq.ft. (₹)
                  </label>
                  <input
                    type="number"
                    name="pricePerSqft"
                    value={formData.pricePerSqft}
                    onChange={handleChange}
                    placeholder="e.g. 3500"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Price per Cent (₹)
                  </label>
                  <input
                    type="number"
                    name="pricePerCent"
                    value={formData.pricePerCent}
                    onChange={handleChange}
                    placeholder="e.g. 152000"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                12. Approval Status (Applicable Details)
              </label>
              <input
                type="text"
                name="approvalStatus"
                value={formData.approvalStatus}
                onChange={handleChange}
                placeholder="e.g. CMDA Approved / DTCP Approved / RERA Registered"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project Highlights & Marketing Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter details, landmarks, connectivity..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 4: MEDIA & DOCUMENTS */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* 14. Site Photographs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#0B57D0]" />
                  <span>14. Site Photographs (Images)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {existingImages.length + newImageFiles.length} photos
                </span>
              </div>

              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0B57D0] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20"
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
                <p className="text-xs font-bold text-slate-700">Click to upload site photos</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB each</p>
              </div>

              {/* Photos Grid */}
              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                  {existingImages.map((src, idx) => (
                    <div key={`exist-${idx}`} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      <img src={src} alt="Property" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] rounded font-bold">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((item, idx) => (
                    <div key={`new-${idx}`} className="relative group rounded-xl overflow-hidden border border-blue-300 aspect-video bg-blue-50">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] rounded font-bold">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 13. Blueprint PDF to SVG and Documents */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileCode2 className="w-4 h-4 text-[#0B57D0]" />
                  <span>13. Layout Blueprint & Documents</span>
                </div>
                
              </div>

              {/* Blueprint Upload */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Plot Blueprint / Layout File:
                </span>
                {!layoutFile && !existingLayoutUrl ? (
                  <div
                    onClick={() => layoutInputRef.current?.click()}
                    className="border border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-white transition"
                  >
                    <input
                      ref={layoutInputRef}
                      type="file"
                      onChange={handleLayoutFileSelect}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-700">
                      <Upload className="w-4 h-4" />
                      <span>Select Layout Blueprint File</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {layoutFile?.name || existingLayoutUrl}
                      </span>
                      {layoutFile?.size && (
                        <span className="text-[11px] text-emerald-600 font-normal">
                          ({(layoutFile.size / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleClearLayout}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs shrink-0 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Plots & Path Data (Available after uploading or updating layout) */}
              {(layoutFile || existingLayoutUrl || layoutPlots.length > 0) && (
                <PlotManagementSection
                  plots={layoutPlots}
                  onChange={setLayoutPlots}
                  layoutUrl={existingLayoutUrl || (layoutFile ? layoutFile.name : null)}
                  projectName={formData.name}
                />
              )}

              {/* Legal Documents */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Additional Legal Deeds & Documents:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attach Documents</span>
                  </button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    multiple
                    onChange={handleDocumentSelect}
                    className="hidden"
                  />
                  <span className="text-[11px] text-slate-400">
                    {existingDocs.length + newDocList.length} files attached
                  </span>
                </div>

                {(existingDocs.length > 0 || newDocList.length > 0) && (
                  <div className="space-y-2 mt-2">
                    {existingDocs.map((doc, idx) => (
                      <div key={`ex-doc-${idx}`} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="truncate text-slate-800 font-medium">{doc.name || doc.url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingDoc(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {newDocList.map((doc, idx) => (
                      <div key={`new-doc-${idx}`} className="flex items-center justify-between px-3 py-2 bg-blue-50/60 rounded-lg border border-blue-200 text-xs">
                        <span className="truncate text-blue-900 font-medium">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewDoc(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 15. Drone & Site Videos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#0B57D0]" />
                  <span>15. Videos (Drone & Site Videos)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {videoList.length} video(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-3.5 text-center cursor-pointer bg-slate-50 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                  <Video className="w-4 h-4 text-[#0B57D0]" />
                  <span>Upload MP4 / WebM File</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="Paste YouTube / Drone URL..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoUrl}
                    className="px-4 py-2 bg-[#0B57D0] text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {videoList.length > 0 && (
                <div className="space-y-2">
                  {videoList.map((vid, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <span className="truncate text-slate-800 font-medium">{vid.name || vid.url}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(idx)}
                        className="text-rose-500 hover:text-rose-700 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom Step Navigation ── */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <div>
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab)
                  if (idx > 0) setActiveTab(TABS[idx - 1].id)
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'media' ? (
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab)
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id)
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEdit ? 'Save Changes' : 'Save & Publish'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
