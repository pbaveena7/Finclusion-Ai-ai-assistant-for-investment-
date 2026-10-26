import { useState, useEffect } from 'react'
import { getGoals, createGoal, updateGoal, deleteGoal, getProfileSummary } from '../api/client.js'
import { 
  Target, Plus, Trash2, TrendingUp, Sparkles, AlertCircle, 
  Calendar, ArrowRight, CheckCircle2, ChevronRight, DollarSign,
  PieChart, Shield, Clock, Award, Compass, Zap
} from 'lucide-react'

const CATEGORIES = [
  { name: 'Emergency Fund', icon: '🛡️', returnRate: 6.5, risk: 'Low (Liquid/FD)' },
  { name: 'Retirement Corpus', icon: '🏖️', returnRate: 12.0, risk: 'Moderate-High (Equity/NPS)' },
  { name: 'Real Estate / Home', icon: '🏡', returnRate: 9.0, risk: 'Moderate (Hybrid)' },
  { name: 'Higher Education', icon: '🎓', returnRate: 11.0, risk: 'Moderate-High (Mutual Funds)' },
  { name: 'Vehicle Purchase', icon: '🚗', returnRate: 7.5, risk: 'Low-Moderate (Debt/Arbitrage)' },
  { name: 'Wealth Creation', icon: '🚀', returnRate: 14.0, risk: 'High (Index & Equities)' },
]

function formatINR(n) {
  if (!n && n !== 0) return '₹0'
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return `₹${Math.round(Number(n)).toLocaleString('en-IN')}`
}

