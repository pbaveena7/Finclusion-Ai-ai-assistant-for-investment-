import { useState } from 'react'
import { TrendingUp, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registerUser, loginUser } from '../api/client.js'

export default function AuthModal({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      let res
      if (isSignUp) {
        res = await registerUser({ email: email.trim(), password, name: name.trim() })
        setSuccessMsg('Account registered successfully! Logging you in...')
      } else {
        res = await loginUser({ email: email.trim(), password })
      }

      const userData = res.data
      localStorage.setItem('finclusion_user', JSON.stringify(userData))
      
      setTimeout(() => {
        if (onLogin) onLogin(userData)
      }, isSignUp ? 800 : 200)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        borderRadius: '1.25rem',
        padding: '2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '1rem',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.25rem'
          }}>
            <TrendingUp size={26} color="#000000" />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#ffffff',
            margin: 0
          }}>
            {isSignUp ? 'Create an Account' : 'Welcome to Finclusion AI'}
          </h2>
          <p style={{
            fontSize: '0.75rem',
            color: '#a1a1aa',
            margin: 0
          }}>
            Unified FinGPT & Financial Literacy Platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid #7f1d1d',
            backgroundColor: '#290808',
            color: '#fca5a5',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid #166534',
            backgroundColor: '#052e16',
            color: '#86efac',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
                Full Name
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <UserCheck size={18} color="#a1a1aa" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma" 
                  required
                  style={{
                    width: '100%',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem 0.75rem 2.85rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    outline: 'none',
                    backgroundColor: '#000000',
                    border: '1px solid #3f3f46',
                    color: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Mail size={18} color="#a1a1aa" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" 
                required
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem 0.75rem 2.85rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  outline: 'none',
                  backgroundColor: '#000000',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Lock size={18} color="#a1a1aa" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                minLength={6}
                style={{
                  width: '100%',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem 0.75rem 2.85rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  outline: 'none',
                  backgroundColor: '#000000',
                  border: '1px solid #3f3f46',
                  color: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {isSignUp && (
              <span style={{ fontSize: '0.6875rem', color: '#a1a1aa' }}>Minimum 6 characters</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <span style={{ color: '#000000', fontWeight: 800, fontSize: '0.9375rem' }}>
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </span>
            <ArrowRight size={16} stroke="#000000" color="#000000" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #27272a', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: 0 }}>
            {isSignUp ? 'Already registered?' : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#ffffff',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#71717a' }}>
          <ShieldCheck size={14} color="#71717a" />
          <span style={{ color: '#71717a' }}>SQLite Database Auth (SHA-256)</span>
        </div>
      </div>
    </div>
  )
}
