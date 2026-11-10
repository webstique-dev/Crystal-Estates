import React, { useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'

const PAYMENT_FOR_OPTIONS = [
  'Token advance',
  'Booking advance',
  'Part payment',
  'Full payment',
  'Registration advance',
]

const MODE_OPTIONS = [
  'UPI',
  'Bank Transfer / RTGS / NEFT',
  'Cheque',
  'Cash',
  'Credit / Debit Card',
]

function formatIndianCurrency(amount) {
  if (!amount || isNaN(amount)) return '₹0'
  const num = Number(amount)
  if (num >= 10000000) {
    const cr = num / 10000000
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`
  }
  if (num >= 100000) {
    const lk = num / 100000
    return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} L`
  }
  return `₹${num.toLocaleString('en-IN')}`
}

export default function RecordPaymentModal({
  isOpen,
  lead,
  paymentForOptions = PAYMENT_FOR_OPTIONS,
  paymentModes = MODE_OPTIONS,
  onClose,
  onSavePayment,
}) {
  const [paymentFor, setPaymentFor] = useState(paymentForOptions[0] || 'Token advance')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState(paymentModes[0] || 'UPI')
  const [referenceNo, setReferenceNo] = useState('')
  const [unitAllotted, setUnitAllotted] = useState(
    lead?.unit && lead.unit !== 'Not allotted' ? lead.unit : ''
  )
  const [sendWhatsApp, setSendWhatsApp] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)
  const [moveLeadToWon, setMoveLeadToWon] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !lead) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    try {
      setSubmitting(true)
      const numAmount = Number(amount)
      const formattedAmount = formatIndianCurrency(numAmount)

      await onSavePayment({
        paymentFor,
        amount: numAmount,
        amountFormatted: formattedAmount,
        mode,
        referenceNo: referenceNo.trim(),
        unitAllotted: unitAllotted.trim() || (lead.unit !== 'Not allotted' ? lead.unit : ''),
        sendWhatsApp,
        sendEmail,
        moveLeadToWon,
      })
      onClose()
    } catch (err) {
      console.error('Failed to record payment:', err)
      alert(err.message || 'Error recording payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Record advance payment
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Log a booking, token or milestone payment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Customer
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`${lead.name}${lead.property ? ` · ${lead.property}` : ''}`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-default focus:outline-none pr-8"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 1: Payment for & Amount */}
          <div className="grid grid-cols-2 gap-3">
            {/* Payment for */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment for
              </label>
              <div className="relative">
                <select
                  value={paymentFor}
                  onChange={(e) => setPaymentFor(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {PAYMENT_FOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 200000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 2: Mode & Reference no. */}
          <div className="grid grid-cols-2 gap-3">
            {/* Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mode
              </label>
              <div className="relative">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white cursor-pointer pr-8"
                >
                  {MODE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Reference no. */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reference no.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. UPI 2114 6215 4997 or Cheque #123456"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 3: Unit allotted */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Unit allotted
            </label>
            <input
              type="text"
              value={unitAllotted}
              onChange={(e) => setUnitAllotted(e.target.value)}
              placeholder="e.g. Plot #12 or Unit 4B"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
            />
          </div>

          {/* Checkboxes Row */}
          <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B57D0] focus:ring-[#0B57D0]"
              />
              <span>Send receipt on WhatsApp</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B57D0] focus:ring-[#0B57D0]"
              />
              <span>Email receipt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={moveLeadToWon}
                onChange={(e) => setMoveLeadToWon(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B57D0] focus:ring-[#0B57D0]"
              />
              <span>Move lead to Won</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Save payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