export default function GoalPlanner({ lang, setActivePage }) {
  const [goals, setGoals] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    category: 'Emergency Fund',
    target_date: '',
    expected_return_pct: 12
  })
  const [depositAmount, setDepositAmount] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      getGoals().then(r => setGoals(r.data)).catch(() => {}),
      getProfileSummary().then(r => setSummary(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const r = await createGoal({
        name: form.name.trim(),
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount) || 0,
        category: form.category,
        target_date: form.target_date || null,
      })
      setGoals(prev => [r.data, ...prev])
      setShowForm(false)
      setForm({ name: '', target_amount: '', current_amount: '', category: 'Emergency Fund', target_date: '', expected_return_pct: 12 })
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to create dynamic goal.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeposit = async (goal) => {
    const addVal = parseFloat(depositAmount[goal.id])
    if (!addVal || addVal <= 0) return

    try {
      const updatedCur = (goal.current_amount || 0) + addVal
      const res = await updateGoal(goal.id, {
        current_amount: updatedCur
      })
      setGoals(prev => prev.map(g => g.id === goal.id ? res.data : g))
      setDepositAmount(prev => ({ ...prev, [goal.id]: '' }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this financial goal?')) return
    await deleteGoal(id).catch(() => {})
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  // Aggregate metrics
  const totalTarget = goals.reduce((acc, g) => acc + (g.target_amount || 0), 0)
  const totalCurrent = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0
  const totalShortfall = Math.max(0, totalTarget - totalCurrent)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 border border-zinc-700 bg-zinc-900 text-white">
            <Sparkles size={13} /> Advanced Goal Architecture • SIP Compounding & Target Pacing
          </div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-white">
            <Target size={30} className="text-white" />
            Dynamic Goal Planner Pro
          </h1>
          <p className="text-sm text-zinc-300 mt-0.5">
            Real-time compounding simulations, inflation buffers, and SIP monthly allocation strategies.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus size={16} /> Add Dynamic Goal
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <span className="text-xs font-mono uppercase text-zinc-400">Total Portfolio Goal Health</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {formatINR(totalCurrent)} <span className="text-sm font-normal text-zinc-400">of {formatINR(totalTarget)} Target</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Remaining Shortfall to Goal Independence: <strong className="text-white">{formatINR(totalShortfall)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-white">{overallProgress}%</span>
              <div className="text-[11px] font-mono text-zinc-400">Portfolio Completion</div>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-zinc-900 rounded-full h-3.5 overflow-hidden border border-zinc-800">
            <div
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>0% Milestone</span>
            <span>{goals.length} Active Target Schemes</span>
            <span>100% Corpus</span>
          </div>
        </div>

        {/* Diagnostics & Capacity */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-center">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Monthly Surplus Savings</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{formatINR(summary.monthly_savings)}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Discretionary capital capacity</div>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-center">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Target Emergency Fund</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{formatINR(summary.emergency_fund_target)}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">6 months mandatory safety float</div>
            </div>
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-center">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Effective Savings Rate</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{summary.savings_rate_pct}%</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Of gross monthly income</div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Creation Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-bold text-base text-white">Create Advanced Goal Profile</h3>
            <span className="text-xs font-mono text-zinc-400">Parameters with compounding metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Goal Name</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Retirement Freedom Corpus"
              />
            </div>

            <div>
              <label className="label">Category & Asset Class</label>
              <select
                className="input"
                value={form.category}
                onChange={e => {
                  const cat = CATEGORIES.find(c => c.name === e.target.value)
                  setForm(f => ({ ...f, category: e.target.value, expected_return_pct: cat?.returnRate || 12 }))
                }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name} ({c.risk})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Target Amount (₹)</label>
              <input
                className="input font-mono"
                type="number"
                min="100"
                required
                value={form.target_amount}
                onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="label">Current Initial Amount (₹)</label>
              <input
                className="input font-mono"
                type="number"
                min="0"
                value={form.current_amount}
                onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                placeholder="250000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Target Date</label>
              <input
                className="input font-mono"
                type="date"
                required
                value={form.target_date}
                onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating Dynamic Target...' : 'Deploy Goal'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards List */}
      {loading ? (
        <div className="text-center py-12 font-mono text-xs text-zinc-400">Loading goals from database…</div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <Target size={44} className="mx-auto text-zinc-500" />
          <h3 className="text-lg font-bold text-white">No active goals yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click "Add Dynamic Goal" above to create strategic targets with automated compounding and linear monthly pacing.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {goals.map(goal => {
            const remaining = Math.max(0, goal.target_amount - goal.current_amount)
            let monthsRemaining = 12
            let linearMonthlySavings = 0
            let sipRequiredMonthly = 0
            const annualReturnPct = 12.0

            if (goal.target_date) {
              const diffMs = new Date(goal.target_date) - new Date()
              monthsRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4)))
              linearMonthlySavings = Math.round(remaining / monthsRemaining)

              // Compounded SIP Calculation: PMT = FV * (r / ((1+r)^n - 1))
              const r = annualReturnPct / 100 / 12
              const compoundFactor = Math.pow(1 + r, monthsRemaining) - 1
              sipRequiredMonthly = compoundFactor > 0 ? Math.round(remaining * (r / compoundFactor)) : linearMonthlySavings
            }

            const catInfo = CATEGORIES.find(c => c.name === goal.category) || { icon: '🎯', risk: 'Moderate' }

            return (
              <div key={goal.id} className="card space-y-4">
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{catInfo.icon}</span>
                      <h3 className="font-bold text-lg text-white">{goal.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
                        {goal.category}
                      </span>
                    </div>

                    {goal.target_date && (
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1 font-mono">
                        <Calendar size={13} />
                        <span>Deadline: {goal.target_date} ({monthsRemaining} months remaining)</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-500 transition-colors"
                    title="Remove goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress Bar & Corpus Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">Current Accumulation: <strong className="text-white">{formatINR(goal.current_amount)}</strong></span>
                    <span className="text-zinc-400">Target Corpus: <strong className="text-white">{formatINR(goal.target_amount)}</strong></span>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-white h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(goal.progress_pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>{remaining === 0 ? '🎉 Goal Achieved!' : `Shortfall: ${formatINR(remaining)}`}</span>
                    <span>{goal.progress_pct}% reached</span>
                  </div>
                </div>

                {/* Dynamic Smart Pacing Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-zinc-400">Required Monthly SIP (with ~12% Compounding)</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {formatINR(sipRequiredMonthly)} <span className="text-xs font-normal text-zinc-400">/ month</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Invested in matched equities/mutual funds reduces total out-of-pocket savings needed
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono uppercase text-zinc-400">Linear Non-Compounded Pacing</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {formatINR(linearMonthlySavings)} <span className="text-xs font-normal text-zinc-400">/ month</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      In liquid cash or savings accounts without interest
                    </div>
                  </div>
                </div>

                {/* Quick Add Funds Widget */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                  <div className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                    <Zap size={14} className="text-white" />
                    <span>Quick Deposit to Corpus:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Add ₹ amount"
                      value={depositAmount[goal.id] || ''}
                      onChange={e => setDepositAmount({ ...depositAmount, [goal.id]: e.target.value })}
                      className="input py-1 px-3 text-xs font-mono w-36"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeposit(goal)}
                      className="btn-secondary py-1 px-4 text-xs font-mono shrink-0"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
