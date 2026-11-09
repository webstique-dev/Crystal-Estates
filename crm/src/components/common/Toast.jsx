import React from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  const isSuccess = type === 'success'

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-in slide-in-from-bottom-5 border border-slate-700/50">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
      )}
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white p-0.5 rounded transition"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

