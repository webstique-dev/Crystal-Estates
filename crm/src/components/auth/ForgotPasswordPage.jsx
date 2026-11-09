import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Building2,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword, resetPassword } = useAuth()

  // Step 1: 'request' | Step 2: 'reset' | Step 3: 'success'
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  // Step 1: Request Password Reset
  const handleRequestReset = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please provide your registered email address.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await forgotPassword(email.trim())
      if (res.success) {
        setResetToken(res.resetToken || '')
        setOtp(res.otp || '')
        setInfoMessage(
          res.otp
            ? `Verification code generated: ${res.otp}`
            : 'Password reset link sent to your email.'
        )
        setStep('reset')
      }
    } catch (err) {
      setError(err.message || 'No account found with this email.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Submit New Password
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await resetPassword({
        email: email.trim(),
        resetToken,
        otp,
        newPassword,
      })
      if (res.success) {
        setStep('success')
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B57D0] text-white shadow-md mb-3.5">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Crystal Estates secure account recovery
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-7 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {infoMessage && step === 'reset' && (
            <div className="mb-5 p-3.5 bg-blue-50 border border-blue-200 text-[#0B57D0] text-xs rounded-xl font-medium animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0B57D0] shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: REQUEST RESET LINK */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Enter your administrator email address below. We'll send you a password recovery verification code to reset your account.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="admin@crystalestates.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                <span>{loading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* STEP 2: ENTER NEW PASSWORD & OTP */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 482910"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0B57D0] focus:bg-white transition"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your password has been securely updated. You can now log into your Crystal Estates CRM account.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-[#0B57D0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
              >
                Sign In Now
              </button>
            </div>
          )}

          {/* Back to Login link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B57D0] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

