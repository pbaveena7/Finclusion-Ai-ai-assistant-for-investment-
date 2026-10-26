import { useState } from 'react'
import { checkFraud } from '../api/client.js'
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'

function RiskBadge({ level }) {
  if (level === 'high') return <span className="badge-high font-mono">HIGH RISK</span>
  if (level === 'medium') return <span className="badge-medium font-mono">MEDIUM RISK</span>
  return <span className="badge-low font-mono">LOW RISK</span>
}

function Indicator({ indicator }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 text-left"
      >
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">{indicator.category}</span>
          <div className="text-xs font-medium text-zinc-200 mt-0.5">Matched: "{indicator.matched_text}"</div>
        </div>
        {open ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>
      {open && (
        <div className="px-4 py-3 bg-zinc-950 text-xs text-zinc-400 border-t border-zinc-850">
          {indicator.description}
        </div>
      )}
    </div>
  )
}

export default function FraudChecker({ lang }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheck = async () => {
    if (!text.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await checkFraud(text)
      setResult(r.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Analysis failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-zinc-300" /> Scam & Fraud Checker
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Heuristic risk evaluation for unsolicited investment promotions, urgency language, and phishing domains.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">Suspicious Message or URL</label>
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            placeholder="Paste text or link to analyze..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-mono">{text.length}/5000 chars</span>
          <button onClick={handleCheck} disabled={loading || !text.trim()} className="btn-primary">
            {loading ? 'Evaluating...' : 'Scan Content'}
          </button>
        </div>
      </div>

      {error && <div className="text-xs text-zinc-400 font-mono">{error}</div>}

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Result</span>
              <div className="text-base font-bold text-white">Score: {result.risk_score} / 100</div>
            </div>
            <RiskBadge level={result.risk_level} />
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{result.summary}</p>

          {result.indicators.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono uppercase text-zinc-400">Indicators ({result.indicators.length})</div>
              {result.indicators.map((ind, i) => <Indicator key={i} indicator={ind} />)}
            </div>
          )}

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  )
}
