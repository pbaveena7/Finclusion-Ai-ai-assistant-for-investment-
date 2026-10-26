import { useState, useEffect } from 'react'
import { getProfile, updateProfile, getProfileSummary } from '../api/client.js'
import { Settings, Save, CheckCircle } from 'lucide-react'

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '55+']
const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', desc: 'Capital safety first. FD, PPF, Debt Funds.' },
  { value: 'moderate', label: 'Moderate', desc: 'Balance growth and stability. Hybrid Funds.' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Higher returns, higher risk. Equity Funds.' },
]
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
]

function formatINR(n) {
  if (!n && n !== 0) return '₹0'
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${Number(n).toLocaleString('en-IN')}`
}

export default function ProfileSettings({ lang, setLang }) {
  const [profile, setProfile] = useState({
    monthly_income: 0, monthly_expenses: 0, current_savings: 0,
    existing_debt: 0, age_range: '26-35', risk_tolerance: 'moderate',
    investment_horizon_years: 5, language: 'en',
  })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      getProfile().then(r => setProfile(r.data)).catch(() => {}),
      getProfileSummary().then(r => setSummary(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      await updateProfile(profile)
      const s = await getProfileSummary()
      setSummary(s.data)
      setLang(profile.language)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to save profile.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 font-mono text-xs text-zinc-500">Loading profile…</div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white text-zinc-900">
        <Settings className="dark:text-zinc-300 text-zinc-700" /> Profile & Settings
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider dark:text-zinc-200 text-zinc-800">Financial Baseline</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Monthly Income (₹)</label>
              <input className="input" type="number" min="0" value={profile.monthly_income} onChange={e => set('monthly_income', parseFloat(e.target.value) || 0)} /></div>
            <div><label className="label">Monthly Expenses (₹)</label>
              <input className="input" type="number" min="0" value={profile.monthly_expenses} onChange={e => set('monthly_expenses', parseFloat(e.target.value) || 0)} /></div>
            <div><label className="label">Current Savings (₹)</label>
              <input className="input" type="number" min="0" value={profile.current_savings} onChange={e => set('current_savings', parseFloat(e.target.value) || 0)} /></div>
            <div><label className="label">Existing Debt (₹)</label>
              <input className="input" type="number" min="0" value={profile.existing_debt} onChange={e => set('existing_debt', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>

        {/* Investment profile */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider dark:text-zinc-200 text-zinc-800">Risk Profile</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-2">
            <div><label className="label">Age Range</label>
              <select className="input font-mono text-xs" value={profile.age_range} onChange={e => set('age_range', e.target.value)}>
                {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div><label className="label">Horizon (years)</label>
              <input className="input" type="number" min="1" max="40" value={profile.investment_horizon_years} onChange={e => set('investment_horizon_years', parseInt(e.target.value) || 5)} />
            </div>
          </div>
          <div>
            <label className="label">Risk Tolerance Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RISK_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('risk_tolerance', opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    profile.risk_tolerance === opt.value 
                      ? 'dark:bg-zinc-100 dark:text-zinc-950 dark:border-white bg-zinc-900 text-white border-zinc-900 font-bold' 
                      : 'dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 bg-zinc-50 border-zinc-200 text-zinc-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className={`text-[10px] mt-1 font-normal ${profile.risk_tolerance === opt.value ? 'opacity-80' : 'opacity-60'}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider dark:text-zinc-200 text-zinc-800">Interface Language</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => set('language', l.code)}
                className={`p-2.5 rounded-lg border text-xs text-left transition-all font-mono ${
                  profile.language === l.code 
                    ? 'dark:bg-zinc-100 dark:text-zinc-950 dark:border-white bg-zinc-900 text-white border-zinc-900 font-bold' 
                    : 'dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs font-mono text-zinc-500">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </form>

      {/* Summary */}
      {summary && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider dark:text-zinc-200 text-zinc-800">Financial Diagnostic</h2>
          <div className="grid grid-cols-3 gap-4 border-b pb-4 dark:border-zinc-800 border-zinc-200">
            {[
              ['Monthly Savings', formatINR(summary.monthly_savings)],
              ['Emergency Target', formatINR(summary.emergency_fund_target)],
              ['Savings Rate', `${summary.savings_rate_pct}%`],
            ].map(([label, val]) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold font-mono dark:text-white text-zinc-900">{val}</div>
                <div className="text-[11px] mt-0.5 dark:text-zinc-400 text-zinc-500">{label}</div>
              </div>
            ))}
          </div>

          <div className="text-xs leading-relaxed dark:text-zinc-300 text-zinc-700">
            <strong className="dark:text-white text-zinc-900">Risk Profile:</strong> {summary.risk_explanation}
          </div>
        </div>
      )}
    </div>
  )
}
