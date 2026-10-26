import { useState } from 'react'
import { calcSIP, calcSWP, calcPPF, calcNPS } from '../api/client.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calculator } from 'lucide-react'

function ResultCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 border transition-all ${
      highlight 
        ? 'bg-zinc-900 border-zinc-600 text-white' 
        : 'bg-black border-zinc-800 text-white'
    }`}>
      <div className="text-[11px] font-mono uppercase tracking-wider mb-1 text-zinc-300">{label}</div>
      <div className="text-xl font-bold font-mono tracking-tight text-white">{value}</div>
    </div>
  )
}

function formatINR(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function SIPTab() {
  const [form, setForm] = useState({ monthly_investment: 5000, annual_return_pct: 12, duration_months: 120 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await calcSIP(form)
      setResult(r.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Calculation failed.')
    } finally { setLoading(false) }
  }

  const chartData = result ? Array.from({ length: Math.ceil(result.duration_months / 12) }, (_, i) => {
    const months = (i + 1) * 12
    const r = result.annual_return_pct / 100 / 12
    const fv = result.annual_return_pct === 0
      ? result.monthly_investment * months
      : result.monthly_investment * (((1 + r) ** months - 1) / r) * (1 + r)
    return { year: `Y${i + 1}`, invested: result.monthly_investment * months, value: Math.round(fv) }
  }) : []

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <div><label className="label">Monthly Investment (₹)</label>
          <input className="input" type="number" min="1" value={form.monthly_investment} onChange={e => set('monthly_investment', e.target.value)} /></div>
        <div><label className="label">Annual Return (%)</label>
          <input className="input" type="number" min="0" max="100" step="0.1" value={form.annual_return_pct} onChange={e => set('annual_return_pct', e.target.value)} /></div>
        <div><label className="label">Duration (months)</label>
          <input className="input" type="number" min="1" max="600" value={form.duration_months} onChange={e => set('duration_months', e.target.value)} /></div>
        <div className="md:col-span-3">
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Calculating…' : 'Calculate SIP'}</button>
        </div>
      </form>
      {error && <div className="text-zinc-400 font-mono text-xs">{error}</div>}
      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label="Total Invested" value={formatINR(result.total_invested)} />
            <ResultCard label="Estimated Future Value" value={formatINR(result.estimated_future_value)} highlight />
            <ResultCard label="Estimated Gains" value={formatINR(result.estimated_gains)} />
          </div>
          {chartData.length > 0 && (
            <div className="card bg-zinc-950 border-zinc-850 p-5">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4">Compounded Growth Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#71717a' }} stroke="#3f3f46" />
                  <YAxis tickFormatter={v => v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : v} tick={{ fontSize: 11, fill: '#71717a' }} stroke="#3f3f46" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v, n) => [formatINR(v), n === 'value' ? 'Future Value' : 'Invested']} 
                  />
                  <Area type="monotone" dataKey="invested" stackId="1" fill="#27272a" stroke="#52525b" />
                  <Area type="monotone" dataKey="value" stackId="2" fill="#d4d4d8" stroke="#ffffff" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="text-[11px] text-zinc-500 font-mono">⚠️ {result.disclaimer}</p>
        </>
      )}
    </div>
  )
}

function SWPTab() {
  const [form, setForm] = useState({ initial_investment: 500000, monthly_withdrawal: 3000, annual_return_pct: 8, duration_months: 60 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    try { const r = await calcSWP(form); setResult(r.data) }
    catch (e) { setError(e?.response?.data?.detail || 'Calculation failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div><label className="label">Initial Investment (₹)</label><input className="input" type="number" min="1" value={form.initial_investment} onChange={e => set('initial_investment', e.target.value)} /></div>
        <div><label className="label">Monthly Withdrawal (₹)</label><input className="input" type="number" min="0" value={form.monthly_withdrawal} onChange={e => set('monthly_withdrawal', e.target.value)} /></div>
        <div><label className="label">Annual Return (%)</label><input className="input" type="number" min="0" max="100" step="0.1" value={form.annual_return_pct} onChange={e => set('annual_return_pct', e.target.value)} /></div>
        <div><label className="label">Duration (months)</label><input className="input" type="number" min="1" max="600" value={form.duration_months} onChange={e => set('duration_months', e.target.value)} /></div>
        <div className="md:col-span-2"><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Calculating…' : 'Calculate SWP'}</button></div>
      </form>
      {error && <div className="text-zinc-400 font-mono text-xs">{error}</div>}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ResultCard label="Initial Corpus" value={formatINR(result.initial_investment)} />
          <ResultCard label="Remaining Balance" value={formatINR(result.estimated_remaining_balance)} highlight />
          <ResultCard label="Total Withdrawn" value={formatINR(result.total_withdrawn)} />
        </div>
      )}
    </div>
  )
}

function PPFTab() {
  const [form, setForm] = useState({ annual_investment: 100000, duration_years: 15, assumed_annual_rate_pct: 7.1 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    try { const r = await calcPPF(form); setResult(r.data) }
    catch (e) { setError(e?.response?.data?.detail || 'Calculation failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <div><label className="label">Annual Investment (₹, max ₹1.5L)</label><input className="input" type="number" min="500" max="150000" value={form.annual_investment} onChange={e => set('annual_investment', e.target.value)} /></div>
        <div><label className="label">Duration (years, min 15)</label><input className="input" type="number" min="15" max="50" value={form.duration_years} onChange={e => set('duration_years', e.target.value)} /></div>
        <div><label className="label">Assumed Rate (%)</label><input className="input" type="number" min="0.1" max="20" step="0.1" value={form.assumed_annual_rate_pct} onChange={e => set('assumed_annual_rate_pct', e.target.value)} /></div>
        <div className="md:col-span-3"><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Calculating…' : 'Calculate PPF'}</button></div>
      </form>
      {error && <div className="text-zinc-400 font-mono text-xs">{error}</div>}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ResultCard label="Total Invested" value={formatINR(result.total_invested)} />
          <ResultCard label="Maturity Value" value={formatINR(result.estimated_maturity_value)} highlight />
          <ResultCard label="Interest Earned" value={formatINR(result.estimated_interest_earned)} />
        </div>
      )}
    </div>
  )
}

function NPSTab() {
  const [form, setForm] = useState({ monthly_contribution: 5000, duration_years: 25, assumed_annual_return_pct: 10 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null)
    try { const r = await calcNPS(form); setResult(r.data) }
    catch (e) { setError(e?.response?.data?.detail || 'Calculation failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
        <div><label className="label">Monthly Contribution (₹)</label><input className="input" type="number" min="500" value={form.monthly_contribution} onChange={e => set('monthly_contribution', e.target.value)} /></div>
        <div><label className="label">Duration (years)</label><input className="input" type="number" min="1" max="40" value={form.duration_years} onChange={e => set('duration_years', e.target.value)} /></div>
        <div><label className="label">Expected Return (%)</label><input className="input" type="number" min="0" max="30" step="0.5" value={form.assumed_annual_return_pct} onChange={e => set('assumed_annual_return_pct', e.target.value)} /></div>
        <div className="md:col-span-3"><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Calculating…' : 'Calculate NPS'}</button></div>
      </form>
      {error && <div className="text-zinc-400 font-mono text-xs">{error}</div>}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Total Contributed" value={formatINR(result.total_contributed)} />
          <ResultCard label="Estimated Corpus" value={formatINR(result.estimated_corpus)} highlight />
          <ResultCard label="Lump Sum (60%)" value={formatINR(result.estimated_lump_sum_60pct)} />
          <ResultCard label="Annuity (40%)" value={formatINR(result.estimated_annuity_corpus_40pct)} />
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'sip', label: 'SIP', Component: SIPTab },
  { id: 'swp', label: 'SWP', Component: SWPTab },
  { id: 'ppf', label: 'PPF', Component: PPFTab },
  { id: 'nps', label: 'NPS', Component: NPSTab },
]

export default function Calculators({ lang }) {
  const [activeTab, setActiveTab] = useState('sip')
  const active = TABS.find(t => t.id === activeTab)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Calculator className="text-zinc-300" /> Financial Calculators
      </h1>
      <div className="card">
        <div className="flex gap-2 mb-6 border-b border-zinc-850 pb-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === t.id 
                  ? 'bg-zinc-100 text-zinc-950 font-bold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {active && <active.Component />}
      </div>
    </div>
  )
}
