import React, { useState } from 'react'
import PropertyCard from './PropertyCard'
import PropertyPlotModal from './PropertyPlotModal'
import { Building2, SearchX } from 'lucide-react'

export default function PropertyGrid({
  properties = [],
  onEdit,
  onDelete,
  onPropertyUpdated,
  onShowToast,
  searchTerm,
  onClearSearch,
}) {
  const [plotModalProperty, setPlotModalProperty] = useState(null)

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
        <SearchX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No properties found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {searchTerm
            ? `No properties match your search "${searchTerm}".`
            : 'No active properties in the database.'}
        </p>
        {searchTerm && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 bg-[#0B57D0] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Clear Search
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddPlot={(prop) => setPlotModalProperty(prop)}
          />
        ))}
      </div>

      {plotModalProperty && (
        <PropertyPlotModal
          isOpen={Boolean(plotModalProperty)}
          property={plotModalProperty}
          onClose={() => setPlotModalProperty(null)}
          onPropertyUpdated={(updated) => {
            if (onPropertyUpdated) onPropertyUpdated(updated)
            setPlotModalProperty(updated)
          }}
          onShowToast={onShowToast}
        />
      )}
    </>
  )
}


